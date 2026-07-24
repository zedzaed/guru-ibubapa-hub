export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          class_id: string | null
          created_at: string
          created_by: string | null
          id: string
          kandungan: string
          lampiran_url: string | null
          student_id: string | null
          tajuk: string
          target: Database["public"]["Enums"]["announcement_target"]
          tarikh: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kandungan: string
          lampiran_url?: string | null
          student_id?: string | null
          tajuk: string
          target?: Database["public"]["Enums"]["announcement_target"]
          tarikh?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kandungan?: string
          lampiran_url?: string | null
          student_id?: string | null
          tajuk?: string
          target?: Database["public"]["Enums"]["announcement_target"]
          tarikh?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string
          direkod_oleh: string | null
          id: string
          sebab: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          tarikh: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          direkod_oleh?: string | null
          id?: string
          sebab?: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          tarikh: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          direkod_oleh?: string | null
          id?: string
          sebab?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          tarikh?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_direkod_oleh_fkey"
            columns: ["direkod_oleh"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      behaviour: {
        Row: {
          catatan: string | null
          created_at: string
          guru_id: string | null
          id: string
          jenis: Database["public"]["Enums"]["behaviour_jenis"]
          mata: number
          student_id: string
          tarikh: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          guru_id?: string | null
          id?: string
          jenis: Database["public"]["Enums"]["behaviour_jenis"]
          mata?: number
          student_id: string
          tarikh?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          guru_id?: string | null
          id?: string
          jenis?: Database["public"]["Enums"]["behaviour_jenis"]
          mata?: number
          student_id?: string
          tarikh?: string
        }
        Relationships: [
          {
            foreignKeyName: "behaviour_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behaviour_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          guru_id: string | null
          id: string
          nama_kelas: string
          tahun: number
          tingkatan: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guru_id?: string | null
          id?: string
          nama_kelas: string
          tahun: number
          tingkatan: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guru_id?: string | null
          id?: string
          nama_kelas?: string
          tahun?: number
          tingkatan?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          id: string
          keterangan: string | null
          lokasi: string | null
          tajuk: string
          tarikh_mula: string
          tarikh_tamat: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          keterangan?: string | null
          lokasi?: string | null
          tajuk: string
          tarikh_mula: string
          tarikh_tamat?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          keterangan?: string | null
          lokasi?: string | null
          tajuk?: string
          tarikh_mula?: string
          tarikh_tamat?: string | null
        }
        Relationships: []
      }
      exam_results: {
        Row: {
          created_at: string
          exam_id: string
          gred: string | null
          id: string
          markah: number | null
          student_id: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          gred?: string | null
          id?: string
          markah?: number | null
          student_id: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          gred?: string | null
          id?: string
          markah?: number | null
          student_id?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          id: string
          nama_peperiksaan: string
          penggal: number
          tahun: number
          tarikh_mula: string | null
          tarikh_tamat: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nama_peperiksaan: string
          penggal: number
          tahun: number
          tarikh_mula?: string | null
          tarikh_tamat?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nama_peperiksaan?: string
          penggal?: number
          tahun?: number
          tarikh_mula?: string | null
          tarikh_tamat?: string | null
        }
        Relationships: []
      }
      fees: {
        Row: {
          amaun: number
          created_at: string
          id: string
          jenis: Database["public"]["Enums"]["fee_jenis"]
          nama_yuran: string
        }
        Insert: {
          amaun: number
          created_at?: string
          id?: string
          jenis: Database["public"]["Enums"]["fee_jenis"]
          nama_yuran: string
        }
        Update: {
          amaun?: number
          created_at?: string
          id?: string
          jenis?: Database["public"]["Enums"]["fee_jenis"]
          nama_yuran?: string
        }
        Relationships: []
      }
      hafazan: {
        Row: {
          ayat_akhir: number
          ayat_mula: number
          catatan: string | null
          created_at: string
          gred: Database["public"]["Enums"]["gred_hafazan"] | null
          guru_id: string | null
          id: string
          jenis: Database["public"]["Enums"]["hafazan_jenis"]
          student_id: string
          surah: string
          tarikh: string
        }
        Insert: {
          ayat_akhir: number
          ayat_mula: number
          catatan?: string | null
          created_at?: string
          gred?: Database["public"]["Enums"]["gred_hafazan"] | null
          guru_id?: string | null
          id?: string
          jenis: Database["public"]["Enums"]["hafazan_jenis"]
          student_id: string
          surah: string
          tarikh?: string
        }
        Update: {
          ayat_akhir?: number
          ayat_mula?: number
          catatan?: string | null
          created_at?: string
          gred?: Database["public"]["Enums"]["gred_hafazan"] | null
          guru_id?: string | null
          id?: string
          jenis?: Database["public"]["Enums"]["hafazan_jenis"]
          student_id?: string
          surah?: string
          tarikh?: string
        }
        Relationships: [
          {
            foreignKeyName: "hafazan_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hafazan_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amaun: number
          bulan: number | null
          created_at: string
          fee_id: string
          id: string
          rujukan_bayaran: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          tahun: number
          tarikh_bayar: string | null
          updated_at: string
        }
        Insert: {
          amaun: number
          bulan?: number | null
          created_at?: string
          fee_id: string
          id?: string
          rujukan_bayaran?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          tahun: number
          tarikh_bayar?: string | null
          updated_at?: string
        }
        Update: {
          amaun?: number
          bulan?: number | null
          created_at?: string
          fee_id?: string
          id?: string
          rujukan_bayaran?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id?: string
          tahun?: number
          tarikh_bayar?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          dibaca: boolean
          id: string
          mesej: string
          receiver_id: string
          sender_id: string
          student_id: string | null
          tarikh: string
        }
        Insert: {
          dibaca?: boolean
          id?: string
          mesej: string
          receiver_id: string
          sender_id: string
          student_id?: string | null
          tarikh?: string
        }
        Update: {
          dibaca?: boolean
          id?: string
          mesej?: string
          receiver_id?: string
          sender_id?: string
          student_id?: string | null
          tarikh?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parents_students: {
        Row: {
          created_at: string
          hubungan: Database["public"]["Enums"]["hubungan_penjaga"]
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          hubungan?: Database["public"]["Enums"]["hubungan_penjaga"]
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          hubungan?: Database["public"]["Enums"]["hubungan_penjaga"]
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parents_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nama: string
          phone: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nama: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nama?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          gambar_url: string | null
          id: string
          jantina: Database["public"]["Enums"]["jantina"] | null
          kelas_id: string | null
          nama: string
          no_kp: string | null
          status: Database["public"]["Enums"]["student_status"]
          tahun_masuk: number | null
          tarikh_lahir: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          gambar_url?: string | null
          id?: string
          jantina?: Database["public"]["Enums"]["jantina"] | null
          kelas_id?: string | null
          nama: string
          no_kp?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          tahun_masuk?: number | null
          tarikh_lahir?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          gambar_url?: string | null
          id?: string
          jantina?: Database["public"]["Enums"]["jantina"] | null
          kelas_id?: string | null
          nama?: string
          no_kp?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          tahun_masuk?: number | null
          tarikh_lahir?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_kelas_id_fkey"
            columns: ["kelas_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          id: string
          nama_subjek: string
        }
        Insert: {
          created_at?: string
          id?: string
          nama_subjek: string
        }
        Update: {
          created_at?: string
          id?: string
          nama_subjek?: string
        }
        Relationships: []
      }
      tilawah: {
        Row: {
          created_at: string
          gred: Database["public"]["Enums"]["gred_hafazan"] | null
          guru_id: string | null
          id: string
          jenis: Database["public"]["Enums"]["tilawah_jenis"]
          juzuk: number | null
          muka_surat: number | null
          student_id: string
          tarikh: string
        }
        Insert: {
          created_at?: string
          gred?: Database["public"]["Enums"]["gred_hafazan"] | null
          guru_id?: string | null
          id?: string
          jenis: Database["public"]["Enums"]["tilawah_jenis"]
          juzuk?: number | null
          muka_surat?: number | null
          student_id: string
          tarikh?: string
        }
        Update: {
          created_at?: string
          gred?: Database["public"]["Enums"]["gred_hafazan"] | null
          guru_id?: string | null
          id?: string
          jenis?: Database["public"]["Enums"]["tilawah_jenis"]
          juzuk?: number | null
          muka_surat?: number | null
          student_id?: string
          tarikh?: string
        }
        Relationships: [
          {
            foreignKeyName: "tilawah_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tilawah_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_parent_of: { Args: { _student_id: string }; Returns: boolean }
      is_teacher_of: { Args: { _student_id: string }; Returns: boolean }
    }
    Enums: {
      announcement_target: "semua" | "kelas" | "individu"
      app_role: "admin" | "guru" | "ibu_bapa"
      attendance_status: "hadir" | "lewat" | "tidak_hadir" | "cuti"
      behaviour_jenis: "merit" | "demerit"
      fee_jenis: "bulanan" | "sekali"
      gred_hafazan: "mumtaz" | "jayyid_jiddan" | "jayyid" | "dhaif"
      hafazan_jenis: "hafazan_baru" | "murajaah"
      hubungan_penjaga: "bapa" | "ibu" | "penjaga"
      invoice_status: "belum_bayar" | "sudah_bayar" | "tertunggak"
      jantina: "lelaki" | "perempuan"
      student_status: "aktif" | "tamat" | "berhenti"
      tilawah_jenis: "iqra" | "quran"
      user_status: "aktif" | "tidak_aktif"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      announcement_target: ["semua", "kelas", "individu"],
      app_role: ["admin", "guru", "ibu_bapa"],
      attendance_status: ["hadir", "lewat", "tidak_hadir", "cuti"],
      behaviour_jenis: ["merit", "demerit"],
      fee_jenis: ["bulanan", "sekali"],
      gred_hafazan: ["mumtaz", "jayyid_jiddan", "jayyid", "dhaif"],
      hafazan_jenis: ["hafazan_baru", "murajaah"],
      hubungan_penjaga: ["bapa", "ibu", "penjaga"],
      invoice_status: ["belum_bayar", "sudah_bayar", "tertunggak"],
      jantina: ["lelaki", "perempuan"],
      student_status: ["aktif", "tamat", "berhenti"],
      tilawah_jenis: ["iqra", "quran"],
      user_status: ["aktif", "tidak_aktif"],
    },
  },
} as const
