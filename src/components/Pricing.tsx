import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { FREE_DREAMS, PRICE, useDreamWallet } from '@/hooks/use-dream-wallet';

const FREE_FEATURES = [
  'Три толкования снов',
  'Доступ к словарю символов',
  'История разборов на устройстве',
];

const FULL_FEATURES = [
  'Безлимитные толкования снов',
  'Глубокий разбор с архетипами и настроением',
  'Личный архив без ограничений',
  'Все будущие обновления сонника',
  'Никаких подписок и списаний',
];

const Pricing = () => {
  const { left, hasAccess, buyAccess } = useDreamWallet();

  const handleBuy = () => {
    buyAccess();
    toast({
      title: 'Доступ открыт навсегда',
      description: 'Толкований больше не считаем — рассказывайте столько снов, сколько приснится.',
    });
    document.getElementById('account')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Кошелёк снов</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
            Три сна бесплатно,{' '}
            <span className="gold-text italic font-semibold">дальше {PRICE} ₽ навсегда</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Один платёж — и счётчик исчезает. Ни подписки, ни автопродления, ни срока окончания.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/50 p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Знакомство</p>
            <p className="mt-4 font-display text-5xl font-light">0 ₽</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {FREE_DREAMS} сна на пробу. Осталось: {hasAccess ? '—' : left}
            </p>
            <ul className="mt-7 space-y-3 text-sm">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-muted-foreground">
                  <Icon name="Check" size={16} className="mt-0.5 shrink-0 text-primary/70" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="mt-8 w-full rounded-full border-border bg-transparent"
              onClick={() => document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Рассказать сон
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-primary/45 bg-card/80 p-8 shadow-2xl">
            <div className="starfield pointer-events-none absolute inset-0 opacity-40" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
                <Icon name="Crown" size={12} />
                рекомендуем
              </span>
              <p className="mt-5 font-display text-6xl font-light gold-text">{PRICE} ₽</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Единоразово. Пожизненный доступ на весь период.
              </p>
              <ul className="mt-7 space-y-3 text-sm">
                {FULL_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Icon name="Sparkle" size={16} className="mt-0.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              {hasAccess ? (
                <div className="mt-8 flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 py-3 text-sm text-primary">
                  <Icon name="BadgeCheck" size={17} />
                  Доступ уже активен
                </div>
              ) : (
                <Button onClick={handleBuy} className="mt-8 h-12 w-full rounded-full text-base">
                  <Icon name="Wallet" size={17} className="mr-2" />
                  Открыть навсегда
                </Button>
              )}
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Оплата картой или СБП · возврат в течение 14 дней
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
