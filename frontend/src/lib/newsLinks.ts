export type NewsLinkItem = {
  label: string;
  date: string;
  href: string;
  title: string;
  print?: boolean;
  tag?: string;
};

export const NEWS_LINKS: NewsLinkItem[] = [
  {
    label: 'India Today',
    date: '(2026-07-13)',
    href: 'https://www.indiatoday.in/magazine/leisure/story/20260713-if-stones-could-sing-book-on-ellora-caves-ellora-cross-fertilization-of-style-in-buddhist-hindu-and-jain-cave-temples-by-deepanjana-klein-and-arno-klein-2939775-2026-07-03',
    title: 'If stones could sing | Book on Ellora Caves',
    tag: 'review',
  },
  {
    label: 'Splainer',
    date: '(2026-06-06)',
    href: 'https://splainer.in/sections/2026/A-World-Cup-of-Woes/art',
    title: 'Splainer — A World Cup of Woes',
    tag: 'excerpt',
  },
  {
    label: 'The Telegraph',
    date: '(2026-06-05)',
    href: 'https://epaper.telegraphindia.com/calcutta-edition/29/2026-06-05/page-11/article-2033333599.html',
    title: 'The Telegraph — Calcutta Edition, Page 11',
    tag: 'announcement',
  },
    {
    label: 'Mid-day',
    date: '(2026-04-05)',
    href: 'https://www.mid-day.com/sunday-mid-day/article/new-book-on-ellora-caves-by-deepanjana-klein-and-arno-klein-dives-into-its-temples-23624195',
    title: 'Sunday Mid-day — Harmony in history',
    tag: 'excerpt',
  },
  {
    label: 'TAKE On Art Magazine',
    date: '(March 2026)',
    href: '/news/TAKE_On_Art_Magazine_Hugo_Weihe_review_2026-03.pdf',
    title: 'TAKE On Art Magazine — Hugo Weihe review (March 2026)',
    tag: 'review',
  },
  {
    label: 'The Tribune',
    date: '(2026-03-29)',
    href: 'https://www.tribuneindia.com/news/arts/imageine-the-allure-of-ellora/',
    title: 'Imageine: The allure of Ellora',
    tag: 'review',
  },
  {
    label: 'Serenade Magazine',
    date: '(2026-03-20)',
    href: 'https://serenademagazine.art/belonging-to-ellora-a-conversation-with-deepanjana-and-arno-klein/',
    title: 'Belonging to Ellora: A conversation',
    tag: 'interview',
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
    tag: 'announcement',
  },
  {
    label: 'Mumbai Mirror',
    date: '(2026-02-09)',
    href: '/news/MumbaiMirror_2026-02-09/MumbaiMirror_2026-02-09.jpg',
    title: 'Mumbai Mirror (opens image)',
    tag: 'review',
  },
];
