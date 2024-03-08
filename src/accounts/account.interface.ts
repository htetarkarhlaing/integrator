export interface AccountKey {
  id: string;
}

export interface Account extends AccountKey {
  name: string;
  telegramUId: string;
  role: 'user' | 'admin';
}
