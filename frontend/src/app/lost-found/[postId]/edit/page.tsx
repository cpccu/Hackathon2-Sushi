'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getLostFoundPostById, updateLostFoundPost } from '@/lib/api/lostFound';
import { LostFoundPost, UpdateLostFoundDto } from '@/types/lostFound';
import ImageUploader from '@/components/lost-found/ImageUploader';
import {
  ArrowLeft,
  Tag,
  Plus,
  X,
  Phone,
  Mail,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface EditPageProps {
  params: Promise<{ postId: string }>;
}

export default function EditPostPage({ params }: EditPageProps) {
  const { postId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const today = new Date().toISOString().split('T')[0];

  const [post, setPost] = useState<LostFoundPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // 1. Fetch Post Data
  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        const data = await getLostFoundPostById(postId);
        setPost(data);
        setItemName(data.item_name);
        setDescription(data.description);
        setLocation(data.location);
        setIncidentDate(data.incident_date);
        setContactEmail(data.contact_email || '');
        setContactPhone(data.contact_phone || '');
        setKeywords(data.keywords || []);
        setImages(data.images || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load post');
        router.push('/lost-found');
      } finally {
        setLoading(false);
      }
    }
    if (postId) {
      loadPost();
    }
  }, [postId, router]);

  // 2. Ownership verification
  useEffect(() => {
    if (!authLoading && !loading && post && user) {
      if (user.id !== post.poster_id) {
        toast.error('You are not authorized to edit this post');
        router.push(`/lost-found/${postId}`);
      }
    }
  }, [authLoading, loading, post, user, postId, router]);

  const handleAddKeyword = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      if (keywords.length >= 10) {
        toast.error('Maximum 10 keywords allowed');
        return;
      }
      setKeywords([...keywords, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveKeyword = (toRemove: string) => {
    setKeywords(keywords.filter((kw) => kw !== toRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }
    if (!location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!incidentDate) {
      toast.error('Date is required');
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
    // Check 4: Validate email format if provided
    if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (images.length === 0) {
      toast.error('At least 1 photo is required');
      return;
    }

    setSaving(true);
    try {
      const dto: UpdateLostFoundDto = {
        item_name: itemName.trim(),
        description: description.trim(),
        location: location.trim(),
        incident_date: incidentDate,
        contact_phone: contactPhone.trim() || null,
        contact_email: contactEmail.trim() || null,
        keywords,
        images,
      };

      await updateLostFoundPost(postId, dto);
      toast.success('Post updated successfully!');
      router.push(`/lost-found/${postId}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#09090b] pb-20">
      {/* Top Header Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/40 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/lost-found/${postId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Post
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Edit Post Details
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${post.post_type === 'lost'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
            >
              {post.post_type.toUpperCase()}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Update your report's descriptions, photos, or contact information.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Item Details */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-2">
              1. Item Details *
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
                placeholder="e.g. Casio fx-991EX Calculator, Black Leather Wallet"
                className="input-field"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Description * (min 10 characters)
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe distinctive features, exact model, condition, stickers, contents..."
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
                  Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Academic Building 2, Room 402"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {post.post_type === 'lost' ? 'Date Lost *' : 'Date Found *'}
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
                Keywords & Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
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

          {/* Section 2: Photos */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                2. Item Photos * (1 to 3 images)
              </h2>
              <span className="text-xs text-zinc-500">{images.length}/3 uploaded</span>
            </div>
            <ImageUploader images={images} onChange={setImages} maxImages={3} />
          </div>

          {/* Section 3: Contact Info */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-2">
              3. Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact Email / Gmail */}
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
                  Provide your preferred email for inquiries
                </span>
              </div>

              {/* Contact Phone (11 digits) */}
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
            <Link href={`/lost-found/${postId}`} className="btn-secondary text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-accent px-6 py-2.5 text-sm font-semibold shadow-lg shadow-red-500/20"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
