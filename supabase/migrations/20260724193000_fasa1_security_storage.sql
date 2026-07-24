BEGIN;

-- =========================================================
-- FASA 1: Pengerasan RLS, validasi dan Supabase Storage
-- =========================================================

-- ---------- Validasi data ----------
ALTER TABLE public.classes
  ADD CONSTRAINT classes_tahun_check CHECK (tahun BETWEEN 2000 AND 2100);

ALTER TABLE public.students
  ADD CONSTRAINT students_tahun_masuk_check
  CHECK (tahun_masuk IS NULL OR tahun_masuk BETWEEN 2000 AND 2100);

ALTER TABLE public.hafazan
  ADD CONSTRAINT hafazan_ayat_check
  CHECK (ayat_mula > 0 AND ayat_akhir >= ayat_mula);

ALTER TABLE public.tilawah
  ADD CONSTRAINT tilawah_muka_surat_check
  CHECK (muka_surat IS NULL OR muka_surat > 0),
  ADD CONSTRAINT tilawah_juzuk_check
  CHECK (juzuk IS NULL OR juzuk BETWEEN 1 AND 30);

ALTER TABLE public.exams
  ADD CONSTRAINT exams_penggal_check CHECK (penggal > 0),
  ADD CONSTRAINT exams_tarikh_check
  CHECK (tarikh_tamat IS NULL OR tarikh_mula IS NULL OR tarikh_tamat >= tarikh_mula);

ALTER TABLE public.exam_results
  ADD CONSTRAINT exam_results_markah_check
  CHECK (markah IS NULL OR markah BETWEEN 0 AND 100);

ALTER TABLE public.behaviour
  ADD CONSTRAINT behaviour_mata_check CHECK (mata >= 0);

ALTER TABLE public.fees
  ADD CONSTRAINT fees_amaun_check CHECK (amaun > 0);

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_bulan_check CHECK (bulan IS NULL OR bulan BETWEEN 1 AND 12),
  ADD CONSTRAINT invoices_tahun_check CHECK (tahun BETWEEN 2000 AND 2100),
  ADD CONSTRAINT invoices_amaun_check CHECK (amaun >= 0);

ALTER TABLE public.announcements
  ADD CONSTRAINT announcements_target_check CHECK (
    (target = 'semua' AND class_id IS NULL AND student_id IS NULL)
    OR (target = 'kelas' AND class_id IS NOT NULL AND student_id IS NULL)
    OR (target = 'individu' AND student_id IS NOT NULL)
  );

ALTER TABLE public.events
  ADD CONSTRAINT events_tarikh_check
  CHECK (tarikh_tamat IS NULL OR tarikh_tamat >= tarikh_mula);

