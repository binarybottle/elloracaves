export type NewsLinkItem = {
  label: string;
  date: string;
  href: string;
  title: string;
  print?: boolean;
};

export const NEWS_LINKS: NewsLinkItem[] = [
  {
    label: 'Mid-day',
    date: '(2026-04-05)',
    href: 'https://www.mid-day.com/sunday-mid-day/article/new-book-on-ellora-caves-by-deepanjana-klein-and-arno-klein-dives-into-its-temples-23624195',
    title: 'Sunday Mid-day — Harmony in history',
  },
  {
    label: 'The Tribune',
    date: '(2026-03-29)',
    href: 'https://www.tribuneindia.com/news/arts/imageine-the-allure-of-ellora/',
    title: 'Imageine: The allure of Ellora',
  },
  {
    label: 'Serenade Magazine',
    date: '(2026-03-20)',
    href: 'https://serenademagazine.art/belonging-to-ellora-a-conversation-with-deepanjana-and-arno-klein/',
    title: 'Belonging to Ellora: A conversation',
  },
  {
    label: 'Mint',
    date: '(2026-03-14)',
    href: 'https://www.livemint.com/mint-lounge/art-and-culture/new-book-ellora-cross-fertilization-of-styles-in-buddhist-hindu-jain-cave-temples-deepanjana-and-arno-klein-11773461220789.html',
    title: 'The many histories of Ellora art — Mint Lounge',
  },
  {
    label: 'Hindustan Times',
    date: '(2026-02-28)',
    href: 'https://www.hindustantimes.com/books/ht-picks-new-reads-101772215786492.html',
    title: 'HT Picks; New Reads',
  },
  {
    label: 'Mumbai Mirror',
    date: '(2026-02-09)',
    href: '/images/press/mumbai-mirror.jpg',
    title: 'Mumbai Mirror — archived print clipping (opens image)',
    print: true,
  },
];
