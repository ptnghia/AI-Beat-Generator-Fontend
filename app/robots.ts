import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://aibeat.com'; // Replace with actual domain

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/checkout/success/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
