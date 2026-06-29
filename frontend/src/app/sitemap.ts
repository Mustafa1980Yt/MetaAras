import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://metaaras.io';
  const now = new Date();

  const marketingPages = [
    { path: '',            priority: 1.0, changeFreq: 'weekly' as const },
    { path: '/tokenomics', priority: 0.9, changeFreq: 'monthly' as const },
    { path: '/roadmap',    priority: 0.9, changeFreq: 'monthly' as const },
    { path: '/whitepaper', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/litepaper',  priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/docs',       priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/faq',        priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/privacy',    priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/terms',      priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/risk',       priority: 0.4, changeFreq: 'yearly' as const },
  ];

  return marketingPages.map(({ path, priority, changeFreq }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: changeFreq,
    priority,
  }));
}
