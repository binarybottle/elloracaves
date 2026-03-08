'use client';

import CuratedImageCollectionPage from '@/components/image/CuratedImageCollectionPage';

export default function BookPage() {
  return (
    <CuratedImageCollectionPage
      title="Book Figures"
      showSearch={false}
      emptyMessage="No book-figure images found."
      includeImage={(image) => image.book_page != null && !!image.book_figure}
      intro={(
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-start not-prose">
            <img
              src="/images/book.jpg"
              alt="Ellora: Cross-fertilization of Style in Buddhist, Hindu and Jain Cave Temples"
              className="w-full md:w-64 lg:w-72 rounded-lg shadow-lg flex-shrink-0"
            />
            <div className="space-y-4">
              <h2 className="text-2xl text-white">&ldquo;Ellora: Cross-fertilization of Style in Buddhist, Hindu and Jain Cave Temples&rdquo;</h2>
              <p className="text-base leading-relaxed text-[#eae2c4]">
                Published by Mapin in Spring of 2026.
                The contributing authors investigate the temples by religion and myth, patronage and support,
                stylistic influence and exchange, chronology, and the process of carving and completion
                of these rock-cut temples. The book includes extensive photographic documentation, ground plans,
                and rarely seen 19th-century archival materials. <i className="text-gray-300">[Co-edited by Deepanjana Klein and Arno Klein,
                with contributing authors Nicolas Morrissey, Lisa N. Owen, Vidya Dehejia, and Pia Brancaccio,
                and foreword by Naman Ahuja. Contains 203 photographs and 23 illustrations.]</i>
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://bookshop.org/p/books/ellora-cross-fertilization-of-style-in-buddhist-hindu-and-jain-cave-temples-arno-klein/fbc708426bf6bf07?ean=9789385360800&next=t" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 rounded-md bg-white/10 border border-white/20 text-[#eae2c4] hover:bg-white/20 hover:border-white/40 transition-all text-sm">
                  Bookshop.org
                </a>
                <a href="https://www.amazon.com/Ellora-Cross-Fertilization-Style-Buddhist-Temples/dp/9385360809" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 rounded-md bg-white/10 border border-white/20 text-[#eae2c4] hover:bg-white/20 hover:border-white/40 transition-all text-sm">
                  Amazon
                </a>
                <a href="https://www.barnesandnoble.com/w/ellora-deepanjana-klein/1147556954?ean=9789385360800" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 rounded-md bg-white/10 border border-white/20 text-[#eae2c4] hover:bg-white/20 hover:border-white/40 transition-all text-sm">
                  Barnes &amp; Noble
                </a>
                <a href="https://www.google.com/books/edition/Ellora/n69p0QEACAAJ?hl=en" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 rounded-md bg-white/10 border border-white/20 text-[#eae2c4] hover:bg-white/20 hover:border-white/40 transition-all text-sm">
                  Google Books
                </a>
                <a href="https://www.goodreads.com/book/show/235991868-ellora" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 rounded-md bg-white/10 border border-white/20 text-[#eae2c4] hover:bg-white/20 hover:border-white/40 transition-all text-sm">
                  Goodreads
                </a>
                <a href="https://search.worldcat.org/title/1523196884" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 rounded-md bg-white/10 border border-white/20 text-[#eae2c4] hover:bg-white/20 hover:border-white/40 transition-all text-sm">
                  WorldCat
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      sortImages={(a, b) => {
        if ((a.book_page ?? Number.MAX_SAFE_INTEGER) !== (b.book_page ?? Number.MAX_SAFE_INTEGER)) {
          return (a.book_page ?? Number.MAX_SAFE_INTEGER) - (b.book_page ?? Number.MAX_SAFE_INTEGER);
        }
        if ((a.book_figure || '') !== (b.book_figure || '')) {
          return (a.book_figure || '').localeCompare((b.book_figure || ''), undefined, { numeric: true, sensitivity: 'base' });
        }
        return a.file_path.localeCompare(b.file_path);
      }}
      renderMeta={(image) => (
        <span>p. {image.book_page}, fig. {image.book_figure}</span>
      )}
    />
  );
}
