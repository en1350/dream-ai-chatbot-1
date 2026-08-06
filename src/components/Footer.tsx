import Icon from '@/components/ui/icon';
import { PRICE } from '@/hooks/use-dream-wallet';

const LINKS = [
  { id: 'oracle', label: 'Карта дня' },
  { id: 'chat', label: 'Чат' },
  { id: 'history', label: 'История' },
  { id: 'symbols', label: 'Словарь' },
  { id: 'pricing', label: 'Тариф' },
  { id: 'account', label: 'Кабинет' },
  { id: 'about', label: 'О проекте' },
  { id: 'contacts', label: 'Контакты' },
];

const Footer = () => (
  <footer className="relative overflow-hidden border-t border-border/70 py-14">
    <div className="starfield pointer-events-none absolute inset-0 opacity-40" />
    <div className="container relative">
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
              <Icon name="Moon" size={18} className="text-primary" />
            </span>
            <span className="font-display text-2xl gold-text">Морфей</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Чат-бот для толкования снов с искусственным интеллектом. Три сна бесплатно,
            полный доступ — {PRICE} ₽ на 3 года.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-10 gap-y-2.5 text-sm sm:grid-cols-3">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() =>
                document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth' })
              }
              className="text-left text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Морфей. Сны остаются вашими.</p>
        <p className="font-hand text-base text-primary/80">спокойной ночи</p>
      </div>
    </div>
  </footer>
);

export default Footer;