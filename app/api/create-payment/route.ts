import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CREEM_PRODUCT_IDS: Record<string, string | undefined> = {
  starter: process.env.CREEM_PRODUCT_STARTER,
  advanced: process.env.CREEM_PRODUCT_ADVANCED,
  premium: process.env.CREEM_PRODUCT_PREMIUM,
  product159: process.env.CREEM_PRODUCT_159,
  product161: process.env.CREEM_PRODUCT_161,
  product199: process.env.CREEM_PRODUCT_199,
  product245: process.env.CREEM_PRODUCT_245,
  product255: process.env.CREEM_PRODUCT_255,
};

function getSiteUrl(req: Request) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const host = req.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function POST(req: Request) {
  try {
    const { email, productId } = await req.json();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
    const productSlug = String(productId || "");

    if (!validEmail || !productSlug) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const creemProductId = CREEM_PRODUCT_IDS[productSlug];

    if (!creemProductId) {
      return NextResponse.json(
        { error: `Product not configured: CREEM_PRODUCT_${productSlug.toUpperCase()}` },
        { status: 400 }
      );
    }

    const apiKey = process.env.CREEM_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "CREEM_API_KEY is missing" }, { status: 500 });
    }

    const siteUrl = getSiteUrl(req);
    const sourceDomain = req.headers.get("host") || siteUrl;
    const apiBaseUrl =
      process.env.CREEM_API_BASE_URL ||
      (process.env.CREEM_TEST_MODE === "true"
        ? "https://test-api.creem.io"
        : "https://api.creem.io");

    const res = await fetch(`${apiBaseUrl}/v1/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        product_id: creemProductId,
        units: 1,
        customer: {
          email,
        },
        success_url: `${siteUrl}/success`,
        metadata: {
          productId: productSlug,
          email,
          sourceDomain,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Creem checkout error:", data);
      return NextResponse.json(
        { error: "Creem checkout failed", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl: data.checkout_url,
    });
  } catch (error) {
    console.error("Creem checkout error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
