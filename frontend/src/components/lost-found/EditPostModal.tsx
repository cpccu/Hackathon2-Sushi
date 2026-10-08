'use client';

import React, { useState } from 'react';
import { LostFoundPost, UpdateLostFoundDto } from '@/types/lostFound';
import { updateLostFoundPost } from '@/lib/api/lostFound';
import ImageUploader from './ImageUploader';
import { X, Loader2, Tag, Plus, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface EditPostModalProps {
  post: LostFoundPost;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedPost: LostFoundPost) => void;
}

export default function EditPostModal({
  post,
  isOpen,
  onClose,
  onUpdated,
}: EditPostModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [itemName, setItemName] = useState(post.item_name);
  const [description, setDescription] = useState(post.description);
  const [location, setLocation] = useState(post.location);
  const [incidentDate, setIncidentDate] = useState(post.incident_date);
  const [contactPhone, setContactPhone] = useState(post.contact_phone || '');
  const [contactEmail, setContactEmail] = useState(post.contact_email || '');
  const [keywords, setKeywords] = useState<string[]>(post.keywords || []);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>(post.images || []);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

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
    // Email validation if entered
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

      const updated = await updateLostFoundPost(post.id, dto);
      toast.success('Post updated successfully!');
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-3 sm:p-6 backdrop-blur-sm flex justify-center items-start animate-in fade-in duration-150">
      <div className="my-3 sm:my-8 w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header (Always visible) */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 shrink-0 bg-zinc-900">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-100">
              Edit Post Details
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Update details for your {post.post_type.toUpperCase()} report.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-5 space-y-4 flex-1">
            {/* Item Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Description * (min 10 characters)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field resize-none"
                required
              />
            </div>

            {/* Grid row: Location & Incident Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Library 2nd Floor, Room 402"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {post.post_type === 'lost' ? 'Lost Date *' : 'Found Date *'}
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

            {/* Contact Information (Email & Phone) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact Email */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Contact Email (e.g. your Gmail)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="input-field pl-9"
                  />
                </div>
              </div>

              {/* Contact Phone (11 digits) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Contact Phone (11 digits, optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="tel"
                    maxLength={11}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="input-field pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Keywords / Tags */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Keywords (Press Enter or click Add)
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
                  placeholder="e.g. casio, black, wallet, id-card"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="btn-secondary px-3 shrink-0 text-xs"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>
              {keywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 border border-zinc-700"
                    >
                      <Tag className="h-3 w-3 text-zinc-500" />
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="ml-1 text-zinc-400 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Photos */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Photos * (Max 3)
              </label>
              <ImageUploader images={images} onChange={setImages} maxImages={3} />
            </div>
          </div>

          {/* Sticky Bottom Actions Bar (Always visible) */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-5 py-3.5 shrink-0 bg-zinc-900">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-accent text-xs"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
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
