import Link from "next/link";

const sections = [
  {
    title: "1. Overview",
    text: "These Terms of Service govern your access to and use of the Creem Holy Time website and digital products. By purchasing or using our products, you agree to these terms.",
  },
  {
    title: "2. Digital products",
    text: "Our products are digital learning resources such as guides, templates, worksheets, planners, checklists and related educational materials. No physical item is shipped.",
  },
  {
    title: "3. Account and checkout information",
    text: "You are responsible for entering a correct email address during checkout. We use this email address to deliver your digital product and provide order support.",
  },
  {
    title: "4. Payment processing",
    text: "Payments are processed by Creem or another approved payment provider. We do not collect or store full card numbers or sensitive payment credentials on our website.",
  },
  {
    title: "5. Delivery",
    text: "Digital products are delivered by email after successful payment confirmation. If you do not receive your product, contact support with your order email and payment details.",
  },
  {
    title: "6. Refunds",
    text: "Refund requests may be submitted within 14 days of purchase. Refunds are reviewed according to our Refund Policy and may be refused where there is evidence of abuse, resale, or excessive use after delivery.",
  },
  {
    title: "7. Personal use only",
    text: "Products are provided for personal use only. You may not resell, redistribute, upload, publicly share, copy for resale, or make the files available to third parties.",
  },
  {
    title: "8. Educational use",
    text: "Our materials are provided for general educational and informational purposes. They are not professional, financial, legal, tax, investment, medical, or business advice.",
  },
  {
    title: "9. Intellectual property",
    text: "All content, files, page designs, product names, text and materials are owned by Creem Holy Time or its licensors unless stated otherwise.",
  },
  {
    title: "10. Support",
    text: "For product access, delivery, refund, or account questions, contact us through the Contact page. We may ask for your checkout email or order details to locate your purchase.",
  },
  {
    title: "11. Changes to these terms",
    text: "We may update these terms when our products, checkout flow, policies, or legal requirements change. The latest version will remain available on this page.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-[#eee8ff] via-white to-[#e8eeff] text-[#090522]">
      <header className="bg-[#13083d] px-8 py-8 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-3xl font-black">
            CREEM HOLY TIME
          </Link>
          <Link href="/" className="rounded-full bg-[#6541df] px-7 py-3 font-bold">
            Back home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-8 py-24">
        <div className="rounded-[34px] bg-white p-10 shadow-2xl">
          <p className="font-black uppercase tracking-[0.25em] text-[#7657e8]">
            Legal
          </p>
          <h1 className="mt-4 text-6xl font-black">Terms of Service</h1>
          <p className="mt-6 text-lg leading-8 text-black/60">
            Last updated: June 10, 2026
          </p>

          <div className="mt-10 space-y-7 text-lg leading-8 text-black/65">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-black text-[#090522]">{section.title}</h2>
                <p className="mt-2">{section.text}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/privacy"
              className="inline-block rounded-2xl bg-[#f3f0ff] px-8 py-4 font-black text-[#090522]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/refund-policy"
              className="inline-block rounded-2xl bg-[#f3f0ff] px-8 py-4 font-black text-[#090522]"
            >
              Refund Policy
            </Link>
            <Link
              href="/contact"
              className="inline-block rounded-2xl bg-[#6541df] px-8 py-4 font-black text-white"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
