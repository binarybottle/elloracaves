import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - Ellora Caves Documentation',
  description: 'About the Ellora Caves documentation project and cave temples',
};

export default function AboutPage() {
  const caves = [
    { number: 1, name: 'Cave 1', tradition: 'Buddhist', description: 'Vihara (monastery) with cells and shrine' },
    { number: 2, name: 'Cave 2', tradition: 'Buddhist', description: 'Vihara with Buddha shrine' },
    { number: 3, name: 'Cave 3', tradition: 'Buddhist', description: 'Two-storeyed vihara' },
    { number: 4, name: 'Cave 4', tradition: 'Buddhist', description: 'Large vihara with spacious hall' },
    { number: 5, name: 'Cave 5', tradition: 'Buddhist', description: 'Largest vihara with benches' },
    { number: 6, name: 'Cave 6', tradition: 'Buddhist', description: 'Two-storeyed vihara with shrine' },
    { number: 7, name: 'Cave 7', tradition: 'Buddhist', description: 'Two-storeyed vihara' },
    { number: 8, name: 'Cave 8', tradition: 'Buddhist', description: 'Vihara with shrine' },
    { number: 9, name: 'Cave 9', tradition: 'Buddhist', description: 'Vihara with Buddha images' },
    { number: 10, name: 'Cave 10 (Vishvakarma)', tradition: 'Buddhist', description: 'Chaitya hall with stupa' },
    { number: 11, name: 'Cave 11 (Do Tal)', tradition: 'Buddhist', description: 'Three-storeyed vihara' },
    { number: 12, name: 'Cave 12 (Teen Tal)', tradition: 'Buddhist', description: 'Three-storeyed vihara' },
    { number: 13, name: 'Cave 13', tradition: 'Hindu', description: 'Small Hindu cave' },
    { number: 14, name: 'Cave 14 (Ravana ki Khai)', tradition: 'Hindu', description: 'Hindu cave with sculptures' },
    { number: 15, name: 'Cave 15 (Dashavatara)', tradition: 'Hindu', description: 'Two-storeyed Hindu cave' },
    { number: 16, name: 'Cave 16 (Kailasa)', tradition: 'Hindu', description: 'Monolithic temple, architectural marvel' },
    { number: 1016, name: 'Cave 16: Lankeshvara', tradition: 'Hindu', description: 'Satellite shrine of Kailasa' },
    { number: 4016, name: '16: southwest satellite', tradition: 'Hindu', description: 'Southwest satellite of Kailasa' },
    { number: 3016, name: '16: southeast satellite', tradition: 'Hindu', description: 'Southeast satellite of Kailasa' },
    { number: 2016, name: '16: north satellite', tradition: 'Hindu', description: 'North satellite of Kailasa' },
    { number: 17, name: 'Cave 17', tradition: 'Hindu', description: 'Hindu cave adjacent to Kailasa' },
    { number: 18, name: 'Cave 18', tradition: 'Hindu', description: 'Hindu cave with sculptures' },
    { number: 19, name: 'Cave 19', tradition: 'Hindu', description: 'Hindu cave' },
    { number: 20, name: 'Cave 20', tradition: 'Hindu', description: 'Hindu cave' },
    { number: 120, name: 'Cave 20 A', tradition: 'Hindu', description: 'Small shrine near Cave 20' },
    { number: 21, name: 'Cave 21 (Rameshvara)', tradition: 'Hindu', description: 'Shiva temple with fine carvings' },
    { number: 22, name: 'Cave 22', tradition: 'Hindu', description: 'Hindu cave' },
    { number: 23, name: 'Cave 23', tradition: 'Hindu', description: 'Hindu cave' },
    { number: 24, name: 'Cave 24', tradition: 'Hindu', description: 'Hindu cave' },
    { number: 124, name: '24 A shrine 1', tradition: 'Hindu', description: 'First shrine near Cave 24' },
    { number: 224, name: '24 A shrine 2', tradition: 'Hindu', description: 'Second shrine near Cave 24' },
    { number: 25, name: 'Cave 25', tradition: 'Hindu', description: 'Hindu cave' },
    { number: 26, name: 'Cave 26', tradition: 'Hindu', description: 'Hindu cave' },
    { number: 27, name: 'Cave 27', tradition: 'Hindu', description: 'Hindu cave' },
    { number: 28, name: 'Cave 28', tradition: 'Hindu', description: 'Hindu cave' },
    { number: 29, name: 'Cave 29 (Dhumar Lena)', tradition: 'Hindu', description: 'Shiva temple' },
    { number: 30, name: 'Cave 30', tradition: 'Jain', description: 'Small Jain cave' },
    { number: 130, name: 'Cave 30 A', tradition: 'Jain', description: 'Small shrine near Cave 30' },
    { number: 31, name: 'Cave 31', tradition: 'Jain', description: 'Jain cave' },
    { number: 32, name: 'Cave 32 (Indra Sabha)', tradition: 'Jain', description: 'Two-storeyed Jain temple' },
    { number: 132, name: '32 Yadavas', tradition: 'Jain', description: 'Yadavas cave' },
    { number: 33, name: 'Cave 33 (Jagannatha Sabha)', tradition: 'Jain', description: 'Small Jain temple' },
    { number: 34, name: 'Cave 34', tradition: 'Jain', description: 'Small Jain cave' },
    { number: 10001, name: 'Ganeshleni 1-5', tradition: 'Hindu', description: 'Ganeshleni cave group 1-5' },
    { number: 10006, name: 'Ganeshleni 6-7', tradition: 'Hindu', description: 'Ganeshleni cave group 6-7' },
    { number: 10008, name: 'Ganeshleni 8-12', tradition: 'Hindu', description: 'Ganeshleni cave group 8-12' },
    { number: 10013, name: 'Ganeshleni 13-16', tradition: 'Hindu', description: 'Ganeshleni cave group 13-16' },
    { number: 10017, name: 'Ganeshleni 17-19', tradition: 'Hindu', description: 'Ganeshleni cave group 17-19' },
    { number: 20001, name: 'Jogeshwari 1-2', tradition: 'Hindu', description: 'Jogeshwari cave group 1-2' },
    { number: 20003, name: 'Jogeshwari 3-4', tradition: 'Hindu', description: 'Jogeshwari cave group 3-4' },
  ];

  const traditionColors = {
    Buddhist: 'bg-blue-900/20 border-blue-600/50 hover:bg-blue-900/40',
    Hindu: 'bg-orange-900/20 border-orange-600/50 hover:bg-orange-900/40',
    Jain: 'bg-green-900/20 border-green-600/50 hover:bg-green-900/40',
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
          {/* <h2 className="text-2xl mb-6 text-white">About This Project</h2> */}
          <div className="prose prose-invert max-w-none space-y-4 text-base leading-relaxed">
            <p>
              The Ellora Caves are a UNESCO World Heritage Site located near Aurangabad, Maharashtra, India. 
              These rock-cut caves represent one of the largest cave-temple complexes in the world, featuring 
              Buddhist, Hindu, and Jain monuments and artwork dating from 600-1000 CE.
              The 34 main caves stretch along an escarpment for about 2 kilometers. Caves 1-12 are Buddhist, 
              caves 13-29 are Hindu, and caves 30-34 are Jain. In addition to these, there are numerous satellite 
              shrines and cave groups. The most famous is Cave 16, the Kailasa temple, 
              a monolithic structure carved from a single rock.
            </p>
            <p>
              This documentation project aims to provide comprehensive photographic documentation of the 
              Ellora cave temples, including architectural features, sculptural elements, 
              and iconographic details, with their locations displayed on floor plans.
            </p>
            <p>
              <i><b>Deepanjana Klein</b>, PhD, has been documenting the Ellora cave temples since 1993. 
              She was awarded a Mellon Foundation grant to create the first comprehensive photo documentation of the site. 
              Deepanjana is the Director of Acquisitions and Development at the Kiran Nadar Museum of Art.
            <br/>
              <b>Arno Klein</b>, PhD, first visited Ellora in 1992 with Professor Walter Spink. 
              Over the course of 3 decades he has photographed the site and created elloracaves.org. 
              Arno is a scientist at the Child Mind Institute in New York City.</i> 
            </p>
          </div>
        </section>

        {/* Book Section */}
        <section className="mb-16">
          <h2 className="text-2xl mb-6 text-white">Upcoming Book</h2>
          <div className="prose prose-invert max-w-none space-y-4 text-base leading-relaxed">
            <p>
              The book "<b>Ellora: Cross-fertilization of Style in Buddhist, 
              Hindu and Jain Cave Temples</b>" will be published by Mapin in early 2027. 
              The contributing authors investigate the temples by religion and myth, patronage and support, 
              stylistic influence and exchange, chronology, and the process of carving and completion 
              of these rock-cut temples. The book includes extensive photographic documentation, ground plans, 
              and rarely seen 19th-century archival materials.
            </p>
            <p>
              <i>Co-edited by Deepanjana Klein and Arno Klein, with contributing authors 
                Nicolas Morrissey, Lisa N. Owen, Vidya Dehejia, and Pia Brancaccio.</i>
            </p>
          </div>
        </section>

        {/* Caves Grid */}
        <section>
          <h2 className="text-2xl mb-6 text-white">Explore the caves</h2>
          {/* <p className="mb-6 text-gray-400">
            Click on any cave to begin exploring its architecture and sculptures. Includes the 34 main caves plus satellite shrines and nearby cave groups.
          </p> */}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {caves.map((cave) => (
              <Link
                key={cave.number}
                href={`/explore?cave=${cave.number}&floor=1`}
                className={`
                  group relative p-4 rounded-lg border-2 transition-all
                  ${traditionColors[cave.tradition as keyof typeof traditionColors]}
                `}
              >
                <div className="text-center">
                  <div className="text-lg font-bold mb-1 leading-tight">{cave.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{cave.tradition}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{cave.description}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-8 space-y-3">
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600/50 rounded"></div>
                <span>Buddhist (1-12)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-600/50 rounded"></div>
                <span>Hindu (13-29 + satellites)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600/50 rounded"></div>
                <span>Jain (30-34)</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500">
              Total: 34 main caves plus satellite shrines and nearby Ganeshleni & Jogeshwari cave groups
            </p>
          </div>
        </section>

        {/* Technical Info */}
        <section className="mt-16 pt-8 border-t border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-white">Technical Information</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p><strong>Website and photography:</strong> Arno Klein</p>
            <p><strong>Website:</strong> Next.js, React, TypeScript, Tailwind CSS</p>
            <p><strong>Backend:</strong> FastAPI, PostgreSQL</p>
            <p><strong>Features:</strong> Interactive floor plans, advanced search with fuzzy matching, boolean operators, cave/floor filters</p>
          </div>
        </section>
      </main>
    </div>
  );
}

