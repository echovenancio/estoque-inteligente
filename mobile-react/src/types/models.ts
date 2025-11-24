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
  min_quantity?: number; // ⭐ NOVO: Quantidade mínima (threshold)
  labels: string[];
  best_describer: string;
  anotation?: string | null;
  image_url?: string; // ⭐ NOVO: URL da imagem
  cluster_id?: number;
  created_at?: string;
  updated_at?: string;
  loja_id: string;
}

export interface Produto {
  nm_produto: string;
  type_quantidade?: string | null;
  val_quantidade: number;
  min_quantity?: number; // ⭐ NOVO: Quantidade mínima (threshold)
  labels: string[];
  anotation?: string | null;
  image_url?: string; // ⭐ NOVO: URL da imagem
  loja_id: string;
}

export interface Loja {
  id?: string;
  nome: string;
  foto_url?: string;
  localizacao: string;
  dono_email?: string;
  papel?: 'admin' | 'visualizador';
}

export interface Permissao {
  loja_id: string;
  email: string;
  papel: 'admin' | 'visualizador';
}
  labels: string[];
  anotation?: string | null;
  image_url?: string; // ⭐ NOVO: URL da imagem
}
