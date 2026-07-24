export type UserRole = "admin" | "guru" | "ibu_bapa";
export type UserStatus = "aktif" | "tidak_aktif" | "digantung";
export type StudentStatus = "aktif" | "tidak_aktif" | "tamat" | "berhenti";
export type GenderType = "lelaki" | "perempuan";
export type AttendanceStatus = "hadir" | "lewat" | "tidak_hadir" | "cuti";

export interface UserProfile {
  id: string;
  nama: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
}

export interface ClassSummary {
  id: string;
  nama_kelas: string;
  tingkatan: string;
  tahun: number;
  guru_id?: string | null;
}

export interface StudentSummary {
  id: string;
  nama: string;
  gambar_url: string | null;
  classes: { nama_kelas: string } | null;
}

export interface StudentRecord {
  id: string;
  nama: string;
  no_kp: string | null;
  tarikh_lahir: string;
  jantina: GenderType;
  kelas_id: string | null;
  tahun_masuk: number;
  status: StudentStatus;
  gambar_url: string | null;
}

export interface AttendanceRecord {
  id?: string;
  student_id: string;
  tarikh: string;
  status: AttendanceStatus;
  sebab: string | null;
}
