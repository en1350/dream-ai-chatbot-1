import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  getMonthGrid,
  getMoonInfo,
  isSameDay,
  MONTH_NAMES,
  MoonInfo,
  WEEKDAYS,
} from '@/lib/moon';

const MoonCalendar = () => {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<MoonInfo>(() => getMoonInfo(today));

  const grid = useMemo(
    () => getMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  const shift = (delta: number) =>
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  return (
    <section id="moon" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 h-72 bg-primary/10 blur-[140px]" />
      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Лунный календарь</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
            Сны по <span className="gold-text italic font-semibold">фазам луны</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Луна задаёт характер сна: в новолуние снятся замыслы, в полнолуние — самые яркие и
            вещие сюжеты. Выберите день, чтобы узнать, как читать сон этой ночи.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-border bg-card/70 p-6 md:p-8">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => shift(-1)}
                aria-label="Предыдущий месяц"
              >
                <Icon name="ChevronLeft" size={19} />
              </Button>
              <p className="font-display text-2xl capitalize">
                {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => shift(1)}
                aria-label="Следующий месяц"
              >
                <Icon name="ChevronRight" size={19} />
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-1.5 text-center text-[11px] uppercase tracking-widest text-muted-foreground">
              {WEEKDAYS.map((d) => (
                <span key={d} className="py-1">
                  {d}
                </span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1.5">
              {grid.map((cell, i) => {
                if (!cell) return <span key={`empty-${i}`} />;
                const isToday = isSameDay(cell.date, today);
                const isSelected = isSameDay(cell.date, selected.date);
                return (
                  <button
                    key={cell.date.toISOString()}
                    onClick={() => setSelected(cell)}
                    className={`group flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-primary/60 bg-primary/15'
                        : isToday
                          ? 'border-primary/35 bg-primary/5'
                          : 'border-border/50 bg-background/30 hover:border-primary/40'
                    }`}
                  >
                    <span className="text-sm leading-none">{cell.date.getDate()}</span>
                    <Icon
                      name={cell.phaseIcon}
                      size={12}
                      className={isSelected ? 'text-primary' : 'text-muted-foreground/70'}
                    />
                    <span className="text-[9px] leading-none text-muted-foreground">
                      {cell.lunarDay} л.д.
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              л.д. — лунный день · подсвечен сегодняшний
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-card/80 p-8 shadow-2xl">
            <div className="starfield pointer-events-none absolute inset-0 opacity-30" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10">
                  <Icon name={selected.phaseIcon} size={30} className="text-primary" />
                </span>
                <div className="leading-tight">
                  <p className="font-display text-2xl">{selected.phaseName}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.date.getDate()} {MONTH_NAMES[selected.date.getMonth()]} ·{' '}
                    {selected.lunarDay} лунный день
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-background/50 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Освещённость диска</span>
                  <span className="text-primary">{selected.illumination}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${selected.illumination}%` }}
                  />
                </div>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-foreground/90">
                {selected.dreamMeaning}
              </p>

              <div className="mt-5 rounded-2xl border border-border bg-background/50 p-5">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary">
                  <Icon name="Compass" size={14} />
                  Что делать со сном
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-foreground/90">
                  {selected.advice}
                </p>
              </div>

              <Button
                className="mt-6 w-full rounded-full"
                onClick={() => document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Icon name="MoonStar" size={16} className="mr-2" />
                Истолковать сон этой ночи
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoonCalendar;
