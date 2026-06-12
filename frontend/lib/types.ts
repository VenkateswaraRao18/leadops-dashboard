export type Route = "hot" | "warm" | "cold" | "pending";

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  intent: string;
  score: number;
  route: Route;
  status: string;
  is_returning_customer: boolean;
  created_at: string;
}

export interface Approval {
  id: string;
  action: string;
  payload: Record<string, unknown>;
  agent: string;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  type: "hot" | "warm" | "cold" | "approval";
  name: string;
  company: string;
  action: string;
  time: string;
}
