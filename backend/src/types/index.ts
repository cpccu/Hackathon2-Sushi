export type UserRole = 'student' | 'club_admin' | 'helpdesk_admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  student_id: string | null;
  department: string | null;
  batch: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Club {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: Date;
}

export interface AuthenticatedUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  student_id: string | null;
  department: string | null;
  batch: string | null;
  club_id?: string | null;
  club_name?: string | null;
  club_logo_url?: string | null;
}

export type EventStatus = 'draft' | 'published' | 'upcoming' | 'ongoing' | 'finished' | 'cancelled' | 'closed';

export interface EventEntity {
  id: string;
  club_id: string;
  name: string;
  description: string;
  cover_image_url: string | null;
  category: string;
  venue: string;
  event_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm or HH:mm:ss
  duration_minutes: number;
  registration_start: Date;
  registration_deadline: Date;
  allowed_departments: string[];
  allowed_batches: string[];
  contact_email: string;
  status: EventStatus;
  created_at: Date;
  updated_at: Date;
}

export interface EventQuestion {
  id: string;
  event_id: string;
  question_text: string;
  is_required: boolean;
  order_index: number;
}

export type RegistrationStatus = 'registered' | 'checked_in' | 'cancelled';

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  checked_in_at: Date | null;
  created_at: Date;
}

export interface RegistrationAnswer {
  id: string;
  registration_id: string;
  question_id: string;
  answer_text: string;
}
