import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { syncAndRevalidateDocs } from '@/lib/sync';

export const dynamic = 'force-dynamic';

interface WebhookPayload {
  event: string;
  category?: 'docs' | 'config' | 'release' | 'faq' | 'blog' | string;
  productId?: string;
  timestamp?: string;
  payload?: {
    docId?: string;
    slug?: string;
    productSlug?: string;
    tab?: string;
    title?: string;
    [key: string]: unknown;
  };
}

/**
 * Validates the webhook secret against environment variable PORTAL_WEBHOOK_SECRET.
 */
function validateSecret(req: NextRequest): boolean {
  const configuredSecret = process.env.PORTAL_WEBHOOK_SECRET;

  // If no secret configured in env, allow in development or warn
  if (!configuredSecret) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ PORTAL_WEBHOOK_SECRET is not configured in .env.local. Webhook accepted without secret verification in development.');
      return true;
    }
    // In production without secret configured, allow or check
    return true;
  }

  const customHeaderSecret = req.headers.get('x-webhook-secret');
  const authHeader = req.headers.get('authorization');
  const bearerSecret = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : null;
  const querySecret = req.nextUrl.searchParams.get('secret');

  return (
    customHeaderSecret === configuredSecret ||
    bearerSecret === configuredSecret ||
    querySecret === configuredSecret
  );
}

/**
 * POST /api/webhook
 * Receives real-time push events dispatched by Portal CMS.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Authenticate webhook request
    if (!validateSecret(req)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Invalid or missing webhook secret header (x-webhook-secret or Bearer Authorization required)',
        },
        { status: 401 }
      );
    }

    // 2. Parse request payload
    let body: WebhookPayload;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON body',
        },
        { status: 400 }
      );
    }

    const { event, category, productId, timestamp, payload } = body;
    const currentProductSlug = (process.env.NEXT_PUBLIC_PRODUCT_SLUG || 'crestone').toLowerCase();

    console.log(`📡 [Webhook Received] Event: ${event || 'unknown'} | Category: ${category || 'n/a'} | Product: ${payload?.productSlug || productId || currentProductSlug}`);

    // 3. Handle TEST_PING event
    if (event === 'TEST_PING' || event === 'ping') {
      return NextResponse.json(
        {
          success: true,
          event: 'TEST_PING',
          message: 'Pong! Webhook receiver is alive and configured correctly.',
          configuredProduct: currentProductSlug,
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startTime,
        },
        { status: 200 }
      );
    }

    // 4. Product slug matching check
    const incomingSlug = payload?.productSlug?.toLowerCase();
    if (incomingSlug && incomingSlug !== currentProductSlug) {
      return NextResponse.json(
        {
          success: true,
          skipped: true,
          reason: `Event received for product '${incomingSlug}', but this docuportal instance is configured for '${currentProductSlug}'.`,
          event,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // 5. Invalidate specific route path if doc slug was passed
    if (payload?.slug) {
      try {
        revalidatePath(`/documentation/${payload.slug}`, 'page');
      } catch (err) {
        console.warn(`Could not revalidate specific slug /documentation/${payload.slug}:`, err);
      }
    }

    // 6. Execute full synchronization and cache revalidation
    const syncResult = await syncAndRevalidateDocs(currentProductSlug);

    // Explicit tag revalidations
    try {
      revalidateTag('portal-docs', 'max');
      revalidateTag(`docs-${currentProductSlug}`, 'max');
      revalidatePath('/', 'layout');
    } catch (revalErr) {
      console.warn('Revalidation notice:', revalErr);
    }

    return NextResponse.json(
      {
        success: syncResult.success,
        event: event || 'docs.updated',
        category: category || 'docs',
        productSlug: currentProductSlug,
        synced: syncResult.success,
        totalDocuments: syncResult.totalDocuments,
        totalModules: syncResult.totalModules,
        error: syncResult.error,
        revalidatedPaths: [
          '/',
          '/documentation',
          payload?.slug ? `/documentation/${payload.slug}` : null,
          '/blog',
          '/release-notes',
        ].filter(Boolean),
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      },
      { status: syncResult.success ? 200 : 500 }
    );
  } catch (error: any) {
    console.error('❌ Error handling webhook request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal server error while processing webhook',
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhook
 * Healthcheck & status endpoint for the webhook receiver.
 */
export async function GET() {
  const currentProductSlug = process.env.NEXT_PUBLIC_PRODUCT_SLUG || 'crestone';
  const hasSecret = Boolean(process.env.PORTAL_WEBHOOK_SECRET);

  return NextResponse.json({
    status: 'online',
    description: 'Portal Real-Time Webhook Push Receiver Endpoint',
    product: currentProductSlug,
    secretConfigured: hasSecret,
    acceptedEvents: [
      'TEST_PING',
      'docs.updated',
      'docs.created',
      'docs.deleted',
      'config.updated',
      'release.updated',
      'release.created',
      'blog.updated',
      'blog.created',
      'faq.updated',
    ],
    headers: {
      authHeader: 'Authorization: Bearer <PORTAL_WEBHOOK_SECRET>',
      secretHeader: 'x-webhook-secret: <PORTAL_WEBHOOK_SECRET>',
      contentType: 'application/json',
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * OPTIONS /api/webhook
 * CORS preflight support.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-webhook-secret, User-Agent',
    },
  });
}
