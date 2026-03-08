'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getThumbnailUrl } from '@/lib/cloudflare-images';

const RIGHT_LION_URL = 'https://pub-97ab8e2d08bd421f948bc770a086ecb0.r2.dev/3d/c29_south-entrance-right-lion.glb';

interface SampleImage {
  cloudflare_image_id: string | null;
  cloudflare_thumbnail_id: string | null;
  file_path: string;
  thumbnail: string | null;
}

export default function MorePage() {
  const [samples, setSamples] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchSamples() {
      const toThumb = (row: SampleImage) =>
        getThumbnailUrl(row.cloudflare_image_id, row.cloudflare_thumbnail_id, row.file_path, row.thumbnail);

      const imgQuery = (caveId: number) =>
        supabase.from('images')
          .select('cloudflare_image_id, cloudflare_thumbnail_id, file_path, thumbnail')
          .eq('cave_id', caveId).eq('rank', 1)
          .not('cloudflare_image_id', 'is', null)
          .order('default_priority', { ascending: false })
          .limit(1);

      const [bookCaveResult, archivalResult, imagesResult] = await Promise.all([
        imgQuery(16),
        supabase.from('images').select('cloudflare_image_id, cloudflare_thumbnail_id, file_path, thumbnail')
          .eq('archival', true).not('cloudflare_image_id', 'is', null).limit(1),
        supabase.from('images').select('cloudflare_image_id, cloudflare_thumbnail_id, file_path, thumbnail')
          .eq('rank', 1).not('cloudflare_image_id', 'is', null)
          .order('default_priority', { ascending: false }).limit(1),
      ]);

      const result: Record<string, string> = {};
      if (bookCaveResult.data?.[0]) result['/book'] = toThumb(bookCaveResult.data[0] as SampleImage);
      if (archivalResult.data?.[0]) result['/archives'] = toThumb(archivalResult.data[0] as SampleImage);
      if (imagesResult.data?.[0]) result['/images'] = toThumb(imagesResult.data[0] as SampleImage);

      setSamples(result);
    }
    fetchSamples();
  }, []);

  const links = [
    { href: '/3d', title: '3D Models', description: '3D photogrammetry models of cave interiors and sculptures.' },
    { href: '/archives', title: 'Archival Images', description: 'Historical photographs, aquatints, etchings, and paintings.' },
    { href: '/book', title: 'Book Figures', description: 'Book information and all images tagged with figure and page numbers.' },
    { href: '/images', title: 'All Images', description: 'General image browser with cave/floor filtering and popup expansion.' },
  ];

  return (
    <div className="min-h-screen bg-black text-[#eae2c4]">
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />

      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl text-white">More</h1>
            <div className="flex flex-wrap gap-2">
              <Link href="/explore?cave=10" className="px-3 py-2 bg-white text-black rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors">
                Explore
              </Link>
              <Link href="/about" className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-sm hover:bg-white/20 transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex gap-4 items-start rounded-lg border border-gray-700 bg-gray-900/60 hover:bg-gray-800/80 hover:border-gray-500 transition-colors p-4"
            >
              <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-950 flex items-center justify-center">
                {link.href === '/3d' ? (
                  // @ts-expect-error model-viewer web component
                  <model-viewer
                    src={RIGHT_LION_URL}
                    alt="South entrance right lion"
                    auto-rotate=""
                    interaction-prompt="none"
                    style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                  />
                ) : samples[link.href] ? (
                  <img src={samples[link.href]} alt={link.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-800" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl text-white">{link.title}</h2>
                <p className="text-sm text-gray-300 mt-1">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
