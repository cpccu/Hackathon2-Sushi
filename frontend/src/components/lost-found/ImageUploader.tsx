'use client';

import React, { useState, useRef } from 'react';
import { uploadLostFoundImage } from '@/lib/api/lostFound';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 3,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const selectedFiles = Array.from(fileList).slice(0, remainingSlots);

    // Validate size and mime type
    for (const f of selectedFiles) {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} is not an image file`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} exceeds the 5MB size limit`);
        return;
      }
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of selectedFiles) {
        const url = await uploadLostFoundImage(file);
        newUrls.push(url);
      }
      onChange([...images, ...newUrls]);
      toast.success(`${newUrls.length} image(s) uploaded successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      {/* Existing Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
            >
              <img
                src={url}
                alt={`Uploaded ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 rounded-full bg-black/75 p-1.5 text-zinc-300 transition-all hover:bg-red-600 hover:text-white active:scale-90"
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute bottom-1.5 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-zinc-400">
                Photo {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone (if under maxImages) */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-red-500 bg-red-500/5'
              : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/40'
          } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={maxImages - images.length > 1}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 className="h-7 w-7 animate-spin text-red-500" />
              <p className="text-xs font-medium">Uploading to cloud...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-zinc-900 p-3 text-zinc-400 border border-zinc-800">
                <UploadCloud className="h-6 w-6 text-zinc-300" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-200">
                  <span className="text-red-400 underline">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  PNG, JPG, WEBP up to 5MB (Max {maxImages} images, {images.length}/{maxImages} uploaded)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
