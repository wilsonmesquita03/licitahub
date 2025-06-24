"use client";
import {
  format,
  setHours,
  setMinutes,
  setSeconds,
  isAfter,
  subDays,
} from "date-fns";
import { CalendarEvent } from "./calendar-grid";
import { createBoletim } from "@/app/(dashboard)/boletim/actions";
import { Button } from "./ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CalendarCell({
  date,
  isCurrentMonth,
  events,
}: {
  date: Date;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
}) {
  const router = useRouter();
  const now = new Date();
  const bg = isCurrentMonth ? "bg-zinc-900" : "bg-zinc-800";
  const text = isCurrentMonth ? "text-white" : "text-muted-foreground";

  const boletimHorarios = [
    {
      label: "06:00",
      start: setHours(setMinutes(setSeconds(subDays(date, 1), 0), 0), 22),
      end: setHours(setMinutes(setSeconds(date, 0), 0), 6),
      visible: isAfter(now, setHours(setMinutes(setSeconds(date, 0), 0), 6)),
    },
    {
      label: "14:00",
      start: setHours(setMinutes(setSeconds(date, 0), 0), 6),
      end: setHours(setMinutes(setSeconds(date, 0), 0), 14),
      visible: isAfter(now, setHours(setMinutes(setSeconds(date, 0), 0), 14)),
    },
    {
      label: "22:00",
      start: setHours(setMinutes(setSeconds(date, 0), 0), 14),
      end: setHours(setMinutes(setSeconds(date, 0), 0), 22),
      visible: isAfter(now, setHours(setMinutes(setSeconds(date, 0), 0), 22)),
    },
  ];

  function hasBoletimForSlot(
    slotStart: Date,
    slotEnd: Date,
    events: CalendarEvent[]
  ) {
    return events.find(
      (event) =>
        event.rangeStart.getTime() === slotStart.getTime() &&
        event.rangeEnd.getTime() === slotEnd.getTime()
    );
  }

  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  return (
    <div
      className={`${bg} p-2 rounded-xl min-h-[150px] flex flex-col justify-between`}
    >
      <div>
        <div className={`text-sm font-semibold ${text}`}>
          {format(date, "d")}
        </div>

        {/* Só renderiza os botões se não for final de semana */}
        {!isWeekend && (
          <div className="space-y-1 mt-1">
            {boletimHorarios.map((slot, i) => {
              if (!slot.visible) return null;

              const event = hasBoletimForSlot(slot.start, slot.end, events);

              return event ? (
                <Button
                  key={i}
                  className="text-left w-full text-xs rounded-md p-1 transition-colors bg-gray-500 hover:bg-gray-600"
                  asChild
                >
                  <Link href={event.href}>
                    <strong>Boletim {slot.label}</strong>
                  </Link>
                </Button>
              ) : (
                <Button
                  key={i}
                  onClick={async () => {
                    const res = await createBoletim(slot.start, slot.end);
                    if (res?.message)
                      toast.error(res.message, {
                        action: {
                          label: "Definir agora",
                          onClick: () => router.push("/settings"),
                        },
                      });
                  }}
                  className="text-left w-full text-xs rounded-md p-1 transition-colors bg-green-600 hover:bg-green-700"
                >
                  <strong>Boletim {slot.label}</strong>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
