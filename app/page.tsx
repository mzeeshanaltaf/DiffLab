import { Hero } from "@/components/landing/hero";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { UseCaseTabs } from "@/components/landing/use-case-tabs";
import { FileTypeGrid } from "@/components/landing/file-type-grid";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <UseCaseTabs />
      <FileTypeGrid />
      <Faq />
      <FinalCta />
    </>
  );
}
