import GalleryExplorer from "@/components/gallery/GalleryExplorer";
import BeforeAfterSlider from "@/components/gallery/BeforeAfterSlider";
import SectionHeading from "@/components/ui/SectionHeading";
import { getProjects } from "@/lib/api";

export default async function GalleryPage() {
  const projects = await getProjects();
  const beforeAfterExample = projects.find((p: { before_image_url?: string }) => p.before_image_url);

  return (
    <main className="px-6 md:px-8 py-16">
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          eyebrow="Portfolio"
          title="Our Work"
          intro="Browse recent installations by category."
        />

        <GalleryExplorer projects={projects} />

        {beforeAfterExample && (
          <div className="mt-20">
            <SectionHeading eyebrow="Before and After" title="See the Difference" />
            <BeforeAfterSlider
              beforeSrc={beforeAfterExample.before_image_url!}
              afterSrc={beforeAfterExample.image_url}
            />
          </div>
        )}
      </div>
    </main>
  );
}
