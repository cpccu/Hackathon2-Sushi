export type LostFoundType = 'lost' | 'found';
export type LostFoundStatus = 'active' | 'resolved';

export interface LostFoundPost {
  id: string;
  post_type: LostFoundType;
  item_name: string;
  description: string;
  keywords: string[];
  location: string;
  incident_date: string; // YYYY-MM-DD
  contact_phone: string | null;
  contact_email?: string | null;
  images: string[];
  status: LostFoundStatus;
  created_at: string;
  updated_at: string;
  poster_id: string;
  poster_name: string;
  poster_batch: string | null;
  poster_department: string | null;
  poster_email: string;
}

export interface CreateLostFoundDto {
  post_type: LostFoundType;
  item_name: string;
  description: string;
  keywords: string[];
  location: string;
  incident_date: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  images: string[];
}

export interface UpdateLostFoundDto {
  item_name?: string;
  description?: string;
  keywords?: string[];
  location?: string;
  incident_date?: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  images?: string[];
}

export interface ListLostFoundParams {
  q?: string;
  search?: string;
  post_type?: LostFoundType;
  status?: LostFoundStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface LostFoundPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface LostFoundListResponse {
  posts: LostFoundPost[];
  pagination: LostFoundPagination;
}
