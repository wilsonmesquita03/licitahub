import { Calendar } from "@/components/calendar-grid";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { cache } from "react";

const getCalendar = cache(async () => {
  const rows = await prisma.tender.findMany({
    select: { publicationDatePncp: true },
  });

  type YearMonthCounts = Record<number, Record<number, number>>;

  const counts: YearMonthCounts = {};

  // 2. Conta por ano/mês (mês zero‑based: 0 = jan, 11 = dez)
  for (const { publicationDatePncp } of rows) {
    if (!publicationDatePncp) continue; // segurança
    const d = new Date(publicationDatePncp);
    const year = d.getUTCFullYear(); // ou getFullYear(), se quiser fuso local
    const month = d.getUTCMonth(); // 0‑11

    counts[year] ??= {};
    counts[year][month] ??= 0;
    counts[year][month] += 1;
  }

  return counts;
});

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

  const availableDates = await getCalendar();

  return (
    <main className="px-8 pt-14">
      <Calendar events={events} availableDates={availableDates} />
    </main>
  );
}
