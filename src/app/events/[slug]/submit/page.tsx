import { notFound } from "next/navigation";
import { getEventBySlug } from "@/actions/events";
import { SubmissionFormClient } from "./SubmissionFormClient";

export const dynamic = "force-dynamic";

interface SubmitPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const { slug } = await params;
  const result = await getEventBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return <SubmissionFormClient event={result.data} />;
}
