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
    <div className="space-y-4">
      {/* Subject/Title */}
      {image.subject && (
        <div>
          <h2 className="text-2xl font-bold text-[#eae2c4] mb-2">{image.subject}</h2>
        </div>
      )}

      {/* Description */}
      {image.description && (
        <div>
          <h3 className="text-base font-semibold text-gray-400 mb-1">Description</h3>
          <p className="text-base text-[#eae2c4] leading-relaxed">{image.description}</p>
        </div>
      )}

      {/* Motifs */}
      {image.motifs && (
        <div>
          <h3 className="text-base font-semibold text-gray-400 mb-1">Motifs</h3>
          <div className="flex flex-wrap gap-2">
            {image.motifs.split(',').map((motif: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-black border border-gray-700 text-[#eae2c4] rounded text-sm"
              >
                {motif.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Medium */}
      {image.medium && (
        <div>
          <h3 className="text-base font-semibold text-gray-400 mb-1">Medium</h3>
          <p className="text-base text-[#eae2c4]">{image.medium}</p>
        </div>
      )}

      {/* Location */}
      <div className="pt-4 border-t border-gray-700">
        <h3 className="text-base font-semibold text-gray-400 mb-1">Location</h3>
        <p className="text-base text-[#eae2c4]">{cave?.name || `Cave ${image.cave_id}`}</p>
        {image.floor_number && (
          <p className="text-sm text-gray-500 mt-1">Floor {image.floor_number}</p>
        )}
        {image.coordinates && (
          <p className="text-xs text-gray-600 mt-1">
            Coordinates: ({image.coordinates.plan_x_norm?.toFixed(3)},{' '}
            {image.coordinates.plan_y_norm?.toFixed(3)})
          </p>
        )}
      </div>

      {/* Photographer */}
      {image.photographer && (
        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-base font-semibold text-gray-400 mb-1">Photographer</h3>
          <p className="text-base text-[#eae2c4]">{image.photographer}</p>
        </div>
      )}

      {/* File Information */}
      <div className="pt-4 border-t border-gray-700">
        <h3 className="text-base font-semibold text-gray-400 mb-1">File Information</h3>
        <p className="text-sm text-gray-600 break-all">{image.file_path}</p>
        <p className="text-sm text-gray-600 mt-1">ID: {image.id}</p>
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

