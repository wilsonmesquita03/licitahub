import { Calendar, CalendarEvent } from "@/components/calendar-grid";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const boletins = await prisma.sentBoletim.findMany({
    where: {
      userId: session?.user.id,
    },
  });

  const events = boletins.map(({ id, rangeStart, rangeEnd }) => ({
    rangeStart: new Date(rangeStart),
    rangeEnd: new Date(rangeEnd),
    href: `/boletim/${id}`,
  }));

  return (
    <main className="px-8 pt-14">
      <Calendar events={events} />
    </main>
  );
}
