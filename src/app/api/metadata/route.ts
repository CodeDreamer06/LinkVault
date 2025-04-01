import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

// Define expected metadata structure
interface UrlMetadata {
    title?: string;
    description?: string;
    favicon?: string; 
}

// Force dynamic rendering to ensure it runs server-side on each request
// export const dynamic = 'force-dynamic'; // Uncomment if needed, Vercel might handle this

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const urlToFetch = searchParams.get('url');

    if (!urlToFetch) {
        return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    let validatedUrl: URL;
    try {
        // Prepend http:// if no protocol is present
        const urlWithProtocol = urlToFetch.startsWith('http://') || urlToFetch.startsWith('https://') 
            ? urlToFetch 
            : `http://${urlToFetch}`;
        validatedUrl = new URL(urlWithProtocol);
    } catch (error) {
        return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
    }

    try {
        console.log(`Fetching metadata for: ${validatedUrl.toString()}`);
        // Fetch the external URL
        const response = await fetch(validatedUrl.toString(), {
            headers: {
                // Try to mimic a browser user agent
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            redirect: 'follow', // Follow redirects
            signal: AbortSignal.timeout(5000) // Add a timeout (5 seconds)
        });

        if (!response.ok) {
            console.error(`Failed to fetch URL ${validatedUrl}: ${response.status} ${response.statusText}`);
            return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status });
        }

        const html = await response.text();
        const root = parse(html);

        const metadata: UrlMetadata = {};

        // Extract Title
        metadata.title = root.querySelector('title')?.text || root.querySelector('meta[property="og:title"]')?.getAttribute('content') || undefined;

        // Extract Description
        metadata.description = root.querySelector('meta[name="description"]')?.getAttribute('content') || root.querySelector('meta[property="og:description"]')?.getAttribute('content') || undefined;
        
        // Extract Favicon
        let faviconUrl = 
            root.querySelector('link[rel="icon"]')?.getAttribute('href') || 
            root.querySelector('link[rel="shortcut icon"]')?.getAttribute('href');

        if (faviconUrl) {
             // Resolve relative favicon URL to absolute
            try {
                metadata.favicon = new URL(faviconUrl, validatedUrl.origin).toString();
            } catch (e) {
                console.warn(`Could not resolve favicon URL ${faviconUrl} relative to ${validatedUrl.origin}`);
                // Keep potentially relative URL if absolute fails
                metadata.favicon = faviconUrl;
            }
        } else {
            // Default fallback if no icon link found
            try {
                 metadata.favicon = new URL('/favicon.ico', validatedUrl.origin).toString();
                 // You might want to check if this default actually exists before returning it
             } catch(e) {
                 // ignore if base URL is invalid
             }
        }

        console.log("Extracted metadata:", metadata);
        return NextResponse.json(metadata);

    } catch (error: any) {
        console.error(`Error fetching or parsing metadata for ${urlToFetch}:`, error);
        // Handle specific errors like timeouts
        if (error.name === 'TimeoutError') {
             return NextResponse.json({ error: 'Request timed out while fetching URL metadata' }, { status: 504 });
        }
        return NextResponse.json({ error: `Internal server error: ${error.message || 'Failed to process metadata'}` }, { status: 500 });
    }
} 