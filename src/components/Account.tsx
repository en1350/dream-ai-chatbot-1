import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { FREE_DREAMS, PRICE, useDreamWallet } from '@/hooks/use-dream-wallet';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

const Account = () => {
  const { used, left, hasAccess, history, activatedAt, buyAccess, reset } = useDreamWallet();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nightMode, setNightMode] = useState(true);
  const [reminders, setReminders] = useState(false);

  useEffect(() => {
    setName(window.localStorage.getItem('morpheus-name') ?? '');
    setEmail(window.localStorage.getItem('morpheus-email') ?? '');
  }, []);

  const save = () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setEmailError('Похоже, в адресе опечатка');
      return;
    }
    setEmailError('');
    window.localStorage.setItem('morpheus-name', name);
    window.localStorage.setItem('morpheus-email', email);
    toast({ title: 'Настройки сохранены', description: 'Морфей запомнил вас.' });
  };

  const progress = hasAccess ? 100 : (used / FREE_DREAMS) * 100;

  return (
    <section id="account" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Ваш уголок</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
            Личный <span className="gold-text italic font-semibold">кабинет</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Статус доступа, счётчик снов и настройки — всё в одном месте.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-border bg-card/70 p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/35 bg-primary/10">
                  <Icon name="UserRound" size={24} className="text-primary" />
                </span>
                <div className="leading-tight">
                  <p className="font-display text-2xl">{name || 'Сновидец'}</p>
                  <p className="text-xs text-muted-foreground">
                    {email || 'почта не указана'}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-[11px] ${
                  hasAccess
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-secondary/50 text-muted-foreground'
                }`}
              >
                {hasAccess ? 'Пожизненный доступ' : 'Пробный режим'}
              </span>
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-background/50 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Wallet" size={15} className="text-primary" />
                  Кошелёк снов
                </span>
                <span className="font-medium">
                  {hasAccess ? 'без ограничений' : `${left} из ${FREE_DREAMS}`}
                </span>
              </div>
              <Progress value={progress} className="mt-3 h-1.5" />
              <p className="mt-3 text-xs text-muted-foreground">
                {hasAccess
                  ? 'Счётчик отключён — толкуйте столько снов, сколько приснится.'
                  : `Использовано бесплатных толкований: ${used}. Дальше — ${PRICE} ₽ навсегда.`}
              </p>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/40 p-4">
                <dt className="text-xs text-muted-foreground">Тариф</dt>
                <dd className="mt-1.5 font-display text-xl">
                  {hasAccess ? `${PRICE} ₽ навсегда` : 'Бесплатный'}
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-background/40 p-4">
                <dt className="text-xs text-muted-foreground">Дата окончания подписки</dt>
                <dd className="mt-1.5 flex items-center gap-2 font-display text-xl">
                  {hasAccess ? (
                    <>
                      <Icon name="Infinity" size={18} className="text-primary" />
                      бессрочно
                    </>
                  ) : (
                    'нет активной подписки'
                  )}
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-background/40 p-4">
                <dt className="text-xs text-muted-foreground">Доступ открыт</dt>
                <dd className="mt-1.5 font-display text-xl">
                  {activatedAt ? fmtDate(activatedAt) : '—'}
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-background/40 p-4">
                <dt className="text-xs text-muted-foreground">Снов в архиве</dt>
                <dd className="mt-1.5 font-display text-xl">{history.length}</dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              {!hasAccess && (
                <Button className="rounded-full" onClick={buyAccess}>
                  <Icon name="Sparkles" size={16} className="mr-2" />
                  Открыть за {PRICE} ₽
                </Button>
              )}
              <Button
                variant="outline"
                className="rounded-full border-border bg-transparent"
                onClick={() => {
                  reset();
                  toast({ title: 'Кабинет очищен', description: 'Счётчик и архив сброшены.' });
                }}
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Сбросить данные
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/70 p-8">
            <p className="font-display text-2xl">Настройки</p>
            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="acc-name">Как к вам обращаться</Label>
                <Input
                  id="acc-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Имя"
                  className="border-border bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acc-email">Почта для толкований</Label>
                <Input
                  id="acc-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@dream.ru"
                  className="border-border bg-background/60"
                />
                {emailError && <p className="text-xs text-destructive">{emailError}</p>}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border bg-background/40 px-4 py-3.5">
                <div className="leading-tight">
                  <p className="text-sm">Ночной режим</p>
                  <p className="text-xs text-muted-foreground">Приглушённые звёзды после 23:00</p>
                </div>
                <Switch checked={nightMode} onCheckedChange={setNightMode} />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border bg-background/40 px-4 py-3.5">
                <div className="leading-tight">
                  <p className="text-sm">Утренние напоминания</p>
                  <p className="text-xs text-muted-foreground">Записать сон, пока он не растаял</p>
                </div>
                <Switch checked={reminders} onCheckedChange={setReminders} />
              </div>

              <Button onClick={save} className="w-full rounded-full">
                Сохранить настройки
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Account;
