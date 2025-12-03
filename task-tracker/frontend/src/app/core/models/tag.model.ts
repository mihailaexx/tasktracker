export interface Tag {
  id?: number;
  name: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagRequest {
  name: string;
  color?: string;
}
