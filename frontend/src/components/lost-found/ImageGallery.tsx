'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  itemName: string;
}

export default function ImageGallery({ images, itemName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-500">
        No images available
      </div>
    );
  }

  const activeImage = images[selectedIndex] || images[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-3">
      {/* Main Image Viewer */}
      <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-inner">
        <img
          src={activeImage}
          alt={`${itemName} - photo ${selectedIndex + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        {/* Expand / Lightbox button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 right-3 rounded-lg bg-black/60 p-2 text-white backdrop-blur-md transition-all duration-150 hover:bg-black/90 active:scale-90"
          title="View full image"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Carousel buttons if > 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-md transition-all duration-150 hover:bg-black/90 active:scale-90"
              title="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-md transition-all duration-150 hover:bg-black/90 active:scale-90"
              title="Next photo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Image count watermark */}
        <div className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-zinc-300 backdrop-blur-sm">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Strip (if > 1 image) */}
      {images.length > 1 && (
        <div className="flex gap-2.5">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-[16/10] w-20 overflow-hidden rounded-lg border-2 transition-all duration-150 active:scale-95 ${
                selectedIndex === idx
                  ? 'border-red-500 ring-2 ring-red-500/30'
                  : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-700'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-in fade-in duration-200">
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-zinc-800/80 p-2.5 text-zinc-300 hover:text-white hover:bg-zinc-700 active:scale-90"
            title="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800/80 p-3 text-zinc-200 hover:text-white hover:bg-zinc-700 active:scale-90"
                title="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800/80 p-3 text-zinc-200 hover:text-white hover:bg-zinc-700 active:scale-90"
                title="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Main expanded image */}
          <div className="max-h-[85vh] max-w-[90vw] overflow-hidden rounded-xl">
            <img
              src={activeImage}
              alt={itemName}
              className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl"
            />
          </div>

          {/* Footer details */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900/80 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur-md border border-zinc-800">
            {itemName} ({selectedIndex + 1} of {images.length})
          </div>
        </div>
      )}
    </div>
  );
}
