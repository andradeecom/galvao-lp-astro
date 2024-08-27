export interface BaseContact {
  name?: string;
  email: string;
  phone: string;
  privacy: boolean;
}

export interface PendingContact extends BaseContact {
  token: string;
  expirationDate: number;
}
