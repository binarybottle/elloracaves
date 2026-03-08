'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getDropdownLabel } from '@/components/cave/CaveMap';

interface Model3D {
  model_id: number;
  cave_id: number;
  plan_id: number | null;
  title: string;
  description: string | null;
  file_url: string;
  poster_url: string | null;
  file_size: number | null;
  source_app: string | null;
  photographer: string | null;
  capture_date: string | null;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ThreeDPage() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchModels() {
      const { data, error: fetchError } = await supabase
        .from('models_3d')
        .select('*')
        .order('cave_id')
        .order('title');

      if (fetchError) {
        if (fetchError.message.includes('does not exist') || fetchError.code === '42P01') {
          setModels([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setModels(data || []);
      setLoading(false);
    }

    fetchModels();
  }, []);

  const filteredModels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return models;
    return models.filter((model) => {
      const haystack = `${model.title} ${model.description || ''} ${model.photographer || ''}`.toLowerCase();
      return query.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [models, searchQuery]);

  const navigatePopup = useCallback((direction: -1 | 1) => {
    setSelectedModel((prev) => {
      if (!prev) return prev;
      const index = filteredModels.findIndex((m) => m.model_id === prev.model_id);
      const next = filteredModels[index + direction];
      return next ?? prev;
    });
  }, [filteredModels]);

  useEffect(() => {
    if (!selectedModel) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedModel(null);
      else if (event.key === 'ArrowRight') navigatePopup(1);
      else if (event.key === 'ArrowLeft') navigatePopup(-1);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedModel, navigatePopup]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading 3D models...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#eae2c4]">
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0/model-viewer.min.js"
        strategy="afterInteractive"
      />

      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl text-white">3D Models</h1>
            <div className="flex flex-wrap gap-2">
              <Link href="/explore?cave=10" className="px-3 py-2 bg-white text-black rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors">
                Explore
              </Link>
              <Link href="/more" className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-sm hover:bg-white/20 transition-colors">
                More
              </Link>
              <Link href="/about" className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-sm hover:bg-white/20 transition-colors">
                About
              </Link>
            </div>
          </div>
          <div className="mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, description, photographer..."
              className="w-full md:w-[440px] bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-gray-500 placeholder-gray-600"
            />
            <p className="text-xs text-gray-500 mt-2">
              {filteredModels.length} model{filteredModels.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <section className="mb-10 prose prose-invert max-w-none text-base leading-relaxed">
          <p>
            3D photogrammetry models of cave interiors and sculptures, captured with the Polycam app.
            Click any model to interact with it in 3D (orbit, pan, zoom).
          </p>
        </section>

        {filteredModels.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            {models.length === 0
              ? 'No 3D models have been added yet. Add models to the models_3d table to see them here.'
              : 'No models match the current search.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredModels.map((model) => (
              <div key={model.model_id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                <button
                  onClick={() => setSelectedModel(model)}
                  className="w-full text-left"
                >
                  <div className="aspect-[4/3] relative bg-gray-950 flex items-center justify-center">
                    {model.poster_url ? (
                      <img
                        src={model.poster_url}
                        alt={model.title}
                        className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-gray-600 text-center px-4">
                        <div className="text-3xl mb-1">&#x25A0;&#x25A0;&#x25A0;</div>
                        <div className="text-xs">3D Model</div>
                      </div>
                    )}
                  </div>
                </button>
                <div className="p-3 space-y-1">
                  <div className="text-sm text-[#eae2c4] font-medium truncate">{model.title}</div>
                  <div className="text-xs text-gray-500">
                    {getDropdownLabel(model.cave_id)}
                    {model.file_size ? ` · ${formatFileSize(model.file_size)}` : ''}
                  </div>
                  {model.photographer && (
                    <div className="text-xs text-gray-400 truncate">{model.photographer}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedModel && (() => {
        const index = filteredModels.findIndex((m) => m.model_id === selectedModel.model_id);
        const hasPrev = index > 0;
        const hasNext = index < filteredModels.length - 1;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedModel(null)}>
            <div className="relative max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedModel(null)} className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-gray-800 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center justify-center text-lg">&times;</button>

              {hasPrev && (
                <button onClick={() => navigatePopup(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 rounded-full bg-gray-800/80 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center justify-center text-xl">&lsaquo;</button>
              )}
              {hasNext && (
                <button onClick={() => navigatePopup(1)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 w-10 h-10 rounded-full bg-gray-800/80 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center justify-center text-xl">&rsaquo;</button>
              )}

              <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-950 rounded-t-lg" style={{ minHeight: '60vh' }}>
                {/* @ts-expect-error model-viewer is a web component not known to React's JSX types */}
                <model-viewer
                  src={selectedModel.file_url}
                  poster={selectedModel.poster_url || undefined}
                  alt={selectedModel.title}
                  camera-controls=""
                  touch-action="pan-y"
                  auto-rotate=""
                  shadow-intensity="1"
                  style={{ width: '100%', height: '60vh' }}
                />
              </div>

              <div className="bg-gray-900 rounded-b-lg px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-[#eae2c4] font-medium">{selectedModel.title}</span>
                <span className="text-gray-500">{getDropdownLabel(selectedModel.cave_id)}</span>
                {selectedModel.description && <span className="text-gray-400 text-xs">{selectedModel.description}</span>}
                {selectedModel.photographer && <span className="text-gray-500 text-xs">Photo: {selectedModel.photographer}</span>}
                {selectedModel.file_size && <span className="text-gray-600 text-xs">{formatFileSize(selectedModel.file_size)}</span>}
                <a href={selectedModel.file_url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-blue-400 hover:text-blue-300 underline">Download GLB</a>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
