import { NextRequest, NextResponse } from 'next/server';

function extractDriveId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // Pure ID
  if (/^[a-zA-Z0-9_-]{20,70}$/.test(trimmed)) {
    return trimmed;
  }

  // Google Drive /file/d/{id} or /d/{id}
  const matchD = trimmed.match(/(?:drive|docs)\.google\.com\/(?:[a-zA-Z0-9_\-\/]+)?\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) return matchD[1].split('/')[0].split('?')[0].split('&')[0];

  // Legacy googleusercontent /d/{id}
  const matchUserContent = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (matchUserContent && matchUserContent[1]) return matchUserContent[1].split('=')[0];

  // Query parameter id={id}
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return matchId[1];

  // Generic /d/{id} fallback
  const genericD = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,70})/);
  if (genericD && genericD[1]) return genericD[1];

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url')?.trim();
    const driveIdParam = searchParams.get('id')?.trim();

    const driveId = driveIdParam || (targetUrl ? extractDriveId(targetUrl) : null);

    const candidateUrls: string[] = [];

    if (driveId) {
      candidateUrls.push(
        // 1. Google Drive thumbnail endpoint with high resolution (most reliable on server-to-server fetch)
        `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`,
        // 2. Google Usercontent CDN with high resolution
        `https://lh3.googleusercontent.com/d/${driveId}=w1600`,
        // 3. Google Usercontent CDN default
        `https://lh3.googleusercontent.com/d/${driveId}`,
        // 4. uc direct view
        `https://drive.google.com/uc?export=view&id=${driveId}`,
        // 5. uc direct download
        `https://drive.google.com/uc?id=${driveId}&export=download`
      );
    } else if (targetUrl) {
      // Validate protocol
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        return NextResponse.json({ error: 'Protokol URL tidak valid' }, { status: 400 });
      }
      candidateUrls.push(targetUrl);
    } else {
      return NextResponse.json({ error: 'Parameter url atau id wajib diisi' }, { status: 400 });
    }

    const browserHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    };

    for (const url of candidateUrls) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: browserHeaders,
          redirect: 'follow',
          cache: 'force-cache',
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          // Ensure it is genuinely an image and not an HTML login/viewer/redirect page
          if (contentType.startsWith('image/')) {
            const buffer = await response.arrayBuffer();
            return new Response(buffer, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }
        }
      } catch {
        // Try next candidate url
      }
    }

    return NextResponse.json(
      { error: 'Gambar tidak dapat diakses dari sumber penyedia' },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal memproses proxy gambar' },
      { status: 500 }
    );
  }
}
