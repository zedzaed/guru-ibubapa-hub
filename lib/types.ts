export type AppRole = "admin" | "guru" | "ibu_bapa";

export interface CurrentAccount {
  id: string;
  nama: string;
  email: string | null;
  phone: string | null;
  role: AppRole;
}

export interface StudentOption {
  id: string;
  nama: string;
  kelas: string | null;
  gambarUrl: string | null;
}
