import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SYMBOLS } from '@/lib/oracle';

const CATEGORIES = ['Все', 'Стихии', 'Существа', 'Пространство', 'Состояния'] as const;

const SymbolDictionary = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Все');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SYMBOLS.filter((s) => {
      const byCat = category === 'Все' || s.category === category;
      const byQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.short.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.includes(q));
      return byCat && byQuery;
    });
  }, [query, category]);

  return (
    <section id="symbols" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-1/4 h-72 bg-accent/10 blur-[140px]" />
      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Сонник Морфея</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
            Словарь <span className="gold-text italic font-semibold">символов</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Двенадцать ключевых образов, на которых держится язык сновидений. Найдите свой —
            и поймёте, что именно ищет ваше бессознательное.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-5">
          <div className="relative w-full">
            <Icon
              name="Search"
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти символ: вода, полёт, дом…"
              className="h-12 rounded-full border-border bg-card/60 pl-11 text-sm"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                  category === c
                    ? 'border-primary/50 bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-14 text-center text-sm text-muted-foreground">
            Такого символа в словаре пока нет — опишите сон в чате, Морфей разберёт его вручную.
          </p>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="mx-auto mt-12 grid max-w-4xl gap-3 md:grid-cols-2"
          >
            {filtered.map((s) => (
              <AccordionItem
                key={s.key}
                value={s.key}
                className="rounded-2xl border border-border bg-card/60 px-5 transition-colors hover:border-primary/35"
              >
                <AccordionTrigger className="py-5 text-left hover:no-underline">
                  <span className="flex items-center gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                      <Icon name={s.icon} size={19} />
                    </span>
                    <span className="leading-tight">
                      <span className="block font-display text-xl">{s.title}</span>
                      <span className="block text-xs text-muted-foreground">{s.short}</span>
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {s.meaning}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  );
};

export default SymbolDictionary;
