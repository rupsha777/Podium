import { notFound } from "next/navigation";
import { getPublicGallery } from "@/actions/submissions";
import { GalleryClient } from "./GalleryClient";

export const dynamic = "force-dynamic";

interface GalleryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { slug } = await params;
  const result = await getPublicGallery(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <GalleryClient
      event={result.data.event}
      submissions={result.data.submissions}
    />
  );
}
