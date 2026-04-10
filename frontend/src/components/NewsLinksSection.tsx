import { NEWS_LINKS } from '@/lib/newsLinks';

export function NewsLinksSection() {
  return (
    <div className="mt-6 pt-4 border-t border-white/10 not-prose">
      <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2.5">News</h3>
      <ul className="space-y-1.5 text-sm text-gray-500">
        {NEWS_LINKS.map((item) => (
          <li key={`${item.label}-${item.date}`}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#eae2c4] transition-colors"
              title={item.title}
            >
              {item.label}{' '}
              <span className="text-gray-600">{item.date}</span>
              {item.print && <span className="text-gray-600"> · print</span>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
