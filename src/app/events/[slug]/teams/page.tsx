import { notFound } from "next/navigation";
import { getEventBySlug } from "@/actions/events";
import { TeamHubClient } from "./TeamHubClient";

export const dynamic = "force-dynamic";

interface TeamPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventTeamsPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const result = await getEventBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return <TeamHubClient event={result.data} />;
}