-- ---------- Helper keselamatan ----------
CREATE OR REPLACE FUNCTION public.is_teacher_of_class(_class_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classes
    WHERE id = _class_id AND guru_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_parent_of_class(_class_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.parents_students ps
    JOIN public.students s ON s.id = ps.student_id
    WHERE ps.parent_id = auth.uid() AND s.kelas_id = _class_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_of_parent(_parent_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.parents_students ps
    JOIN public.students s ON s.id = ps.student_id
    JOIN public.classes c ON c.id = s.kelas_id
    WHERE ps.parent_id = _parent_id AND c.guru_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_parent_of_teacher(_teacher_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.parents_students ps
    JOIN public.students s ON s.id = ps.student_id
    JOIN public.classes c ON c.id = s.kelas_id
    WHERE ps.parent_id = auth.uid() AND c.guru_id = _teacher_id
  )
$$;

CREATE OR REPLACE FUNCTION public.can_message(_receiver_id UUID, _student_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN TRUE;
  END IF;

  IF public.has_role(auth.uid(), 'guru') THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.parents_students ps
      JOIN public.students s ON s.id = ps.student_id
      JOIN public.classes c ON c.id = s.kelas_id
      WHERE ps.parent_id = _receiver_id
        AND c.guru_id = auth.uid()
        AND (_student_id IS NULL OR ps.student_id = _student_id)
    );
  END IF;

  IF public.has_role(auth.uid(), 'ibu_bapa') THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.parents_students ps
      JOIN public.students s ON s.id = ps.student_id
      JOIN public.classes c ON c.id = s.kelas_id
      WHERE ps.parent_id = auth.uid()
        AND c.guru_id = _receiver_id
        AND (_student_id IS NULL OR ps.student_id = _student_id)
    );
  END IF;

  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.storage_path_uuid(_name TEXT, _position INT DEFAULT 1)
RETURNS UUID
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN split_part(_name, '/', _position)::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_teacher_of_class(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_parent_of_class(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_teacher_of_parent(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_parent_of_teacher(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_message(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.storage_path_uuid(TEXT, INT) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_teacher_of_class(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_parent_of_class(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_teacher_of_parent(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_parent_of_teacher(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_message(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.storage_path_uuid(TEXT, INT) TO authenticated;

-- ---------- Profiles ----------
DROP POLICY IF EXISTS "guru read profiles" ON public.profiles;
CREATE POLICY "guru read related profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR (
      public.has_role(auth.uid(), 'guru')
      AND public.is_teacher_of_parent(id)
    )
  );

CREATE POLICY "parent read related teachers" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR (
      public.has_role(auth.uid(), 'ibu_bapa')
      AND public.is_parent_of_teacher(id)
    )
  );

-- ---------- Classes ----------
DROP POLICY IF EXISTS "authenticated read classes" ON public.classes;
CREATE POLICY "guru read own classes" ON public.classes
  FOR SELECT USING (public.is_teacher_of_class(id));
CREATE POLICY "parent read child classes" ON public.classes
  FOR SELECT USING (public.is_parent_of_class(id));

-- ---------- Students ----------
DROP POLICY IF EXISTS "guru read students" ON public.students;
CREATE POLICY "guru read assigned students" ON public.students
  FOR SELECT USING (public.is_teacher_of(id));

-- ---------- Parent-student links ----------
DROP POLICY IF EXISTS "guru read links" ON public.parents_students;
CREATE POLICY "guru read related links" ON public.parents_students
  FOR SELECT USING (public.is_teacher_of(student_id));

-- ---------- Attendance ----------
DROP POLICY IF EXISTS "guru manage attendance" ON public.attendance;
CREATE POLICY "guru manage assigned attendance" ON public.attendance
  FOR ALL USING (public.is_teacher_of(student_id))
  WITH CHECK (public.is_teacher_of(student_id));

-- ---------- Hafazan ----------
DROP POLICY IF EXISTS "guru manage hafazan" ON public.hafazan;
CREATE POLICY "guru manage assigned hafazan" ON public.hafazan
  FOR ALL USING (public.is_teacher_of(student_id))
  WITH CHECK (public.is_teacher_of(student_id));

-- ---------- Tilawah ----------
DROP POLICY IF EXISTS "guru manage tilawah" ON public.tilawah;
CREATE POLICY "guru manage assigned tilawah" ON public.tilawah
  FOR ALL USING (public.is_teacher_of(student_id))
  WITH CHECK (public.is_teacher_of(student_id));

-- ---------- Exam results ----------
DROP POLICY IF EXISTS "guru manage exam_results" ON public.exam_results;
CREATE POLICY "guru manage assigned exam_results" ON public.exam_results
  FOR ALL USING (public.is_teacher_of(student_id))
  WITH CHECK (public.is_teacher_of(student_id));

-- ---------- Behaviour ----------
DROP POLICY IF EXISTS "guru manage behaviour" ON public.behaviour;
CREATE POLICY "guru manage assigned behaviour" ON public.behaviour
  FOR ALL USING (public.is_teacher_of(student_id))
  WITH CHECK (public.is_teacher_of(student_id));

-- ---------- Invoices ----------
DROP POLICY IF EXISTS "guru read invoices" ON public.invoices;
CREATE POLICY "guru read assigned invoices" ON public.invoices
  FOR SELECT USING (public.is_teacher_of(student_id));

-- ---------- Announcements ----------
DROP POLICY IF EXISTS "authenticated read announcements" ON public.announcements;
DROP POLICY IF EXISTS "guru create announcements" ON public.announcements;

CREATE POLICY "guru read related announcements" ON public.announcements
  FOR SELECT USING (
    public.has_role(auth.uid(), 'guru')
    AND (
      target = 'semua'
      OR (target = 'kelas' AND public.is_teacher_of_class(class_id))
      OR (target = 'individu' AND public.is_teacher_of(student_id))
    )
  );

CREATE POLICY "parent read related announcements" ON public.announcements
  FOR SELECT USING (
    public.has_role(auth.uid(), 'ibu_bapa')
    AND (
      target = 'semua'
      OR (target = 'kelas' AND public.is_parent_of_class(class_id))
      OR (target = 'individu' AND public.is_parent_of(student_id))
    )
  );

CREATE POLICY "guru create related announcements" ON public.announcements
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND public.has_role(auth.uid(), 'guru')
    AND (
      (target = 'kelas' AND public.is_teacher_of_class(class_id))
      OR (target = 'individu' AND public.is_teacher_of(student_id))
    )
  );

-- ---------- Messages ----------
REVOKE UPDATE, DELETE ON public.messages FROM authenticated;
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT UPDATE (dibaca) ON public.messages TO authenticated;

DROP POLICY IF EXISTS "send messages" ON public.messages;
DROP POLICY IF EXISTS "update own received" ON public.messages;

CREATE POLICY "send related messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND public.can_message(receiver_id, student_id)
  );

CREATE POLICY "mark own received messages" ON public.messages
  FOR UPDATE USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- ---------- Storage ----------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'student-photos',
    'student-photos',
    FALSE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'class-activities',
    'class-activities',
    FALSE,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "related users read student photos" ON storage.objects;
DROP POLICY IF EXISTS "admin manage student photos" ON storage.objects;
DROP POLICY IF EXISTS "related users read class activities" ON storage.objects;
DROP POLICY IF EXISTS "teacher manage class activities" ON storage.objects;

CREATE POLICY "related users read student photos" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'student-photos'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.is_teacher_of(public.storage_path_uuid(name))
      OR public.is_parent_of(public.storage_path_uuid(name))
    )
  );

CREATE POLICY "admin manage student photos" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'student-photos'
    AND public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    bucket_id = 'student-photos'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "related users read class activities" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'class-activities'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.is_teacher_of_class(public.storage_path_uuid(name))
      OR public.is_parent_of_class(public.storage_path_uuid(name))
    )
  );

CREATE POLICY "teacher manage class activities" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'class-activities'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.is_teacher_of_class(public.storage_path_uuid(name))
    )
  )
  WITH CHECK (
    bucket_id = 'class-activities'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.is_teacher_of_class(public.storage_path_uuid(name))
    )
  );

CREATE INDEX IF NOT EXISTS idx_classes_guru ON public.classes(guru_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_announcements_class ON public.announcements(class_id, tarikh);
CREATE INDEX IF NOT EXISTS idx_announcements_student ON public.announcements(student_id, tarikh);

COMMIT;
