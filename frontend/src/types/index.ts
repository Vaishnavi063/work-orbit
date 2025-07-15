import type { LucideIcon } from "lucide-react";

export interface CategoryType {
  id: number;
  title: string;
  available: number;
  Icon: LucideIcon;
  color: string;
}

export interface RequestType {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";
  authToken?: string | null;
  data?: any;
  params?: any;
  url?: string;
  isFormData?: boolean;
}
