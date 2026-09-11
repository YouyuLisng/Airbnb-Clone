import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                // Account/session pages have no SEO value and shouldn't be
                // indexed even though they aren't behind auth at the route
                // level (the pages themselves redirect unauthenticated
                // visitors).
                disallow: ['/profile', '/renting', '/lending', '/my-gear', '/favorites'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
