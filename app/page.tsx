import { IntroSection } from "@/components/intro-section";
import { PublicationIndex } from "@/components/publication-index";
import { PublishPanel } from "@/components/publish-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <IntroSection />
        <PublicationIndex />
        <PublishPanel />
      </main>
      <SiteFooter />
    </>
  );
}
