'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createLostFoundPost } from '@/lib/api/lostFound';
import { LostFoundType, CreateLostFoundDto } from '@/types/lostFound';
import ImageUploader from '@/components/lost-found/ImageUploader';
import {
  ArrowLeft,
  Tag,
  Plus,
  X,
  Phone,
  Mail,
  User,
  GraduationCap,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CreateLostFoundPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const today = new Date().toISOString().split('T')[0];

  // Form states
  const [postType, setPostType] = useState<LostFoundType>('lost');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(today);
  const [contactEmail, setContactEmail] = useState(''); // NOT auto-filled per user request
  const [contactPhone, setContactPhone] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to report a lost or found item');
      router.push('/login?redirect=/lost-found/create');
    }
  }, [user, authLoading, router]);

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      if (keywords.length >= 10) {
        toast.error('Maximum 10 keywords allowed');
        return;
      }
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== kwToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be signed in to create a post');
      return;
    }
    if (!itemName.trim()) {
      toast.error('Please enter the item name');
      return;
    }
    if (description.trim().length < 10) {
      toast.error('Please provide a description of at least 10 characters');
      return;
    }
    if (!location.trim()) {
      toast.error('Please specify the location');
      return;
    }
    if (!incidentDate) {
      toast.error('Please specify the date');
      return;
    }
    // Check 3: Date cannot be in the future
    if (incidentDate > today) {
      toast.error('Date cannot be in the future');
      return;
    }
    // Check 5: Phone number must be 11 digits if provided
    if (contactPhone.trim()) {
      const cleanPhone = contactPhone.trim().replace(/\D/g, '');
      if (cleanPhone.length !== 11 || contactPhone.trim().length !== 11) {
        toast.error('Phone number must be exactly 11 digits (e.g. 017XXXXXXXX)');
        return;
      }
    }
    // Check 4: Contact email validation if filled
    if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least 1 photo of the item');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateLostFoundDto = {
        post_type: postType,
        item_name: itemName.trim(),
        description: description.trim(),
        keywords,
        location: location.trim(),
        incident_date: incidentDate,
        contact_phone: contactPhone.trim() || null,
        contact_email: contactEmail.trim() || null,
        images,
      };

      const result = await createLostFoundPost(payload);
      toast.success('Report posted successfully!');
      router.push(`/lost-found/${result.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#09090b] pb-20">
      {/* Top Header Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/40 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/lost-found"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Lost & Found Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Report an Item
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Provide clear details and up to 3 photos to help verify ownership and return items swiftly.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Post Type Selection */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-3">
              1. Report Category *
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPostType('lost')}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-150 active:scale-[0.99] cursor-pointer ${postType === 'lost'
                  ? 'border-red-500 bg-red-500/10 text-white shadow-md shadow-red-500/10'
                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                  }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-base text-red-400">I Lost Something</span>
                  {postType === 'lost' && (
                    <CheckCircle2 className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Post a report for a personal belonging misplaced on campus so finders can reach out.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPostType('found')}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-150 active:scale-[0.99] cursor-pointer ${postType === 'found'
                  ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-500/10'
                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                  }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-base text-emerald-400">I Found Something</span>
                  {postType === 'found' && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Help return an item picked up in classes, labs, cafeteria, or campus grounds.
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Item Details */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-2">
              2. Item Details *
            </h2>

            {/* Item Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Item Name / Title *
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Casio fx-991EX Calculator, Black Leather Wallet, Dell Charger"
                className="input-field"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Description * (Unique marks, serials, color, condition)
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe distinctive features, exact model, condition, stickers, contents, or where it is safely stored..."
                className="input-field resize-none"
                required
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Minimum 10 characters ({description.length} entered)
              </span>
            </div>

            {/* Location & Incident Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {postType === 'lost' ? 'Lost Location *' : 'Found Location *'}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Academic Building 2, Room 402, Cafeteria"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {postType === 'lost' ? 'Date Lost *' : 'Date Found *'}
                </label>
                <input
                  type="date"
                  max={today}
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="input-field [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            {/* Custom Keywords / Tags */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Search Keywords (Tags to help others find this item)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="Type a tag (e.g. casio, black, wallet) and press Enter"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="btn-secondary px-4 shrink-0 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Tag
                </button>
              </div>

              {keywords.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800/90 px-2.5 py-1 text-xs text-zinc-200 border border-zinc-700"
                    >
                      <Tag className="h-3 w-3 text-red-400" />
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-zinc-400 hover:text-red-400 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Photos (Max 3) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                3. Item Photos * (1 to 3 images)
              </h2>
              <span className="text-xs text-zinc-500">{images.length}/3 uploaded</span>
            </div>
            <p className="text-xs text-zinc-400">
              Attach clear photographs to aid swift identification. Photos are required for institution-wide verification.
            </p>
            <ImageUploader images={images} onChange={setImages} maxImages={3} />
          </div>

          {/* Section 4: Poster Identity & Contact Info */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-2">
              4. Contact & Student Identity
            </h2>
            <p className="text-xs text-zinc-400">
              Your profile credentials verify your institutional identity. Enter your preferred contact email and phone number for responses.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name (Auto-filled read-only) */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Full Name
                </span>
                <div className="mt-1 flex items-center gap-2 text-sm font-medium text-zinc-200">
                  <User className="h-4 w-4 text-red-500" />
                  <span>{user.full_name}</span>
                </div>
              </div>

              {/* Department & Batch (Auto-filled read-only) */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Department & Batch
                </span>
                <div className="mt-1 flex items-center gap-2 text-sm font-medium text-zinc-200">
                  <GraduationCap className="h-4 w-4 text-red-500" />
                  <span>
                    {user.department || 'General'}
                    {user.batch ? ` (Batch ${user.batch})` : ''}
                  </span>
                </div>
              </div>

              {/* Contact Email / Gmail (NOT auto-filled - entered by the poster) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Contact Email / Gmail (Optional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="input-field pl-9"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Provide your email so responders can contact you directly
                </span>
              </div>

              {/* Phone Number (Optional, 11 digits enforced) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Contact Phone (11 digits, Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={11}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="input-field pl-9"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Must be 11 digits if provided
                </span>
              </div>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex items-center justify-end gap-4 border-t border-zinc-800 pt-6">
            <Link href="/lost-found" className="btn-secondary text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-accent px-6 py-2.5 text-sm font-semibold shadow-lg shadow-red-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing Report...
                </>
              ) : (
                `Publish ${postType === 'lost' ? 'Lost' : 'Found'} Report`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
