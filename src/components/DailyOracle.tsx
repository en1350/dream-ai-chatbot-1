import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { DeckId, DECKS, dayKey, drawDailyCard, OracleCard, todayLabel } from '@/lib/divination';
import { SUIT_NAMES } from '@/lib/tarot';

const STORAGE_KEY = 'sonnikai-oracle-day';

const suitLabel = (card: OracleCard) => {
  const suit = (card as { suit?: keyof typeof SUIT_NAMES }).suit;
  return suit ? SUIT_NAMES[suit] : 'старший аркан';
};

const DailyOracle = () => {
  const [deck, setDeck] = useState<DeckId>('lenormand');
  const [card, setCard] = useState<OracleCard | null>(null);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { day: string; deck: DeckId };
      if (saved.day !== dayKey()) return;
      setDeck(saved.deck);
      setCard(drawDailyCard(saved.deck));
    } catch {
      /* приватный режим */
    }
  }, []);

  const draw = (next: DeckId) => {
    setDeck(next);
    setFlipping(true);
    setCard(null);
    window.setTimeout(() => {
      setCard(drawDailyCard(next));
      setFlipping(false);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ day: dayKey(), deck: next }));
      } catch {
        /* приватный режим */
      }
    }, 700);
  };

  return (
    <section id="oracle" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Предсказание дня</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
            Карта на <span className="gold-text italic font-semibold">{todayLabel()}</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Выберите колоду — Ленорман говорит о делах и людях, Таро о смысле и внутреннем пути.
            Карта одна на весь день и меняется в полночь.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {(Object.keys(DECKS) as DeckId[]).map((id) => (
            <button
              key={id}
              onClick={() => draw(id)}
              className={`group rounded-3xl border p-6 text-left transition-all duration-300 hover:-translate-y-1 ${
                deck === id && card
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border bg-card/60 hover:border-primary/40'
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
                <Icon name={DECKS[id].icon} size={22} className="text-primary" />
              </span>
              <p className="mt-4 font-display text-2xl">{DECKS[id].title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{DECKS[id].subtitle}</p>
              <span className="mt-4 flex items-center gap-1.5 text-xs text-primary">
                Вытянуть карту
                <Icon name="ArrowRight" size={13} />
              </span>
            </button>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          {flipping && (
            <div className="flex items-center justify-center rounded-3xl border border-border bg-card/60 px-8 py-16">
              <div className="starfield h-40 w-28 animate-pulse rounded-2xl border border-primary/40 bg-secondary/70" />
            </div>
          )}

          {card && !flipping && (
            <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-primary/40 bg-card/80 p-8 shadow-2xl md:p-10">
              <div className="starfield pointer-events-none absolute inset-0 opacity-30" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative flex flex-col gap-8 md:flex-row md:items-start">
                <div className="relative flex h-52 w-36 shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-primary/40 bg-gradient-to-b from-secondary/80 to-background/80">
                  {'number' in card && (
                    <span className="absolute left-3 top-3 font-display text-sm text-primary/70">
                      {(card as { number: number }).number}
                    </span>
                  )}
                  <Icon name={card.icon} size={44} className="text-primary" />
                  <p className="px-3 text-center font-display text-lg leading-tight">{card.name}</p>
                  {'arcana' in card && (
                    <span className="absolute bottom-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {suitLabel(card)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
                    {DECKS[deck].title} · {card.keyword}
                  </span>
                  <p className="mt-5 font-display text-2xl font-light leading-snug md:text-3xl">
                    {card.message}
                  </p>
                  {'keywords' in card && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {(card as { keywords: string[] }).keywords.map((k) => (
                        <span
                          key={k}
                          className="rounded-full border border-border bg-background/50 px-3 py-1 text-xs text-muted-foreground"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 rounded-2xl border border-border bg-background/50 p-5">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary">
                      <Icon name="Compass" size={14} />
                      Совет дня
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed text-foreground/90">{card.advice}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-full border-border bg-transparent"
                    onClick={() =>
                      document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    <Icon name="MoonStar" size={16} className="mr-2" />
                    Рассказать сон СонникАИ
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!card && !flipping && (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 px-8 py-14 text-center">
              <Icon name="Sparkles" size={32} className="mx-auto text-primary/70" />
              <p className="mt-4 text-sm text-muted-foreground">
                Выберите колоду выше — и карта дня откроется.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DailyOracle;