export async function onRequest(context) {
    const apiUrl = 'https://portfolio-api-production.jkapa0417.workers.dev/sitemap.xml';

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            return new Response('Error fetching sitemap', { status: response.status });
        }

        const text = await response.text();

        return new Response(text, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (err) {
        return new Response('Error proxying sitemap', { status: 500 });
    }
}
