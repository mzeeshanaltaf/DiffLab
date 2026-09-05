import { Hero } from "@/components/landing/hero";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { UseCaseTabs } from "@/components/landing/use-case-tabs";
import { FileTypeGrid } from "@/components/landing/file-type-grid";
import { Faq, FAQS } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { SITE_URL } from "@/lib/seo";

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DiffLab",
    url: SITE_URL,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (web browser)",
    description:
      "Compare text, code, JSON, spreadsheets, images, and documents side by side. Fast, free, and private — nothing is uploaded unless you choose to share it.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Hero />
      <FeatureGrid />
      <UseCaseTabs />
      <FileTypeGrid />
      <Faq />
      <FinalCta />
    </>
  );
}
