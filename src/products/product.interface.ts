export interface ProductKey {
  id: string;
}

export interface Product extends ProductKey {
  name: string;
  status: 'published' | 'unpublished';
  description: string;
  price: string;
  photo: string;
}
