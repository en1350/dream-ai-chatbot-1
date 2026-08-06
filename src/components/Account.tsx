import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { ACCESS_YEARS, FREE_DREAMS, PRICE, useDreamWallet } from '@/hooks/use-dream-wallet';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

const AuthCard = () => {
  const { login, register, authLoading } = useDreamWallet();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError('Проверьте адрес почты');
      return;
    }
    if (password.length < 6) {
      setError('Пароль — минимум 6 символов');
      return;
    }
    const fn = mode === 'login' ? login : register;
    const result = await fn(email, password);
    if (result.error) {
      setError(result.error);
      return;
    }
    toast({
      title: mode === 'login' ? 'С возвращением' : 'Кабинет создан',
      description: `Морфей ждёт ваш сон. Бесплатных толкований: ${FREE_DREAMS}.`,
    });
  };

  return (
    <div className="mx-auto mt-12 max-w-md rounded-3xl border border-border bg-card/70 p-8 shadow-xl">
      <div className="mb-6 flex rounded-full border border-border bg-background/50 p-1">
        {(['register', 'login'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError('');
            }}
            className={`flex-1 rounded-full py-2 text-sm transition-colors ${
              mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            {m === 'register' ? 'Регистрация' : 'Вход'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="auth-email">Почта</Label>
          <Input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@dream.ru"
            className="border-border bg-background/60"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-pass">Пароль</Label>
          <Input
            id="auth-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="минимум 6 символов"
            className="border-border bg-background/60"
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" disabled={authLoading} className="h-12 w-full rounded-full text-base">
          <Icon
            name={authLoading ? 'Loader' : mode === 'register' ? 'UserPlus' : 'LogIn'}
            size={17}
            className={`mr-2 ${authLoading ? 'animate-spin' : ''}`}
          />
          {authLoading ? 'Минуту…' : mode === 'register' ? 'Создать кабинет' : 'Войти'}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4 text-center">
        <p className="text-sm">
          <span className="text-primary">{FREE_DREAMS} сна бесплатно</span> — без карты
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Дальше {PRICE} ₽ один раз на {ACCESS_YEARS} года
        </p>
      </div>
    </div>
  );
};

const Account = () => {
  const { user, used, left, hasAccess, accessUntil, history, logout, buyAccess, refresh, reset, payLoading } =
    useDreamWallet();
  const [name, setName] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setName(window.localStorage.getItem('morpheus-name') ?? '');
  }, []);

  const saveName = () => {
    window.localStorage.setItem('morpheus-name', name);
    toast({ title: 'Сохранено', description: 'Морфей запомнил, как к вам обращаться.' });
  };

  const check = async () => {
    setChecking(true);
    await refresh();
    setChecking(false);
    toast({ title: 'Статус обновлён', description: 'Проверили оплату в ЮКассе.' });
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
            {user
              ? 'Статус доступа, счётчик снов и настройки — всё в одном месте.'
              : 'Зарегистрируйтесь по почте, чтобы Морфей запомнил ваши сны и счётчик.'}
          </p>
        </div>

        {!user ? (
          <AuthCard />
        ) : (
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-border bg-card/70 p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/35 bg-primary/10">
                    <Icon name="UserRound" size={24} className="text-primary" />
                  </span>
                  <div className="leading-tight">
                    <p className="font-display text-2xl">{name || 'Сновидец'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] ${
                    hasAccess
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border bg-secondary/50 text-muted-foreground'
                  }`}
                >
                  {hasAccess ? 'Полный доступ' : 'Пробный режим'}
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
                    : `Использовано бесплатных толкований: ${used}. Дальше — ${PRICE} ₽ на ${ACCESS_YEARS} года.`}
                </p>
              </div>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background/40 p-4">
                  <dt className="text-xs text-muted-foreground">Тариф</dt>
                  <dd className="mt-1.5 font-display text-xl">
                    {hasAccess ? `${PRICE} ₽ / ${ACCESS_YEARS} года` : 'Бесплатный'}
                  </dd>
                </div>
                <div className="rounded-2xl border border-border bg-background/40 p-4">
                  <dt className="text-xs text-muted-foreground">Доступ действует до</dt>
                  <dd className="mt-1.5 font-display text-xl">
                    {accessUntil ? fmtDate(accessUntil) : 'нет активного доступа'}
                  </dd>
                </div>
                <div className="rounded-2xl border border-border bg-background/40 p-4">
                  <dt className="text-xs text-muted-foreground">Снов в архиве</dt>
                  <dd className="mt-1.5 font-display text-xl">{history.length}</dd>
                </div>
                <div className="rounded-2xl border border-border bg-background/40 p-4">
                  <dt className="text-xs text-muted-foreground">Толкований сделано</dt>
                  <dd className="mt-1.5 font-display text-xl">{used}</dd>
                </div>
              </dl>

              <div className="mt-7 flex flex-wrap gap-3">
                {!hasAccess && (
                  <Button className="rounded-full" onClick={buyAccess} disabled={payLoading}>
                    <Icon name="Sparkles" size={16} className="mr-2" />
                    Открыть за {PRICE} ₽
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="rounded-full border-border bg-transparent"
                  onClick={check}
                  disabled={checking}
                >
                  <Icon
                    name="RefreshCw"
                    size={16}
                    className={`mr-2 ${checking ? 'animate-spin' : ''}`}
                  />
                  Обновить статус
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-border bg-transparent"
                  onClick={logout}
                >
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти
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
                  <Label htmlFor="acc-email">Почта кабинета</Label>
                  <Input
                    id="acc-email"
                    value={user.email}
                    readOnly
                    className="border-border bg-background/40 text-muted-foreground"
                  />
                </div>

                <Button onClick={saveName} className="w-full rounded-full">
                  Сохранить
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-border bg-transparent"
                  onClick={() => {
                    reset();
                    toast({ title: 'Архив очищен', description: 'История снов удалена с устройства.' });
                  }}
                >
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Очистить архив снов
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Account;
