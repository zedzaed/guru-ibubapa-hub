export type UserRole = "admin" | "guru" | "ibu_bapa";
export type UserStatus = "aktif" | "tidak_aktif" | "digantung";
export type StudentStatus = "aktif" | "tidak_aktif" | "tamat" | "berhenti";
export type GenderType = "lelaki" | "perempuan";
export type AttendanceStatus = "hadir" | "lewat" | "tidak_hadir" | "cuti";
export type InfaqPaymentStatus = "menunggu" | "disahkan" | "ditolak" | "perlu_bukti";
export type InfaqTahlilStatus = "belum_dijadual" | "dijadualkan" | "selesai" | "dibawa_ke_hadapan";
export type InfaqEmailStatus = "belum_dihantar" | "dihantar" | "gagal";

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

export interface InfaqSettings {
  id: number;
  enabled: boolean;
  campaign_title: string;
  campaign_description: string | null;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  qr_path: string | null;
  payment_instructions: string | null;
  suggested_amounts: number[];
  tahlil_day: number;
  receipt_prefix: string;
  organisation_name: string;
  organisation_address: string | null;
  organisation_phone: string | null;
  sender_email: string | null;
  email_subject: string;
  email_body: string;
}

export interface InfaqSubmission {
  id: string;
  reference_no: string;
  public_token: string;
  source: "public" | "admin";
  donor_name: string;
  email: string | null;
  phone: string;
  address: string | null;
  amount: number;
  tahlil_names: string;
  relationship: string | null;
  purpose_note: string | null;
  display_publicly: boolean;
  payment_method: "qr" | "bank" | "tunai" | "lain";
  payment_proof_path: string | null;
  payment_status: InfaqPaymentStatus;
  tahlil_status: InfaqTahlilStatus;
  scheduled_week: string | null;
  admin_note: string | null;
  receipt_no: string | null;
  receipt_issued_at: string | null;
  email_status: InfaqEmailStatus;
  email_sent_at: string | null;
  email_error: string | null;
  created_by: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}
