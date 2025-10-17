import EventRoom from "@/components/event-room";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface EventPageProps {
  params: {
    eventId: string;
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const supabase = await createClient();
  var { eventId } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  let { data: objects, error } = await supabase
    .from("objects")
    .select("name, id, height, width, position_x, position_y")
    .eq("event_id", eventId);
  return (
    <>
      <EventRoom
        user={user}
        eventId={eventId}
        initialObjects={(objects ?? []).map((obj) => ({
          ...obj,
          id: String(obj.id),
        }))}
      />
    </>
  );
}
