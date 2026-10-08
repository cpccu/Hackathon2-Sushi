'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Plus, Trash2, ImagePlus } from 'lucide-react';

interface QuestionItem {
  question_text: string;
  is_required: boolean;
}

const CATEGORIES = [
  'Competitive Programming',
  'Hackathon',
  'Cultural',
  'Sports',
  'Seminar',
  'Workshop',
  'Other',
];

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Electrical & Electronic Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Textile Engineering',
  'Pharmacy',
  'Business Administration',
  'English',
  'Law',
  'Agriculture',
];

export default function CreateEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Competitive Programming');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationHours, setDurationHours] = useState(2);
  const [regStart, setRegStart] = useState('');
  const [regDeadline, setRegDeadline] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Selected filters
  const [allowedDepartments, setAllowedDepartments] = useState<string[]>([]);
  const [allowedBatches, setAllowedBatches] = useState<string>('');

  // File cover image + preview
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Dynamic organizer questions
  const [questions, setQuestions] = useState<QuestionItem[]>([
    { question_text: '', is_required: false },
  ]);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { question_text: '', is_required: false }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, question_text: text } : q))
    );
  };

  const toggleQuestionRequired = (index: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, is_required: !q.is_required } : q))
    );
  };

  const toggleDepartment = (dept: string) => {
    setAllowedDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
    }
  };

  // Today's date string in YYYY-MM-DD for min attribute
  const todayStr = new Date().toLocaleDateString('en-CA');
  // Now in datetime-local format
  const nowStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Frontend validations ──
    if (!name.trim() || !description.trim() || !venue.trim() || !eventDate || !startTime || !regStart || !regDeadline || !contactEmail) {
      toast.error('Please fill in all required fields marked with *');
      return;
    }

    if (description.trim().length < 10) {
      toast.error('Description must be at least 10 characters.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedEventDate = new Date(eventDate);
    if (selectedEventDate < today) {
      toast.error('Event date cannot be in the past.');
      return;
    }

    // Build event datetime for comparison (event_date + start_time)
    const eventDatetimeMs = new Date(`${eventDate}T${startTime}`).getTime();
    const regStartMs = new Date(regStart).getTime();
    const regDeadlineMs = new Date(regDeadline).getTime();
    const nowMs = Date.now();

    if (regStartMs < nowMs) {
      toast.error('Registration start cannot be in the past.');
      return;
    }

    if (regDeadlineMs <= regStartMs) {
      toast.error('Registration deadline must be after the registration start.');
      return;
    }

    if (regDeadlineMs >= eventDatetimeMs) {
      toast.error('Registration deadline must be before the event date & time.');
      return;
    }

    if (regStartMs >= eventDatetimeMs) {
      toast.error('Registration start must be before the event date & time.');
      return;
    }
    // ─────────────────────────

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('venue', venue);
      formData.append('event_date', eventDate);
      formData.append('start_time', startTime);
      formData.append('duration_minutes', String(Math.round(durationHours * 60)));
      formData.append('registration_start', new Date(regStart).toISOString());
      formData.append('registration_deadline', new Date(regDeadline).toISOString());
      formData.append('contact_email', contactEmail);

      formData.append('allowed_departments', JSON.stringify(allowedDepartments));

      const batchesArray = allowedBatches
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean);
      formData.append('allowed_batches', JSON.stringify(batchesArray));

      const validQuestions = questions.filter((q) => q.question_text.trim().length > 0);
      formData.append('questions', JSON.stringify(validQuestions));

      if (coverFile) {
        formData.append('cover_image', coverFile);
      }

      await apiFetch('/club-admin/events', {
        method: 'POST',
        body: formData,
      });

      toast.success('Event successfully created and published!');
      router.push('/event-dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/event-dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors duration-150 hover:text-white active:scale-90 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-8 shadow-xl">
        <div className="border-b border-zinc-800 pb-5">
          <h1 className="text-2xl font-bold text-white">Create New Event</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Publish an event, define eligibility restrictions, and customize participant questions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">

          {/* Cover Image Upload — full clickable preview area */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Cover Image <span className="text-zinc-500">(optional)</span>
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full overflow-hidden rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/60 transition-all duration-150 hover:border-red-500/60 hover:bg-zinc-900 active:scale-[0.98] focus:outline-none group"
              style={{ minHeight: '160px' }}
            >
              {coverPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full object-cover"
                    style={{ maxHeight: '260px', display: 'block' }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <ImagePlus className="h-7 w-7 text-white mb-1" />
                    <span className="text-xs text-white font-medium">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 group-hover:border-red-500/50 transition-colors duration-150">
                    <ImagePlus className="h-5 w-5 text-zinc-400 group-hover:text-red-400 transition-colors duration-150" />
                  </div>
                  <p className="text-xs font-medium text-zinc-300">Click to upload cover image</p>
                  <p className="mt-1 text-[11px] text-zinc-500">PNG, JPG, WEBP up to 5 MB</p>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {coverFile && (
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 truncate">{coverFile.name}</span>
                <button
                  type="button"
                  onClick={() => { setCoverFile(null); setCoverPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="ml-2 text-[11px] text-zinc-500 hover:text-red-400 transition-colors duration-150 active:scale-90 shrink-0"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Event Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-300">Event Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Autonomous Rover Combat 2026"
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-300">Description *</label>
              <span className={`text-[11px] transition-colors duration-150 ${description.trim().length < 10 ? 'text-zinc-500' : 'text-green-500'}`}>
                {description.trim().length}/min 10 chars
              </span>
            </div>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide event details, rules, prize pools, and schedule overview... (min. 10 characters)"
              className={`mt-1.5 w-full rounded-lg border bg-zinc-900/80 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors duration-150 ${description.trim().length > 0 && description.trim().length < 10
                  ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500'
                  : 'border-zinc-800 focus:border-red-500 focus:ring-red-500'
                }`}
            />
            {description.trim().length > 0 && description.trim().length < 10 && (
              <p className="mt-1 text-[11px] text-red-400">Description must be at least 10 characters.</p>
            )}
          </div>

          {/* Category & Venue */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Venue *</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Auditorium East Wing"
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Date, Start Time & Duration */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300">Event Date *</label>
              <input
                type="date"
                required
                min={todayStr}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-white [color-scheme:dark] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Start Time *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-white [color-scheme:dark] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Duration (hours) *</label>
              <input
                type="number"
                required
                min={0.25}
                step={0.25}
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Registration Window */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-zinc-800 pt-5">
            <div>
              <label className="block text-xs font-medium text-zinc-300">Registration Start *</label>
              <p className="text-[11px] text-zinc-500 mb-1">Must be in the future &amp; before the event</p>
              <input
                type="datetime-local"
                required
                min={nowStr}
                value={regStart}
                onChange={(e) => setRegStart(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-white [color-scheme:dark] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Registration Deadline *</label>
              <p className="text-[11px] text-zinc-500 mb-1">Must be after start &amp; before the event</p>
              <input
                type="datetime-local"
                required
                min={regStart || nowStr}
                value={regDeadline}
                onChange={(e) => setRegDeadline(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-white [color-scheme:dark] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Eligibility: Allowed Departments */}
          <div className="border-t border-zinc-800 pt-5">
            <label className="block text-xs font-medium text-zinc-300">
              Allowed Departments{' '}
              <span className="text-zinc-500 font-normal">(Leave empty to allow all)</span>
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {DEPARTMENTS.map((dept) => {
                const selected = allowedDepartments.includes(dept);
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => toggleDepartment(dept)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium border transition-all duration-150 active:scale-90 ${selected
                        ? 'border-red-500 bg-red-950/40 text-red-200'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allowed Batches & Contact Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300">
                Allowed Batches{' '}
                <span className="text-zinc-500 font-normal">(Leave empty to allow all)</span>
              </label>
              <input
                type="text"
                value={allowedBatches}
                onChange={(e) => setAllowedBatches(e.target.value)}
                placeholder="e.g. 2020, 2021, 2022"
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Contact Email *</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="club.contact@university.edu"
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Additional Participant Questions */}
          <div className="border-t border-zinc-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Additional Participant Questions
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Add custom prompts for registrants (e.g., team name, equipment requests).
                </p>
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="btn-secondary inline-flex items-center gap-1.5 py-1.5 px-3 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Question
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950 p-3"
                >
                  <input
                    type="text"
                    value={q.question_text}
                    onChange={(e) => updateQuestionText(idx, e.target.value)}
                    placeholder={`Question ${idx + 1}...`}
                    className="flex-1 rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                  />

                  <div className="flex items-center gap-3 shrink-0">
                    <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.is_required}
                        onChange={() => toggleQuestionRequired(idx)}
                        className="rounded border-zinc-700 text-red-600 focus:ring-red-500"
                      />
                      <span>Required?</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="rounded p-1 text-zinc-500 hover:text-red-400 active:scale-90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-zinc-800 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-2.5 text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? 'Publishing Event...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
