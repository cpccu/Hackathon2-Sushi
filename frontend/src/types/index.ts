export type UserRole = 'student' | 'club_admin';

export interface User {
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

export interface Club {
  id: string;
  name: string;
  logo_url: string | null;
}

export type EventStatus = 'ongoing' | 'upcoming' | 'completed' | 'cancelled';

export interface EventListItem {
  id: string;
  name: string;
  cover_image_url: string | null;
  category: string;
  venue: string;
  event_date: string;
  start_time: string;
  duration_minutes: number;
  allowed_departments: string[];
  allowed_batches: string[];
  status: EventStatus;
  club_id: string;
  club_name: string;
  club_logo_url: string | null;
  registration_start: string;
  registration_deadline: string;
  created_at: string;
}

export interface EventQuestion {
  id: string;
  question_text: string;
  is_required: boolean;
  order_index: number;
}

export interface SingleEventDetail extends EventListItem {
  description: string;
  contact_email: string;
  questions: EventQuestion[];
  registration_state?: {
    state: 'login' | 'eligible_open' | 'ineligible' | 'closed' | 'registered';
    reason?: string;
    registration_id?: string;
    qr_url?: string;
  };
}

export interface Participant {
  registration_id: string;
  registration_status: 'registered' | 'checked_in' | 'cancelled';
  checked_in_at: string | null;
  registered_at: string;
  user_id: string;
  full_name: string;
  student_id: string | null;
  department: string | null;
  batch: string | null;
  email: string;
  answers: Array<{ question: string; answer: string }>;
}
