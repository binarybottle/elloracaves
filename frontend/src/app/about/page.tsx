'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CAVE_POSITIONS, getDropdownLabel } from '@/components/cave/CaveMap';
import { fetchCaveDetail, fetchCaveFloorImages, Cave, Image } from '@/lib/api';

export default function AboutPage() {
  const [caveData, setCaveData] = useState<Record<number, { caveId: number; cave: Cave; defaultImage: Image | null }>>({});
  const [loading, setLoading] = useState(true);

  // Fetch cave details and default images for all caves
  useEffect(() => {
    async function fetchAllCaves() {
      const allCaveIds = Object.keys(CAVE_POSITIONS).map(Number);
      const cavePromises = allCaveIds.map(async (caveId) => {
        try {
          const cave = await fetchCaveDetail(String(caveId));
          
          // Fetch first floor images to get default image
          if (cave.plans && cave.plans.length > 0) {
            const firstFloor = Math.min(...cave.plans.map((p) => p.floor_number));
            const images = await fetchCaveFloorImages(String(caveId), firstFloor);
            const defaultImage = images.find((img) => img.image_url && img.image_url.trim() !== '') || null;
            return { caveId, cave, defaultImage };
          }
          return { caveId, cave, defaultImage: null };
        } catch (error) {
          console.error(`Error fetching cave ${caveId}:`, error);
          return null;
        }
      });

      const results = await Promise.all(cavePromises);
      const dataMap: Record<number, { caveId: number; cave: Cave; defaultImage: Image | null }> = {};
      results.forEach((result) => {
        if (result) {
          dataMap[result.caveId] = result;
        }
      });
      setCaveData(dataMap);
      setLoading(false);
    }

    fetchAllCaves();
  }, []);

  // Get tradition for each cave
  const getTradition = (caveId: number): string => {
    if ((caveId >= 1 && caveId <= 12) || (caveId >= 10001 && caveId <= 10017) || (caveId >= 20001 && caveId <= 20003)) return 'Buddhist';
    if ((caveId >= 13 && caveId <= 29) || (caveId >= 1016 && caveId <= 4016) || caveId === 120 || caveId === 220 || caveId === 20 || caveId === 124 || caveId === 224) return 'Hindu';
    if ((caveId >= 30 && caveId <= 34) || caveId === 130 || caveId === 132) return 'Jain';
    return 'Unknown';
  };

  // Sort caves using the same logic as dropdown menus
  const favoriteOrder = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,1016,4016,3016,2016,17,18,19,120,220,21,22,23,24,124,224,25,26,27,28,29,30,130,31,32,33,34,10001,10006,10008,10013,10017,20001,20003];
  
  const sortedCaves = Object.keys(CAVE_POSITIONS)
    .map(Number)
    .sort((a, b) => {
      const indexA = favoriteOrder.indexOf(a);
      const indexB = favoriteOrder.indexOf(b);
      
      // If both in favorites, sort by favorite order
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // If only A is favorite, it comes first
      if (indexA !== -1) return -1;
      // If only B is favorite, it comes first
      if (indexB !== -1) return 1;
      // Neither is favorite, sort numerically
      return a - b;
    });

  const traditionColors = {
    Buddhist: 'bg-blue-900/20 border-blue-600/50 hover:bg-blue-900/40',
    Hindu: 'bg-orange-900/20 border-orange-600/50 hover:bg-orange-900/40',
    Jain: 'bg-green-900/20 border-green-600/50 hover:bg-green-900/40',
    Unknown: 'bg-gray-900/20 border-gray-600/50 hover:bg-gray-900/40',
  };

  return (
    <div className="min-h-screen bg-black text-[#eae2c4]">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl ">About the Ellora Caves and elloracaves.org</h1>
            <Link
              href="/explore?cave=10&floor=1"
              className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Explore the Caves
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* About Section */}
        <section className="mb-16">
          <div className="prose prose-invert max-w-none space-y-4 text-base leading-relaxed">
            <p>
              The Ellora Caves are a UNESCO World Heritage Site located near Aurangabad, Maharashtra, India. 
              These rock-cut caves represent one of the largest cave-temple complexes in the world, featuring 
              Buddhist, Hindu, and Jain monuments and artwork dating from 600-1000 CE.
              The 34 main caves stretch along an escarpment for about 2 kilometers. Caves 1-12 are Buddhist, 
              caves 13-29 are Hindu, and caves 30-34 are Jain. In addition to these, there are numerous satellite 
              shrines and cave groups.
              This site aims to provide comprehensive photographic documentation of Ellora, 
              including architectural features, sculptural elements, and iconographic details, 
              with their locations displayed on floor plans.
              <br/>
            </p>

          </div>
        </section>

        {/* Book Section */}
        <section className="mb-16">
          <h2 className="text-2xl mb-6 text-white">Upcoming Book</h2>
          <div className="prose prose-invert max-w-none space-y-4 text-base leading-relaxed">
            <p>
              The book &ldquo;<b>Ellora: Cross-fertilization of Style in Buddhist, 
              Hindu and Jain Cave Temples</b>&rdquo; will be published by Mapin in early 2026. 
              The contributing authors investigate the temples by religion and myth, patronage and support, 
              stylistic influence and exchange, chronology, and the process of carving and completion 
              of these rock-cut temples. The book includes extensive photographic documentation, ground plans, 
              and rarely seen 19th-century archival materials. <i>[Co-edited by Deepanjana Klein and Arno Klein, 
                with contributing authors Nicolas Morrissey, Lisa N. Owen, Vidya Dehejia, and Pia Brancaccio.]</i>
            </p>
          </div>
        </section>

        {/* Caves Grid */}
        <section>
          <h2 className="text-2xl mb-6 text-white">Explore the caves</h2>
          
          {/* Legend - above grid */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600/50 rounded"></div>
                <span>Buddhist (1-12, Ganeshleni, Jogeshwari)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-600/50 rounded"></div>
                <span>Hindu (13-29, Kailasa satellites, 20A, 20B, 24A shrines)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600/50 rounded"></div>
                <span>Jain (30-34, 30A, 32 Yadavas)</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Total {sortedCaves.length} caves displayed. Hover to see description.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading caves...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {sortedCaves.map((caveId) => {
                const tradition = getTradition(caveId);
                const label = getDropdownLabel(caveId);
                const data = caveData[caveId];
                const defaultImage = data?.defaultImage;
                const description = data?.cave?.description || '';

                return (
                  <Link
                    key={caveId}
                    href={`/explore?cave=${caveId}&floor=1`}
                    className={`
                      group relative rounded-lg border-2 transition-all overflow-hidden
                      ${traditionColors[tradition as keyof typeof traditionColors]}
                    `}
                    title={description}
                  >
                    {/* Image */}
                    <div className="aspect-square relative bg-gray-900">
                      {defaultImage ? (
                        <img
                          src={defaultImage.thumbnail_url || defaultImage.image_url}
                          alt={label}
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                          No image
                        </div>
                      )}
                    </div>
                    
                    {/* Cave Label */}
                    <div className="p-3 text-center">
                      <div className="text-sm font-bold leading-tight">{label}</div>
                    </div>

                    {/* Tooltip on hover */}
                    {description && (
                      <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-center justify-center">
                        <p className="text-xs text-white text-center line-clamp-6">{description}</p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Contributors Section */}
        <section className="mt-16 pt-8 border-t border-gray-800">
          <h2 className="text-2xl mb-6 text-white">Contributors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {/* Deepanjana Klein */}
            <div className="text-center max-w-xs">
              <div className="aspect-square relative rounded-lg overflow-hidden mb-3 bg-gray-800 flex items-center justify-center w-48 mx-auto">
                <img 
                  src="/images/contributors/DeepanjanaKlein.jpg" 
                  alt="Deepanjana Klein"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Deepanjana Klein</h3>
              <p className="text-sm text-gray-300">Has been documenting the Ellora cave temples since 1993. Provided annotations for the images.</p>
            </div>

            {/* Arno Klein */}
            <div className="text-center max-w-xs">
              <div className="aspect-square relative rounded-lg overflow-hidden mb-3 bg-gray-800 flex items-center justify-center w-48 mx-auto">
                <img 
                  src="/images/contributors/ArnoKlein.jpg" 
                  alt="Arno Klein"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Arno Klein</h3>
              <p className="text-sm text-gray-300">First visited Ellora in 1992 with Professor Walter Spink and has photographed the site ever since. Provided photographs and created the website.</p>
            </div>

            {/* Tristan Bruck */}
            <div className="text-center max-w-xs">
              <div className="aspect-square relative rounded-lg overflow-hidden mb-3 bg-gray-800 flex items-center justify-center w-48 mx-auto">
                <img 
                  src="/images/contributors/TristanBruck.jpg" 
                  alt="Tristan Bruck"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Tristan Bruck</h3>
              <p className="text-sm text-gray-300">Joined the team in 2011 to help assign coordinates for each sculpture on the floorplans.</p>
            </div>

            {/* Ellora Klein */}
            <div className="text-center max-w-xs">
              <div className="aspect-square relative rounded-lg overflow-hidden mb-3 bg-gray-800 flex items-center justify-center w-48 mx-auto">
                <img 
                  src="/images/contributors/ElloraKlein.jpg" 
                  alt="Ellora Klein"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Ellora Klein</h3>
              <p className="text-sm text-gray-300">Was in third grade when she assisted in the photography of the caves.</p>
            </div>

            {/* Others */}
           <div className="text-center max-w-xs">
              <div className="aspect-square relative rounded-lg overflow-hidden mb-3 bg-gray-800 flex items-center justify-center w-48 mx-auto">
                <img 
                  src="/images/contributors/Yunus.jpg" 
                  alt="Documentation team"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Assistants</h3>
              <p className="text-sm text-gray-300">Others have assisted with tripods and lighting, including Yunus and Karen Klein.</p>
            </div>

            {/* Walter Spink */}
            <div className="text-center max-w-xs">
              <div className="aspect-square relative rounded-lg overflow-hidden mb-3 bg-gray-800 flex items-center justify-center w-48 mx-auto">
                <img 
                  src="/images/contributors/WalterSpink.jpg" 
                  alt="Walter Spink"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Walter Spink</h3>
              <p className="text-sm text-gray-300">This website is dedicated to the memory of our dear friend and mentor.</p>
            </div>
          </div>
        </section>

        {/* Credit Info */}
        <section className="mt-16 pt-8 border-t border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-white">Credit</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p>Photographs copyright <a href="https://www.arnoklein.info/" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-500 transition-colors">Arno Klein</a>. 
            All other content copyright Deepanjana Klein.
            </p>
          </div>
        </section>
              
        {/* Funding Info */}
        <section className="mt-16 pt-8 border-t border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-white">Funding</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p>This project has received funding from <a href="https://www.jstor.org/site/artstor/DeepanjanaDandaKleinandArnoKleinCaveTemplesatElloraIndia-100142607/?so=item_title_str_asc&searchkey=1764397712671&pagemark=eyJwYWdlIjoyLCJzdGFydCI6MjUsInRvdGFsIjozMDI5fQ%253D%253D" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-500 transition-colors">ArtStor</a>.
            </p>
          </div>
        </section>
              
        {/* Technical Info */}
        <section className="mt-16 pt-8 border-t border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-white">Technical Information</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p><strong>Website:</strong> Arno Klein</p>
            <p><strong>Frontend:</strong> Next.js, React, TypeScript, Tailwind CSS</p>
            <p><strong>Backend:</strong> Supabase PostgreSQL</p>
            <p><strong>Features:</strong> Interactive floor plans, advanced search with fuzzy matching, cave filters</p>
          </div>
        </section>
      </main>
    </div>
  );
}
