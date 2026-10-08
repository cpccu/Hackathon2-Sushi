export type HelpdeskPostType = 'academic' | 'facilities';

export interface HelpdeskAttachment {
  id?: string;
  title: string;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
}

export interface HelpdeskPost {
  id: string;
  post_type: HelpdeskPostType;
  title: string;
  description: string;
  keywords: string[];
  steps: string[];
  provided_by: string;
  created_at: string;
  updated_at: string;
  attachments: HelpdeskAttachment[];
}

export interface CreateHelpdeskPostDto {
  post_type: HelpdeskPostType;
  title: string;
  description: string;
  keywords: string[];
  steps: string[];
  attachments: Array<{
    title: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
  }>;
}

export interface UpdateHelpdeskPostDto {
  post_type?: HelpdeskPostType;
  title?: string;
  description?: string;
  keywords?: string[];
  steps?: string[];
  attachments?: Array<{
    title: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
  }>;
}

export interface ListHelpdeskParams {
  q?: string;
  search?: string;
  post_type?: HelpdeskPostType;
  page?: number;
  limit?: number;
}

export interface HelpdeskListResponse {
  posts: HelpdeskPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
