'use client';

import Script from 'next/script';
import { Image as ImageType } from '@/lib/api';

interface ArchivalImage {
  id: number;
  thumbnail_url: string;
  image_url: string;
  subject?: string;
}

interface Model3DItem {
  model_id: number;
  title: string;
  file_url: string;
  poster_url: string | null;
  cave_id: number;
}

interface ImageInfoPanelProps {
  image: any;
  cave: any;
  collapsible?: boolean;
  similarImages?: ImageType[];
  selectedImageId?: number;
  onImageSelect?: (img: ImageType) => void;
  archivalImages?: ArchivalImage[];
  onSelectArchival?: (img: ArchivalImage) => void;
  models3d?: Model3DItem[];
  onSelectModel3d?: (m: Model3DItem) => void;
}

export default function ImageInfoPanel({
  image, cave, collapsible = false,
  similarImages = [], selectedImageId, onImageSelect,
  archivalImages = [],  onSelectArchival,
  models3d = [], onSelectModel3d,
}: ImageInfoPanelProps) {
  if (!image) return null;

  const hasSimilar = similarImages.length > 0;
  const hasArchival = archivalImages.length > 0;
  const has3D = models3d.length > 0;

  const content = (
    <div className="space-y-4">
      {/* Similar images */}
      {hasSimilar && (
        <div>
          <div className="text-xs text-gray-400 mb-1">Similar images</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {similarImages.map((img) => (
              <button
                key={img.id}
                onClick={() => onImageSelect?.(img)}
                className={`block h-16 flex-shrink-0 rounded overflow-hidden ${selectedImageId === img.id ? 'ring-2 ring-red-600' : ''}`}
              >
                <img
                  src={img.thumbnail_url || img.image_url}
                  alt={img.subject || `Image ${img.id}`}
                  className="h-full w-auto object-contain"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Archival images */}
      {hasArchival && (
        <div>
          <div className="text-xs text-gray-400 mb-1">Archival images</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {archivalImages.map((img) => (
              <button
                key={img.id}
                onClick={() => onSelectArchival?.(img)}
                className="block h-16 flex-shrink-0 rounded overflow-hidden hover:ring-2 hover:ring-gray-500"
              >
                <img
                  src={img.thumbnail_url}
                  alt={img.subject || `Archival ${img.id}`}
                  className="h-full w-auto object-contain"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3D models */}
      {has3D && (
        <div>
          <Script
            type="module"
            src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
            strategy="afterInteractive"
          />
          <div className="text-xs text-gray-400 mb-1">3D models</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {models3d.map((m) => (
              <button
                key={m.model_id}
                onClick={() => onSelectModel3d?.(m)}
                className="block h-16 w-24 flex-shrink-0 bg-gray-950 rounded overflow-hidden border border-gray-800 hover:border-gray-600 transition-colors"
              >
                {/* @ts-expect-error model-viewer web component */}
                <model-viewer
                  src={m.file_url}
                  poster={m.poster_url || undefined}
                  alt={m.title}
                  loading="lazy"
                  reveal="auto"
                  interaction-prompt="none"
                  style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Annotations */}
      <div className={`space-y-2 ${(hasSimilar || hasArchival || has3D) ? 'pt-2 border-t border-gray-800' : ''}`}>
        {image.subject && (
          <h2 className="text-xl text-[#eae2c4] mb-2">{image.subject}</h2>
        )}

        {image.description && (
          <p className="text-xs text-[#eae2c4] leading-relaxed">{image.description}</p>
        )}

        <div className="text-xs space-y-1 pt-1">
          <div>
            <span className="text-gray-400">Location: </span>
            <span className="text-[#eae2c4]">
              {cave?.name || `Cave ${image.cave_id}`}
              {(image.floor_number ?? 0) > 1 && ` (floor ${image.floor_number})`}
            </span>
          </div>
          <div className="text-gray-400">
            {image.photographer && <span>Photographer: {image.photographer} </span>}
            <span className="text-gray-600">{image.photographer ? `(ID:${image.id})` : `ID:${image.id}`}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <details className="bg-black rounded-lg p-4" open>
        <summary className="cursor-pointer font-semibold text-[#eae2c4] mb-4">
          Image Details
        </summary>
        {content}
      </details>
    );
  }

  return (
    <div className="bg-black rounded-lg p-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {content}
    </div>
  );
}
