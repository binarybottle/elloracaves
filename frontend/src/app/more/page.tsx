import Link from 'next/link';

const links = [
  {
    href: '/3d',
    title: '3D Models',
    description: '3D photogrammetry models of cave interiors and sculptures.',
  },
  {
    href: '/archives',
    title: 'Archival Images',
    description: 'Historical photographs, aquatints, etchings, and paintings.',
  },
  {
    href: '/book',
    title: 'Book Figures',
    description: 'Book information and all images tagged with figure and page numbers.',
  },
  {
    href: '/images',
    title: 'All Images',
    description: 'General image browser with cave/floor filtering and popup expansion.',
  },
];

export default function MorePage() {
  return (
    <div className="min-h-screen bg-black text-[#eae2c4]">
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
        <p className="text-gray-300 mb-8">
          Quick links to specialized image collections and overview pages.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg border border-gray-700 bg-gray-900/60 hover:bg-gray-800/80 hover:border-gray-500 transition-colors p-5"
            >
              <h2 className="text-xl text-white">{link.title}</h2>
              <p className="text-sm text-gray-300 mt-2">{link.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
