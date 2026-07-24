
-- =========================================================
-- FASA 1: Sistem Pengurusan Madrasah — skema teras + RLS
-- =========================================================

-- ---------- ENUMS ----------
CREATE TYPE public.app_role AS ENUM ('admin', 'guru', 'ibu_bapa');
CREATE TYPE public.user_status AS ENUM ('aktif', 'tidak_aktif');
CREATE TYPE public.jantina AS ENUM ('lelaki', 'perempuan');
CREATE TYPE public.student_status AS ENUM ('aktif', 'tamat', 'berhenti');
CREATE TYPE public.hubungan_penjaga AS ENUM ('bapa', 'ibu', 'penjaga');
CREATE TYPE public.attendance_status AS ENUM ('hadir', 'lewat', 'tidak_hadir', 'cuti');
CREATE TYPE public.hafazan_jenis AS ENUM ('hafazan_baru', 'murajaah');
CREATE TYPE public.gred_hafazan AS ENUM ('mumtaz', 'jayyid_jiddan', 'jayyid', 'dhaif');
CREATE TYPE public.tilawah_jenis AS ENUM ('iqra', 'quran');
CREATE TYPE public.behaviour_jenis AS ENUM ('merit', 'demerit');
CREATE TYPE public.fee_jenis AS ENUM ('bulanan', 'sekali');
CREATE TYPE public.invoice_status AS ENUM ('belum_bayar', 'sudah_bayar', 'tertunggak');
CREATE TYPE public.announcement_target AS ENUM ('semua', 'kelas', 'individu');

-- ---------- Helper: updated_at ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status public.user_status NOT NULL DEFAULT 'aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- USER_ROLES (berasingan — elak privilege escalation)
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =========================================================
-- CLASSES
-- =========================================================
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kelas TEXT NOT NULL,
  tingkatan TEXT NOT NULL,
  guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tahun INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_classes_updated BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- STUDENTS
-- =========================================================
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  no_kp TEXT UNIQUE,
  tarikh_lahir DATE,
  jantina public.jantina,
  kelas_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  tahun_masuk INT,
  status public.student_status NOT NULL DEFAULT 'aktif',
  gambar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- PARENTS ↔ STUDENTS
-- =========================================================
CREATE TABLE public.parents_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  hubungan public.hubungan_penjaga NOT NULL DEFAULT 'penjaga',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parents_students TO authenticated;
GRANT ALL ON public.parents_students TO service_role;
ALTER TABLE public.parents_students ENABLE ROW LEVEL SECURITY;

-- Helper: adakah ibu bapa ini pemilik pelajar ini?
CREATE OR REPLACE FUNCTION public.is_parent_of(_student_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parents_students
    WHERE student_id = _student_id AND parent_id = auth.uid()
  )
$$;

-- Helper: adakah guru semasa mengajar kelas pelajar ini?
CREATE OR REPLACE FUNCTION public.is_teacher_of(_student_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.classes c ON c.id = s.kelas_id
    WHERE s.id = _student_id AND c.guru_id = auth.uid()
  )
$$;

-- =========================================================
-- SUBJECTS
-- =========================================================
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_subjek TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- ATTENDANCE
-- =========================================================
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  tarikh DATE NOT NULL,
  status public.attendance_status NOT NULL,
  sebab TEXT,
  direkod_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, tarikh)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_attendance_updated BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- HAFAZAN
-- =========================================================
CREATE TABLE public.hafazan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  surah TEXT NOT NULL,
  ayat_mula INT NOT NULL,
  ayat_akhir INT NOT NULL,
  jenis public.hafazan_jenis NOT NULL,
  gred public.gred_hafazan,
  catatan TEXT,
  tarikh DATE NOT NULL DEFAULT CURRENT_DATE,
  guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hafazan TO authenticated;
GRANT ALL ON public.hafazan TO service_role;
ALTER TABLE public.hafazan ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- TILAWAH
-- =========================================================
CREATE TABLE public.tilawah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  jenis public.tilawah_jenis NOT NULL,
  muka_surat INT,
  juzuk INT,
  gred public.gred_hafazan,
  tarikh DATE NOT NULL DEFAULT CURRENT_DATE,
  guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tilawah TO authenticated;
