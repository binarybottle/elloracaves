'use client';

interface ImageInfoPanelProps {
  image: any;
  cave: any;
  collapsible?: boolean;
}

export default function ImageInfoPanel({ image, cave, collapsible = false }: ImageInfoPanelProps) {
  if (!image) {
    return null;
  }

  const content = (
    <div className="space-y-2">
      {/* Subject/Title */}
      {image.subject && (
        <div>
          <h2 className="text-xl text-[#eae2c4] mb-2">{image.subject}</h2>
        </div>
      )}

      {/* Description */}
      {image.description && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">Description</h3>
          <p className="text-sm text-[#eae2c4] leading-relaxed">{image.description}</p>
        </div>
      )}

      {/* Photographer - single line */}
      {image.photographer && (
        <p className="text-xs text-[#eae2c4]">
          <span className="text-gray-400">Photographer:</span> {image.photographer}
        </p>
      )}

      {/* Location and File Information - grouped together */}
      <div className="text-xs space-y-2 pt-1">
        <div>
          <div className="text-gray-400">Location:</div>
          <div className="text-[#eae2c4]">
            {cave?.name || `Cave ${image.cave_id}`}
            {image.floor_number && ` (floor ${image.floor_number})`}
          </div>
        </div>
        <div>
          <div className="text-gray-400">File Information:</div>
          <div className="text-gray-600">{image.file_path} ({image.id})</div>
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
    <div className="bg-black rounded-lg p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
      {content}
    </div>
  );
}

