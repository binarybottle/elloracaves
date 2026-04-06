'use client';

import { useState } from 'react';
import { Star, X, History, Box } from 'lucide-react';
import { Image as ImageType } from '@/lib/api';
import { GroupInfo } from '@/lib/group-colors';

type TextFieldName = 'subject' | 'description' | 'photographer' | 'medium';

interface GroupReviewOverlayProps {
  images: ImageType[];
  groupColorMap?: Map<number, GroupInfo>;
  onClose: () => void;
  onChangeBest: (newBestId: number) => void;
  onUpdateRank: (imageId: number, rank: number) => void;
  onToggleHidePlanXY?: (imageId: number, currentValue: boolean) => void;
  onUpdateArrayField?: (imageId: number, field: 'archival_ids' | 'model3d_ids', ids: number[] | null) => void;
  onUpdateTextField?: (imageId: number, field: TextFieldName, value: string | null) => void;
}

export default function GroupReviewOverlay({
  images,
  groupColorMap,
  onClose,
  onChangeBest,
  onUpdateRank,
  onToggleHidePlanXY,
  onUpdateArrayField,
  onUpdateTextField,
}: GroupReviewOverlayProps) {
  const [editingRankId, setEditingRankId] = useState<number | null>(null);
  const [rankInput, setRankInput] = useState('');
  const [editingField, setEditingField] = useState<{ imageId: number; field: 'archival_ids' | 'model3d_ids' } | null>(null);
  const [fieldInput, setFieldInput] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="max-w-4xl mx-auto py-8 px-4 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between sticky top-0 z-10 bg-black/90 backdrop-blur py-3 px-1 -mx-1 rounded-lg">
          <span className="text-white text-lg">
            Reviewing {images.length} images
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {images.map(img => {
          const groupInfo = groupColorMap?.get(img.id);
          const isRoot = groupInfo && groupInfo.rootId === img.id;
          const isEditingRank = editingRankId === img.id;
          const largeUrl = img.image_url;

          return (
            <div
              key={img.id}
              className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800"
            >
              <img
                src={largeUrl}
                alt={img.subject || `#${img.id}`}
                className="w-full object-contain max-h-[70vh]"
              />
              <div className="px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="text-gray-500">#{img.id}</span>
                {img.subject && (
                  <span className="text-[#eae2c4]">{img.subject}</span>
                )}

                {/* Rank badge */}
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Rank</span>
                  {isEditingRank ? (
                    <form
                      className="inline-flex"
                      onSubmit={e => {
                        e.preventDefault();
                        const val = parseInt(rankInput, 10);
                        if (!isNaN(val)) onUpdateRank(img.id, val);
                        setEditingRankId(null);
                      }}
                    >
                      <input
                        type="number"
                        value={rankInput}
                        onChange={e => setRankInput(e.target.value)}
                        className="w-12 bg-gray-800 text-white text-xs text-center rounded border border-gray-600 px-1 py-0.5"
                        autoFocus
                        onBlur={() => setEditingRankId(null)}
                      />
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingRankId(img.id);
                        setRankInput(String(img.rank));
                      }}
                      className="bg-white/90 text-black text-xs font-bold px-1.5 py-0.5 rounded hover:bg-white transition-colors"
                    >
                      {img.rank}
                    </button>
                  )}
                </div>

                {/* Landmark toggle */}
                {onToggleHidePlanXY && (
                  (img.coordinates?.plan_x_norm != null || img.mx != null) ? (
                    <button
                      onClick={() => onToggleHidePlanXY(img.id, img.hide_plan_xy || false)}
                      className="flex items-center gap-1.5"
                      title={img.hide_plan_xy ? 'Landmark hidden — click to show' : 'Landmark shown — click to hide'}
                    >
                      <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm transition-colors ${
                        img.hide_plan_xy ? 'bg-gray-500' : 'bg-[#6ebd20]'
                      }`} />
                      <span className="text-xs text-gray-500">{img.hide_plan_xy ? 'hidden' : 'on plan'}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-gray-600">no marker</span>
                  )
                )}

                {/* Archival IDs */}
                {onUpdateArrayField && (
                  <div className="flex items-center gap-1.5">
                    <History className="w-3 h-3 text-amber-400" />
                    {editingField?.imageId === img.id && editingField.field === 'archival_ids' ? (
                      <form
                        className="inline-flex"
                        onSubmit={e => {
                          e.preventDefault();
                          const ids = fieldInput.trim()
                            ? fieldInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
                            : [];
                          onUpdateArrayField(img.id, 'archival_ids', ids.length > 0 ? ids : null);
                          setEditingField(null);
                        }}
                      >
                        <input
                          type="text"
                          value={fieldInput}
                          onChange={e => setFieldInput(e.target.value)}
                          placeholder="e.g. 12,34"
                          className="w-20 bg-gray-800 text-white text-xs text-center rounded border border-gray-600 px-1 py-0.5"
                          autoFocus
                          onBlur={() => setEditingField(null)}
                        />
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingField({ imageId: img.id, field: 'archival_ids' });
                          setFieldInput((img.archival_ids || []).join(','));
                        }}
                        className="text-xs text-gray-300 hover:text-white underline decoration-dotted transition-colors"
                        title="Archival image IDs (comma-separated)"
                      >
                        {img.archival_ids?.length ? img.archival_ids.join(',') : '—'}
                      </button>
                    )}
                  </div>
                )}

                {/* 3D Model IDs */}
                {onUpdateArrayField && (
                  <div className="flex items-center gap-1.5">
                    <Box className="w-3 h-3 text-cyan-400" />
                    {editingField?.imageId === img.id && editingField.field === 'model3d_ids' ? (
                      <form
                        className="inline-flex"
                        onSubmit={e => {
                          e.preventDefault();
                          const ids = fieldInput.trim()
                            ? fieldInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
                            : [];
                          onUpdateArrayField(img.id, 'model3d_ids', ids.length > 0 ? ids : null);
                          setEditingField(null);
                        }}
                      >
                        <input
                          type="text"
                          value={fieldInput}
                          onChange={e => setFieldInput(e.target.value)}
                          placeholder="e.g. 1,2"
                          className="w-16 bg-gray-800 text-white text-xs text-center rounded border border-gray-600 px-1 py-0.5"
                          autoFocus
                          onBlur={() => setEditingField(null)}
                        />
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingField({ imageId: img.id, field: 'model3d_ids' });
                          setFieldInput((img.model3d_ids || []).join(','));
                        }}
                        className="text-xs text-gray-300 hover:text-white underline decoration-dotted transition-colors"
                        title="3D model IDs (comma-separated)"
                      >
                        {img.model3d_ids?.length ? img.model3d_ids.join(',') : '—'}
                      </button>
                    )}
                  </div>
                )}

                {/* Set as best */}
                <button
                  onClick={() => onChangeBest(img.id)}
                  className={`ml-auto flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    isRoot
                      ? 'bg-yellow-600 text-white cursor-default'
                      : 'bg-gray-700 hover:bg-yellow-700 text-gray-300 hover:text-white'
                  }`}
                  disabled={!!isRoot}
                >
                  <Star className={`w-3 h-3 ${isRoot ? 'fill-white' : ''}`} />
                  {isRoot ? 'Best' : 'Set as best'}
                </button>
              </div>

              {/* Text annotation fields */}
              {onUpdateTextField && (
                <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                  {([
                    { field: 'subject' as TextFieldName, label: 'Subject', rows: 1 },
                    { field: 'photographer' as TextFieldName, label: 'Photographer', rows: 1 },
                    { field: 'medium' as TextFieldName, label: 'Medium', rows: 1 },
                    { field: 'description' as TextFieldName, label: 'Description', rows: 2 },
                  ]).map(({ field, label, rows }) => (
                    <div key={field} className={field === 'description' ? 'col-span-2' : ''}>
                      <label className="text-[10px] text-gray-600 block mb-0.5">{label}</label>
                      {rows > 1 ? (
                        <textarea
                          defaultValue={(img as any)[field] || ''}
                          onBlur={e => {
                            const val = e.target.value.trim();
                            if (val !== ((img as any)[field] || '')) onUpdateTextField(img.id, field, val || null);
                          }}
                          className="w-full bg-gray-800 text-white text-xs rounded border border-gray-700 px-1.5 py-1 resize-none"
                          rows={rows}
                          placeholder={`${label}...`}
                        />
                      ) : (
                        <input
                          type="text"
                          defaultValue={(img as any)[field] || ''}
                          onBlur={e => {
                            const val = e.target.value.trim();
                            if (val !== ((img as any)[field] || '')) onUpdateTextField(img.id, field, val || null);
                          }}
                          className="w-full bg-gray-800 text-white text-xs rounded border border-gray-700 px-1.5 py-1"
                          placeholder={`${label}...`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
