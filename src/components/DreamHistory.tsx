import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { formatText } from '@/lib/format-text';
import { DreamRecord, useDreamWallet } from '@/hooks/use-dream-wallet';

const MOOD_COLOR: Record<string, string> = {
  тревожный: 'text-destructive border-destructive/40 bg-destructive/10',
  светлый: 'text-primary border-primary/40 bg-primary/10',
  печальный: 'text-accent border-accent/40 bg-accent/10',
  загадочный: 'text-accent border-accent/40 bg-accent/10',
  нейтральный: 'text-muted-foreground border-border bg-secondary/50',
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

const DreamHistory = () => {
  const { history, reset } = useDreamWallet();
  const [active, setActive] = useState<DreamRecord | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const clearHistory = () => {
    reset();
    setConfirmOpen(false);
    toast({
      title: 'История очищена',
      description: 'Все сохранённые толкования удалены с этого устройства.',
    });
  };

  return (
    <section id="history" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Архив ночей</p>
            <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
              История <span className="gold-text italic font-semibold">предсказаний</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Каждое толкование сохраняется на вашем устройстве. Со временем в архиве проступают
              повторяющиеся символы — это и есть личный язык вашего бессознательного.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-5 py-4">
              <Icon name="Library" size={22} className="text-primary" />
              <div className="leading-tight">
                <p className="font-display text-2xl">{history.length}</p>
                <p className="text-xs text-muted-foreground">снов в архиве</p>
              </div>
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                className="rounded-full border-border bg-transparent text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Icon name="Trash2" size={16} className="mr-2" />
                Очистить историю
              </Button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-card/40 px-8 py-16 text-center">
            <Icon name="MoonStar" size={34} className="mx-auto text-primary/70" />
            <p className="mt-5 font-display text-2xl">Архив пока пуст</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Расскажите СонникАИ первый сон — и он появится здесь вместе с разбором символов
              и настроения.
            </p>
            <Button
              variant="outline"
              className="mt-7 rounded-full border-primary/40 bg-primary/10"
              onClick={() =>
                document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Перейти в чат
            </Button>
          </div>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {history.map((dream) => (
              <button
                key={dream.id}
                onClick={() => setActive(dream)}
                className="group animate-fade-in rounded-2xl border border-border bg-card/60 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{fmt(dream.date)}</span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                      MOOD_COLOR[dream.mood] ?? MOOD_COLOR['нейтральный']
                    }`}
                  >
                    {dream.mood}
                  </span>
                </div>
                <p className="mt-4 line-clamp-3 font-display text-xl font-light leading-snug">
                  {dream.question}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {dream.symbols.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <span className="mt-5 flex items-center gap-1.5 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Открыть разбор
                  <Icon name="ArrowRight" size={13} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-light">
              {active?.question}
            </DialogTitle>
            <DialogDescription>{active && fmt(active.date)}</DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {active ? formatText(active.answer) : null}
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-light">
              Очистить историю снов?
            </DialogTitle>
            <DialogDescription>
              Будут удалены все {history.length} сохранённых толкований. Это действие нельзя
              отменить.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 rounded-full border-border bg-transparent"
              onClick={() => setConfirmOpen(false)}
            >
              Отмена
            </Button>
            <Button
              className="flex-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/85"
              onClick={clearHistory}
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Удалить всё
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default DreamHistory;