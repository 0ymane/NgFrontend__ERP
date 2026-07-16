export interface ApiError {
  status: number;
  message: string;
  code: string;
  timestamp: string;
  path: string;
  errors?: Record<string, string>;
}
