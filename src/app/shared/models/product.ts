export interface Product {
  id: number;
  name: string;
  key: string;
  description: string | null;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  key: string;
  description?: string;
}

export interface UpdateProductRequest {
  name: string;
  key: string;
  description?: string;
}
