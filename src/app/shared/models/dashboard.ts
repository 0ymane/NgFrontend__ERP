export interface DashboardResponse {
  totalTickets: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  byProduct: Array<{ productId: number; productName: string; count: number }>;
  last7Days: number;
  last30Days: number;
  avgResolutionHours: number | null;
  lastUpdated: string;
}
