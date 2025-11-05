export interface LoginReq {
  email: string;
  password: string;
}

export interface LoginRes {
  idToken: string;
  email: string;
}

export interface ResProduto {
  id: string;
  nm_produto: string;
  type_quantidade?: string | null;
  val_quantidade: number;
  labels: string[];
  best_describer: string;
  anotation?: string | null;
  cluster_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Produto {
  nm_produto: string;
  type_quantidade?: string | null;
  val_quantidade: number;
  labels: string[];
  anotation?: string | null;
}
