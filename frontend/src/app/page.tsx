import { redirect } from 'next/navigation';

// Static page that redirects to explore
export const dynamic = 'force-static';

export default function HomePage() {
  redirect('/explore?cave=10&floor=1');
}
