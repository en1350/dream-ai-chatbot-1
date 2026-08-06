import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { FREE_DREAMS, useDreamWallet } from '@/hooks/use-dream-wallet';

const NAV = [
  { id: 'oracle', label: 'Карта дня' },
  { id: 'moon', label: 'Луна' },
  { id: 'chat', label: 'Чат' },
  { id: 'history', label: 'История' },
  { id: 'symbols', label: 'Словарь' },
  { id: 'account', label: 'Кабинет' },
  { id: 'about', label: 'О проекте' },
  { id: 'contacts', label: 'Контакты' },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, left, hasAccess } = useDreamWallet();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass border-b border-border/60 py-2' : 'py-4'
      }`}
    >
      <div className="container flex items-center justify-between gap-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 text-left"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
            <Icon name="Moon" size={19} className="text-primary" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-2xl font-semibold tracking-wide gold-text">
              СонникАИ
            </span>
            <span className="block text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              толкователь снов
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className="relative text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => go(user ? 'pricing' : 'account')}
            className="hidden items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-sm text-foreground transition-colors hover:bg-primary/20 sm:flex"
          >
            <Icon name={user ? 'Wallet' : 'LogIn'} size={15} className="text-primary" />
            {!user ? (
              <span>Войти</span>
            ) : hasAccess ? (
              <span>Доступ открыт</span>
            ) : (
              <span>
                {left} из {FREE_DREAMS} снов
              </span>
            )}
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
          >
            <Icon name={open ? 'X' : 'Menu'} size={22} />
          </Button>
        </div>
      </div>

      {open && (
        <div className="animate-fade-in glass mt-2 border-y border-border/60 lg:hidden">
          <div className="container flex flex-col py-3">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className="flex items-center justify-between border-b border-border/40 py-3 text-left text-sm text-foreground/90 last:border-0"
              >
                {item.label}
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;