import { Calendar } from "@/components/calendar-grid";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { cache } from "react";

const getCalendar = cache(async () => {
  const raw = await prisma.$queryRaw<
    { year: number; month: number; total: bigint }[]
  >`
  SELECT
  EXTRACT(YEAR  FROM "publicationDatePncp") AS year,
  EXTRACT(MONTH FROM "publicationDatePncp") - 1 AS month, -- deixa 0‑based
  COUNT(*)                                            AS total
  FROM "Tender"
  GROUP BY year, month
  ORDER BY year, month;
  `;

  type YearMonthCounts = Record<number, Record<number, number>>;
  // Transforma no mesmo shape { [ano]: { [mês]: total } }
  const counts: YearMonthCounts = {};
  for (const { year, month, total } of raw) {
    counts[year] ??= {};
    counts[year][month] = Number(total); // bigint → number
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
