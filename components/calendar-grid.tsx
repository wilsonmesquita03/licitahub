"use client";

import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isSameDay,
  addDays,
} from "date-fns";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarCell } from "./calendar-cell";
import { ptBR } from "date-fns/locale";

export type CalendarEvent = {
  rangeStart: Date;
  rangeEnd: Date;
  href: string;
};
export function Calendar({
  events,
  availableDates,
}: {
  events: CalendarEvent[];
  availableDates: Record<number, Record<number, number>>;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0, locale: ptBR });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0, locale: ptBR });

  const calendarDays = useMemo(() => {
    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  const handlePrev = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNext = () => setCurrentDate((prev) => addMonths(prev, 1));

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-4xl font-bold">Seus boletins</h1>
          <p className="text-muted-foreground text-lg">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handlePrev}
            disabled={
              availableDates[currentDate.getFullYear()][
                currentDate.getMonth()
              ] > 1000
            }
          >
            ← Anterior
          </Button>
          <Button variant="secondary" onClick={handleNext}>
            Próximo →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {[
          "Domingo",
          "Segunda-feira",
          "Terça-feira",
          "Quarta-feira",
          "Quinta-feira",
          "Sexta-feira",
          "Sábado",
        ].map((d) => (
          <div key={d} className="text-center font-bold">
            {d}
          </div>
        ))}
        {calendarDays.map((day, index) => {
          const dayEvents = events.filter((event) =>
            isSameDay(event.rangeEnd, day)
          );

          return (
            <CalendarCell
              key={index}
              date={day}
              isCurrentMonth={isSameMonth(day, currentDate)}
              events={dayEvents}
              hasBoletim={
                (availableDates[day.getFullYear()][day.getMonth()] || 0) > 1000
              }
            />
          );
        })}
      </div>
    </div>
  );
}
