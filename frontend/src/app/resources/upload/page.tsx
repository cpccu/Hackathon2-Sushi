'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  RESOURCE_CATEGORIES,
  RESOURCE_SEMESTERS,
  DEPARTMENTS,
} from '@/lib/constants';
import { formatFileSize } from '@/lib/formatters';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Paperclip,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  UploadCloud,
  FileUp,
  X,
  Info,
} from 'lucide-react';

interface DocumentInputRow {
  id: string;
  title: string;
  file: File | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  isUploading: boolean;
  uploadError: string | null;
}

export default function ReleaseResourcePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Form states
  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [semester, setSemester] = useState<string>('Spring');
  const [department, setDepartment] = useState<string>(
    DEPARTMENTS[0] || 'Computer Science and Engineering'
  );
  const [category, setCategory] = useState<string>(RESOURCE_CATEGORIES[0]);
  const [optionalNote, setOptionalNote] = useState('');

  // Attached Documents
  const [documents, setDocuments] = useState<DocumentInputRow[]>([
    {
      id: 'doc-1',
      title: '',
      file: null,
      file_url: null,
      file_type: null,
      file_size: null,
      isUploading: false,
      uploadError: null,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to release study resources');
      router.push('/login');
    } else if (user?.department && !department) {
      setDepartment(user.department);
    }
  }, [user, authLoading, router, department]);

  // Generate Year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 2009 },
    (_, i) => currentYear - i
  );

  // Add document row
  const addDocumentRow = () => {
    setDocuments((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: '',
        file: null,
        file_url: null,
        file_type: null,
        file_size: null,
        isUploading: false,
        uploadError: null,
      },
    ]);
  };

  // Remove document row
  const removeDocumentRow = (id: string) => {
    if (documents.length <= 1) {
      toast.error('A resource must contain at least one document');
      return;
    }
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  // Update document title
  const updateDocumentTitle = (id: string, newTitle: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, title: newTitle } : doc))
    );
  };

  // Handle file selection and immediate upload
  const handleFileChange = async (id: string, file: File | null) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`"${file.name}" exceeds the 10MB limit`);
      return;
    }

    // Auto-fill title if empty
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const autoTitle =
            doc.title.trim() === ''
              ? file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
              : doc.title;
          return {
            ...doc,
            title: autoTitle,
            file,
            isUploading: true,
            uploadError: null,
          };
        }
        return doc;
      })
    );

    try {
      const formData = new FormData();
      formData.append('document', file);

      const res = await apiFetch('/resources/upload-doc', {
        method: 'POST',
        body: formData,
      });

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                file_url: res.data.file_url,
                file_type: res.data.file_type,
                file_size: res.data.file_size,
                isUploading: false,
                uploadError: null,
              }
            : doc
        )
      );
      toast.success(`Uploaded "${file.name}" successfully`);
    } catch (err: any) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                isUploading: false,
                uploadError: err.message || 'File upload failed',
              }
            : doc
        )
      );
      toast.error(err.message || `Failed to upload "${file.name}"`);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Resource Title is required');
      return;
    }
    if (!courseName.trim()) {
      toast.error('Course Name is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    // Check if any document is currently uploading
    const stillUploading = documents.some((d) => d.isUploading);
    if (stillUploading) {
      toast.error('Please wait for file uploads to complete');
      return;
    }

    // Validate documents
    const validDocs = documents.filter((d) => d.file_url && d.title.trim());
    if (validDocs.length === 0) {
      toast.error('Please attach and upload at least one document with a title');
      return;
    }

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      if (!doc.file_url) {
        toast.error(`Document #${i + 1} has not been uploaded yet`);
        return;
      }
      if (!doc.title.trim()) {
        toast.error(`Please provide a title for Document #${i + 1}`);
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        title: title.trim(),
        course_name: courseName.trim(),
        course_code: courseCode.trim() || null,
        description: description.trim(),
        year: Number(year),
        semester,
        department,
        category,
        optional_note: optionalNote.trim() || null,
        documents: documents.map((d) => ({
          title: d.title.trim(),
          file_url: d.file_url!,
          file_type: d.file_type || undefined,
          file_size: d.file_size || undefined,
        })),
      };

      const res = await apiFetch('/resources', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('Resource released successfully!');
      router.push(`/resources/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to release resource');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8 space-y-6 sm:space-y-8">
      {/* Back button and page header */}
      <div className="space-y-3">
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Resources</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-0.5 text-[11px] font-medium text-red-400">
              <Sparkles className="h-3 w-3" />
              <span>Campus Contribution</span>
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-3xl">
              Release Academic Resource
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              Share exam questions, lecture notes, lab manuals, or slide decks with your campus peers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Section 1: Resource Overview */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-4 sm:p-6 lg:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/80">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-bold text-red-400 border border-red-500/20">
              1
            </span>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Resource Overview
            </h2>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Resource Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CSE 211 Data Structures Midterm Questions (Spring 2024)"
              className="input-field mt-1.5 text-xs sm:text-sm py-2.5 px-3.5"
            />
          </div>

          {/* Course Name & Course Code */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-300">
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="input-field mt-1.5 text-xs sm:text-sm py-2.5 px-3.5"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">
                Course Code <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CSE 211"
                className="input-field mt-1.5 text-xs sm:text-sm font-mono py-2.5 px-3.5 uppercase"
              />
            </div>
          </div>

          {/* Department & Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-field mt-1.5 text-xs sm:text-sm bg-zinc-950 py-2.5 px-3 cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field mt-1.5 text-xs sm:text-sm bg-zinc-950 py-2.5 px-3 cursor-pointer"
              >
                {RESOURCE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Year & Semester */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="input-field mt-1.5 text-xs sm:text-sm bg-zinc-950 py-2.5 px-3 cursor-pointer"
              >
                {yearOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="input-field mt-1.5 text-xs sm:text-sm bg-zinc-950 py-2.5 px-3 cursor-pointer"
              >
                {RESOURCE_SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what content, topics, or chapters are covered in this release..."
              className="input-field mt-1.5 text-xs sm:text-sm leading-relaxed p-3"
            />
          </div>
        </div>

        {/* Section 2: Attached Documents */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-4 sm:p-6 lg:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-bold text-red-400 border border-red-500/20">
                2
              </span>
              <div>
                <h2 className="text-sm font-semibold text-white tracking-wide">
                  Attached Documents
                </h2>
                <p className="text-[11px] text-zinc-400">
                  PDF, Word, PowerPoint, Text, Images, or ZIP (max 10MB per file).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addDocumentRow}
              className="btn-secondary self-start sm:self-auto inline-flex items-center gap-1.5 text-xs py-1.5 px-3 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Document</span>
            </button>
          </div>

          {/* Document Rows */}
          <div className="space-y-4">
            {documents.map((doc, idx) => (
              <DocumentRowItem
                key={doc.id}
                index={idx}
                doc={doc}
                canRemove={documents.length > 1}
                onRemove={() => removeDocumentRow(doc.id)}
                onTitleChange={(val) => updateDocumentTitle(doc.id, val)}
                onFileSelected={(file) => handleFileChange(doc.id, file)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addDocumentRow}
            className="w-full py-3 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40 text-xs font-medium text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-red-500" />
            <span>Add Another Document File</span>
          </button>
        </div>

        {/* Section 3: Optional Note */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-4 sm:p-6 lg:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/80">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 border border-zinc-700">
              3
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Optional Notes &amp; Advice
              </h2>
              <p className="text-[11px] text-zinc-400">
                Any specific tips, solutions advice, or context for students using this material.
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={3}
              value={optionalNote}
              onChange={(e) => setOptionalNote(e.target.value)}
              placeholder="e.g. Question 3 has partial solutions on the back. Formula sheet is attached on page 4."
              className="input-field text-xs sm:text-sm leading-relaxed p-3"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2 pb-16">
          <Link
            href="/resources"
            className="btn-secondary w-full sm:w-auto text-center text-xs py-2.5 px-5"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="btn-accent w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-7 disabled:opacity-50 cursor-pointer shadow-lg shadow-red-950/40"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Releasing Resource...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Release Resource</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Subcomponent for each document row with sleek modern dropzone
function DocumentRowItem({
  index,
  doc,
  canRemove,
  onRemove,
  onTitleChange,
  onFileSelected,
}: {
  index: number;
  doc: DocumentInputRow;
  canRemove: boolean;
  onRemove: () => void;
  onTitleChange: (val: string) => void;
  onFileSelected: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/60 p-4 sm:p-5 space-y-4 transition-colors hover:border-zinc-700">
      {/* Row Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 font-mono">
            #{index + 1}
          </span>
          <span className="text-xs font-medium text-white">
            {doc.title ? doc.title : `Document Attachment`}
          </span>
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
            title="Remove document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3.5">
        {/* Document Title Input */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-300">
            Document Display Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={doc.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Midterm Question Paper 2024"
            className="input-field mt-1 text-xs sm:text-sm py-2 px-3"
          />
        </div>

        {/* Custom Styled Upload Box */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-300 mb-1">
            File Attachment <span className="text-red-500">*</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onFileSelected(e.target.files[0]);
              }
            }}
          />

          {doc.isUploading ? (
            /* Uploading State */
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-red-500 mb-2" />
              <p className="text-xs font-medium text-zinc-200">Uploading to cloud storage...</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Please keep this window open</p>
            </div>
          ) : doc.file_url ? (
            /* Uploaded & Ready State */
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-semibold text-white">
                      {doc.file?.name || doc.title}
                    </p>
                    <span className="rounded bg-emerald-900/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300 shrink-0">
                      Uploaded
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400/80 mt-0.5 font-mono">
                    {doc.file_type?.toUpperCase()} • {formatFileSize(doc.file_size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary self-start sm:self-auto text-[11px] py-1 px-2.5 cursor-pointer shrink-0"
              >
                Change File
              </button>
            </div>
          ) : (
            /* Empty / Select File Dropzone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 sm:p-6 text-center hover:border-zinc-700 hover:bg-zinc-900/50 transition-all cursor-pointer group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 group-hover:text-red-400 group-hover:bg-red-500/10 transition-colors mb-2">
                <FileUp className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-zinc-200">
                Click to browse file <span className="hidden sm:inline font-normal text-zinc-400">or drag &amp; drop</span>
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                PDF, Word (.docx), PPTX, TXT, Images, or ZIP (up to 10MB)
              </p>
            </div>
          )}

          {doc.uploadError && (
            <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{doc.uploadError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
