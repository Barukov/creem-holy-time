import crypto from "crypto";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY!);

const PRODUCT_LINKS: Record<string, string> = {
  starter: "https://drive.google.com/drive/folders/1gJW0fFRcY1O1JlnePnqUp2gTm8XUU9kh?usp=sharing",
  advanced: "https://drive.google.com/file/d/102z289XsEfuHbrOvPazAhWjE1VE4HgfK/view?usp=sharing",
  premium: "https://drive.google.com/drive/folders/1RqTD_vuq2LvYWH-vpQBAk2d73X6-W4ny?usp=sharing",
  product159: "https://drive.google.com/drive/folders/1elClIcBLP3FE5gtuHUFwBBWBoFfN5o6l?usp=sharing",
  product161: "https://drive.google.com/drive/folders/1baNo2BVX6oY5mYoqahy0hmbXu1wkzGbK?usp=sharing",
  product199: "https://drive.google.com/file/d/1ZHHXBAZ3Gu8oHkp2B215MkUl5IXtEqft/view?usp=sharing",
  product245: "https://drive.google.com/drive/folders/1RqTD_vuq2LvYWH-vpQBAk2d73X6-W4ny?usp=sharing",
  product255: "https://drive.google.com/file/d/1ZHHXBAZ3Gu8oHkp2B215MkUl5IXtEqft/view?usp=sharing",
};

const PRODUCT_NAMES: Record<string, string> = {
  starter: "Starter Pack",
  advanced: "Advanced Learning Pack",
  premium: "Premium Bundle",
  product159: "Essential Pack",
  product161: "Professional Pack",
  product199: "Elite Pack",
  product245: "Ultimate Learning Pack",
  product255: "Master Resource Pack",
};

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

const processedEvents = new Set<string>();

type JsonRecord = Record<string, any>;

function verifyCreemSignature(rawBody: string, signature: string, secret: string) {
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const digestBuffer = Buffer.from(digest, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  return (
    digestBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(digestBuffer, signatureBuffer)
  );
}

function slugFromCreemProductId(creemProductId?: string) {
  if (!creemProductId) return undefined;

  return Object.entries(CREEM_PRODUCT_IDS).find(([, id]) => id === creemProductId)?.[0];
}

function centsToAmount(value: unknown) {
  return typeof value === "number" ? (value / 100).toFixed(2) : "?";
}

async function sendTelegram(text: string, sourceDomain: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.log("NO TELEGRAM_BOT_TOKEN");
    return;
  }

  const chatId = sourceDomain.includes("creem-holy-time.business")
    ? "-1003983054033"
    : "-1003808961913";

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  const tgText = await res.text();
  console.log("TG RESPONSE:", tgText);
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("creem-signature") || "";
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.log("NO CREEM_WEBHOOK_SECRET");
      return new Response("OK", { status: 200 });
    }

    if (!signature) {
      console.log("NO CREEM SIGNATURE");
      return new Response("OK", { status: 200 });
    }

    if (!verifyCreemSignature(rawBody, signature, webhookSecret)) {
      console.log("INVALID CREEM SIGNATURE");
      return new Response("OK", { status: 200 });
    }

    const event = JSON.parse(rawBody) as JsonRecord;
    const eventType = event.eventType || event.type;
    const object = (event.object || event.data || {}) as JsonRecord;

    console.log("CREEM EVENT:", eventType);

    const eventId = event.id || event.event_id || `${eventType}_${object.id}`;

    if (processedEvents.has(eventId)) {
      console.log("DUPLICATE EVENT:", eventId);
      return new Response("OK", { status: 200 });
    }

    processedEvents.add(eventId);

    const checkout = (object.checkout || object) as JsonRecord;
    const order = (object.order || {}) as JsonRecord;
    const customer = (object.customer || checkout.customer || {}) as JsonRecord;
    const metadata = (checkout.metadata || object.metadata || {}) as JsonRecord;
    const creemProductId =
      checkout.product ||
      order.product ||
      object.product?.id ||
      object.product_id;

    const productId =
      metadata.productId ||
      metadata.product_id ||
      slugFromCreemProductId(creemProductId) ||
      "advanced";

    const sourceDomain =
      metadata.sourceDomain ||
      req.headers.get("host") ||
      "creem-holy-time.space";

    const email =
      customer.email ||
      metadata.email ||
      object.customer_email ||
      "unknown";

    const productName =
      PRODUCT_NAMES[productId] ||
      object.product?.name ||
      metadata.productName ||
      "Advanced Learning Pack";

    const amount = centsToAmount(order.amount_paid || order.amount || object.amount);
    const currency = order.currency || object.currency || object.product?.currency || "EUR";
    const country = customer.country || object.tax_country || "unknown";
    const paymentId = order.transaction || object.id || "unknown";
    const date = new Date().toLocaleString("en-GB");

    if (eventType === "refund.created" || eventType === "dispute.created") {
      await sendTelegram(`⚠️ <b>CREEM ${String(eventType).toUpperCase()}</b>

🌐 <b>Website:</b> ${sourceDomain}

👤 <b>Email:</b> ${email}
📦 <b>Product:</b> ${productName}
💰 <b>Amount:</b> ${amount} ${currency}
🌍 <b>Country:</b> ${country}
🧾 <b>ID:</b> ${paymentId}
🕒 <b>Date:</b> ${date}`, sourceDomain);

      return new Response("OK", { status: 200 });
    }

    if (eventType !== "checkout.completed") {
      return new Response("OK", { status: 200 });
    }

    await sendTelegram(`💸 <b>CREEM CHECKOUT COMPLETED</b>

🌐 <b>Website:</b> ${sourceDomain}

👤 <b>Email:</b> ${email}
📦 <b>Product:</b> ${productName}
💰 <b>Amount:</b> ${amount} ${currency}
🌍 <b>Country:</b> ${country}
🧾 <b>ID:</b> ${paymentId}
🕒 <b>Date:</b> ${date}`, sourceDomain);

    const downloadLink = PRODUCT_LINKS[productId];

    if (downloadLink && email !== "unknown") {
      await resend.emails.send({
        from: "Creem Holy Time <support@creem-holy-time.auction>",
        to: email,
        subject: `Your product: ${productName}`,
        html: `
          <h2>Thank you for your purchase</h2>
          <p>Your product is ready:</p>
          <p><strong>${productName}</strong></p>
          <p>
            <a href="${downloadLink}"
            style="display:inline-block;padding:12px 20px;background:#6541df;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
            Download your product
            </a>
          </p>
        `,
      });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Creem webhook error:", err);
    return new Response("OK", { status: 200 });
  }
}
