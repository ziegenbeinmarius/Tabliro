import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage({}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  let { data: events, error } = await supabase
    .from("events")
    .select("name, id");

  return (
    <div className="w-full flex flex-col xl:grid xl:grid-cols-5 xl:grid-rows-10 gap-4 4xl:gap-10 ">
      {events?.map((event) => (
        <div key={event.name}>
          <Button variant="link" className="p-0">
            <Link href={`/events/${event.id}`}>{event.name}</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
