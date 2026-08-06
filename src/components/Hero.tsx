import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { FREE_DREAMS, PRICE, useDreamWallet } from '@/hooks/use-dream-wallet';

const PORTAL =
  'https://cdn.poehali.dev/projects/27ac383e-de3c-4d04-bda2-5818fbd8c423/files/45036a01-7855-4c22-ac40-944bf04712df.jpg';

const go = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const Hero = () => {
  const { left, hasAccess } = useDreamWallet();

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="starfield animate-drift pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />

      <div className="container relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-[11px] uppercase tracking-[0.24em] text-primary">
            <Icon name="Sparkles" size={13} />
            искусственный интеллект снов
          </span>

          <h1 className="mt-7 font-display text-[3.2rem] font-light leading-[0.95] tracking-tight md:text-7xl">
            Расскажите сон —<br />
            <span className="gold-text font-semibold italic">СонникАИ объяснит</span>
            <br />
            что он значит
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Чат-бот разбирает ночной сюжет на архетипы, читает интонацию и возвращает толкование
            обычными словами — без гаданий и суеверий. Первые {FREE_DREAMS} сна бесплатно,
            дальше — {PRICE} ₽ на весь период.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              onClick={() => go('chat')}
              className="animate-glow h-12 rounded-full px-8 text-base font-medium"
            >
              <Icon name="MoonStar" size={18} className="mr-2" />
              Толковать сон
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => go('oracle')}
              className="h-12 rounded-full border-border bg-transparent px-7 text-base"
            >
              <Icon name="Sparkles" size={17} className="mr-2 text-primary" />
              Предсказание дня
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Icon name="Coins" size={16} className="text-primary" />
              {hasAccess ? 'Безлимитный доступ активен' : `Осталось бесплатно: ${left}`}
            </span>
            <span className="flex items-center gap-2">
              <Icon name="ShieldCheck" size={16} className="text-primary" />
              Сны хранятся только у вас
            </span>
            <span className="flex items-center gap-2">
              <Icon name="Clock" size={16} className="text-primary" />
              Ответ за 4 секунды
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="animate-float relative">
            <div className="absolute -inset-6 rounded-full bg-primary/15 blur-3xl" />
            <img
              src={PORTAL}
              alt="Мистический портал снов"
              className="relative w-full rounded-[2rem] border border-primary/25 shadow-2xl"
              loading="lazy"
            />
          </div>
          <div className="glass absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3 md:-left-10">
            <Icon name="BrainCircuit" size={20} className="text-accent" />
            <div className="leading-tight">
              <p className="text-sm font-medium">12 архетипов</p>
              <p className="text-xs text-muted-foreground">в базе толкований</p>
            </div>
          </div>
          <div className="glass absolute -top-4 -right-2 rounded-2xl border border-border/70 px-4 py-3 md:-right-8">
            <p className="font-hand text-xl text-primary">«я снова летел»</p>
            <p className="text-xs text-muted-foreground">разобрано за 4 сек</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;