export interface TicketSearchResult {
  id: string;
  numericId: number;
  title: string;
  status: string;
  productKey: string;
  productName: string;
}

export interface ProductSearchResult {
  id: number;
  name: string;
  key: string;
}

export interface UserSearchResult {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ActionOption {
  id: string;
  label: string;
  category: 'NAVIGATION' | 'TICKET_ACTION' | 'ADMIN';
  command: string;
  parameter?: string;
}

export interface CommandPaletteSearchResponse {
  tickets: TicketSearchResult[];
  products: ProductSearchResult[];
  users: UserSearchResult[];
  actions: ActionOption[];
}
