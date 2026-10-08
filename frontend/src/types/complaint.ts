export type ComplaintCategory =
  | 'academic'
  | 'facilities'
  | 'general'
  | 'transport'
  | 'hostel'
  | 'other';

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'academic',
  'facilities',
  'general',
  'transport',
  'hostel',
  'other',
];

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  academic: 'Academic',
  facilities: 'Facilities',
  general: 'General',
  transport: 'Transport',
  hostel: 'Hostel',
  other: 'Other',
};

export interface ComplaintAttachment {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

export interface ComplaintResponse {
  id: string;
  message: string;
  responded_by: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  created_at: string;
  response_count: number;
  responded_by_me: boolean;
  attachments: ComplaintAttachment[];
}

export interface ComplaintDetail extends Complaint {
  responses: ComplaintResponse[];
}

export interface CreateComplaintDto {
  title: string;
  description: string;
  category: ComplaintCategory;
  attachments: Array<{
    title: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
  }>;
}

export interface ListComplaintsParams {
  search?: string;
  category?: ComplaintCategory;
  has_response?: 'true' | 'false';
  page?: number;
  limit?: number;
}

export interface ComplaintListResponse {
  complaints: Complaint[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
