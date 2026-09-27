import { notFound } from "next/navigation";
import { getEventById } from "@/actions/events";
import { EventFormClient } from "../../EventFormClient";

export const dynamic = "force-dynamic";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const result = await getEventById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <EventFormClient isEditing={true} initialData={result.data} />;
}
