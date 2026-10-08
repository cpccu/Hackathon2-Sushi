/**
 * Format date string (YYYY-MM-DD or ISO) into Day/Month/Year (DD/MM/YYYY)
 */
export function formatDateDDMMYYYY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  try {
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split('-');
      return `${day}/${month}/${year}`;
    }

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Format time string ("14:00", "08:30:00") into 12-hour format ("02:00 PM", "8:30 AM")
 * Without seconds, clean hr:min format.
 */
export function formatTime12Hour(timeInput: string | null | undefined): string {
  if (!timeInput) return '';
  try {
    const parts = timeInput.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';

    if (isNaN(hours)) return timeInput;

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    const formattedMinutes = minutes.padStart(2, '0').slice(0, 2);
    return `${hours}:${formattedMinutes} ${ampm}`;
  } catch {
    return timeInput;
  }
}

/**
 * Format duration in minutes into clean hours (e.g. 1 hr, 2 hrs, 24 hrs, 1.5 hrs)
 */
export function formatDurationHours(durationMinutes: number | null | undefined): string {
  if (!durationMinutes || durationMinutes <= 0) return '0 hrs';
  const hours = durationMinutes / 60;
  if (Number.isInteger(hours)) {
    return `${hours} hr${hours !== 1 ? 's' : ''}`;
  }
  return `${parseFloat(hours.toFixed(1))} hrs`;
}

/**
 * Format full datetime string to "DD/MM/YYYY, hh:mm AM/PM"
 */
export function formatDateTimeDDMMYYYY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Compute and format lifecycle status (upcoming, ongoing, finished, cancelled)
 */
export function getLifecycleStatus(
  eventDate: string,
  startTime: string,
  durationMinutes: number,
  dbStatus?: string
): 'upcoming' | 'ongoing' | 'finished' | 'cancelled' {
  if (dbStatus === 'cancelled') return 'cancelled';
  try {
    const cleanTime = (startTime || '00:00').split(':').slice(0, 2).join(':');
    const start = new Date(`${eventDate}T${cleanTime}:00`);
    const end = new Date(start.getTime() + (durationMinutes || 60) * 60 * 1000);
    const now = new Date();

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'finished';
  } catch {
    return 'upcoming';
  }
}

/**
 * Format file size in bytes to human readable (KB, MB)
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Generate standard abbreviation / tag for a club name
 * e.g., "Computer Club City University" -> "CCCU"
 *       "Competitive Programming Camp City University" -> "CPCCU"
 *       "Sports Club City University" -> "SCCU"
 */
export function getClubAbbreviation(clubName?: string | null): string {
  if (!clubName) return 'Club Admin';
  const name = clubName.trim();
  const lower = name.toLowerCase();

  if (lower.includes('competitive programming')) return 'CPCCU';
  if (lower.includes('computer club')) return 'CCCU';
  if (lower.includes('sports club')) return 'SCCU';

  const words = name.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return words.map((w) => w[0].toUpperCase()).join('');
  }
  return name.slice(0, 6).toUpperCase();
}