GRANT ALL ON public.tilawah TO service_role;
ALTER TABLE public.tilawah ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- EXAMS + EXAM_RESULTS
-- =========================================================
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_peperiksaan TEXT NOT NULL,
  penggal INT NOT NULL,
  tahun INT NOT NULL,
  tarikh_mula DATE,
  tarikh_tamat DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams TO authenticated;
GRANT ALL ON public.exams TO service_role;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  markah NUMERIC(5,2),
  gred TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (exam_id, student_id, subject_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_results TO authenticated;
GRANT ALL ON public.exam_results TO service_role;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_exam_results_updated BEFORE UPDATE ON public.exam_results
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- BEHAVIOUR
-- =========================================================
CREATE TABLE public.behaviour (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  jenis public.behaviour_jenis NOT NULL,
  mata INT NOT NULL DEFAULT 0,
  catatan TEXT,
  tarikh DATE NOT NULL DEFAULT CURRENT_DATE,
  guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.behaviour TO authenticated;
GRANT ALL ON public.behaviour TO service_role;
ALTER TABLE public.behaviour ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- FEES + INVOICES
-- =========================================================
CREATE TABLE public.fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_yuran TEXT NOT NULL,
  amaun NUMERIC(10,2) NOT NULL,
  jenis public.fee_jenis NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fees TO authenticated;
GRANT ALL ON public.fees TO service_role;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_id UUID NOT NULL REFERENCES public.fees(id) ON DELETE RESTRICT,
  bulan INT,
  tahun INT NOT NULL,
  amaun NUMERIC(10,2) NOT NULL,
  status public.invoice_status NOT NULL DEFAULT 'belum_bayar',
  tarikh_bayar DATE,
  rujukan_bayaran TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- ANNOUNCEMENTS
-- =========================================================
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tajuk TEXT NOT NULL,
  kandungan TEXT NOT NULL,
  target public.announcement_target NOT NULL DEFAULT 'semua',
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  tarikh DATE NOT NULL DEFAULT CURRENT_DATE,
  lampiran_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- MESSAGES
-- =========================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  mesej TEXT NOT NULL,
  dibaca BOOLEAN NOT NULL DEFAULT false,
  tarikh TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- EVENTS
-- =========================================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tajuk TEXT NOT NULL,
  keterangan TEXT,
  tarikh_mula TIMESTAMPTZ NOT NULL,
  tarikh_tamat TIMESTAMPTZ,
  lokasi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- TRIGGER: auto-cipta profile pada pendaftaran
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  -- Default role: ibu_bapa (admin akan naik taraf jika perlu)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'ibu_bapa');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- ---------- profiles ----------
CREATE POLICY "own profile read" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin all profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "guru read profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'guru'));

-- ---------- user_roles ----------
CREATE POLICY "own roles read" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- classes ----------
CREATE POLICY "authenticated read classes" ON public.classes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage classes" ON public.classes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- students ----------
CREATE POLICY "admin all students" ON public.students
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "guru read students" ON public.students
  FOR SELECT USING (public.has_role(auth.uid(), 'guru'));
CREATE POLICY "parent read own children" ON public.students
  FOR SELECT USING (public.is_parent_of(id));

-- ---------- parents_students ----------
CREATE POLICY "admin manage parents_students" ON public.parents_students
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "parent read own link" ON public.parents_students
  FOR SELECT USING (parent_id = auth.uid());
CREATE POLICY "guru read links" ON public.parents_students
  FOR SELECT USING (public.has_role(auth.uid(), 'guru'));

-- ---------- subjects ----------
CREATE POLICY "authenticated read subjects" ON public.subjects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage subjects" ON public.subjects
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- attendance ----------
CREATE POLICY "admin all attendance" ON public.attendance
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "guru manage attendance" ON public.attendance
  FOR ALL USING (public.has_role(auth.uid(), 'guru'))
  WITH CHECK (public.has_role(auth.uid(), 'guru'));
CREATE POLICY "parent read attendance" ON public.attendance
  FOR SELECT USING (public.is_parent_of(student_id));

-- ---------- hafazan ----------
CREATE POLICY "admin all hafazan" ON public.hafazan
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "guru manage hafazan" ON public.hafazan
  FOR ALL USING (public.has_role(auth.uid(), 'guru'))
  WITH CHECK (public.has_role(auth.uid(), 'guru'));
CREATE POLICY "parent read hafazan" ON public.hafazan
  FOR SELECT USING (public.is_parent_of(student_id));

-- ---------- tilawah ----------
CREATE POLICY "admin all tilawah" ON public.tilawah
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "guru manage tilawah" ON public.tilawah
  FOR ALL USING (public.has_role(auth.uid(), 'guru'))
  WITH CHECK (public.has_role(auth.uid(), 'guru'));
CREATE POLICY "parent read tilawah" ON public.tilawah
  FOR SELECT USING (public.is_parent_of(student_id));

-- ---------- exams ----------
CREATE POLICY "authenticated read exams" ON public.exams
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage exams" ON public.exams
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- exam_results ----------
CREATE POLICY "admin all exam_results" ON public.exam_results
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "guru manage exam_results" ON public.exam_results
  FOR ALL USING (public.has_role(auth.uid(), 'guru'))
  WITH CHECK (public.has_role(auth.uid(), 'guru'));
CREATE POLICY "parent read exam_results" ON public.exam_results
  FOR SELECT USING (public.is_parent_of(student_id));

-- ---------- behaviour ----------
CREATE POLICY "admin all behaviour" ON public.behaviour
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "guru manage behaviour" ON public.behaviour
  FOR ALL USING (public.has_role(auth.uid(), 'guru'))
  WITH CHECK (public.has_role(auth.uid(), 'guru'));
CREATE POLICY "parent read behaviour" ON public.behaviour
  FOR SELECT USING (public.is_parent_of(student_id));

-- ---------- fees ----------
CREATE POLICY "authenticated read fees" ON public.fees
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage fees" ON public.fees
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- invoices ----------
CREATE POLICY "admin all invoices" ON public.invoices
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "parent read invoices" ON public.invoices
  FOR SELECT USING (public.is_parent_of(student_id));
CREATE POLICY "guru read invoices" ON public.invoices
  FOR SELECT USING (public.has_role(auth.uid(), 'guru'));

-- ---------- announcements ----------
CREATE POLICY "authenticated read announcements" ON public.announcements
  FOR SELECT TO authenticated USING (
    target = 'semua'
    OR (target = 'kelas' AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'guru')
      OR EXISTS (
        SELECT 1 FROM public.students s
        JOIN public.parents_students ps ON ps.student_id = s.id
        WHERE s.kelas_id = announcements.class_id AND ps.parent_id = auth.uid()
      )
    ))
    OR (target = 'individu' AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'guru')
      OR public.is_parent_of(student_id)
    ))
  );
CREATE POLICY "admin manage announcements" ON public.announcements
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "guru create announcements" ON public.announcements
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'guru'));

-- ---------- messages ----------
CREATE POLICY "read own messages" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "update own received" ON public.messages
  FOR UPDATE USING (receiver_id = auth.uid());
CREATE POLICY "admin all messages" ON public.messages
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- events ----------
CREATE POLICY "authenticated read events" ON public.events
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage events" ON public.events
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- Indexes ----------
CREATE INDEX idx_students_kelas ON public.students(kelas_id);
CREATE INDEX idx_ps_parent ON public.parents_students(parent_id);
CREATE INDEX idx_ps_student ON public.parents_students(student_id);
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, tarikh);
CREATE INDEX idx_hafazan_student ON public.hafazan(student_id, tarikh);
CREATE INDEX idx_tilawah_student ON public.tilawah(student_id, tarikh);
CREATE INDEX idx_exam_results_student ON public.exam_results(student_id);
CREATE INDEX idx_behaviour_student ON public.behaviour(student_id, tarikh);
CREATE INDEX idx_invoices_student ON public.invoices(student_id, tahun, bulan);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id, dibaca);
