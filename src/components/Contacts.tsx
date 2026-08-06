import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const CHANNELS = [
  { icon: 'Mail', title: 'Почта', value: 'hello@sonnikai.ru', hint: 'ответим за 1 день' },
  { icon: 'Send', title: 'Телеграм', value: '@sonnikai', hint: 'быстрее всего' },
  { icon: 'MessageCircleQuestion', title: 'Поддержка', value: 'help@sonnikai.ru', hint: 'оплата и доступ' },
];

const Contacts = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Как к вам обращаться?';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = 'Проверьте адрес почты';
    if (form.message.trim().length < 10) next.message = 'Пара предложений — и мы всё поймём';
    setErrors(next);
    if (Object.keys(next).length) return;

    toast({
      title: 'Письмо отправлено',
      description: 'СонникАИ прочитает его до следующего рассвета.',
    });
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="contacts" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Обратная связь</p>
            <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
              Напишите <span className="gold-text italic font-semibold">нам</span>
            </h2>
            <p className="mt-5 text-muted-foreground">
              Нашли неточность в толковании, хотите добавить символ в сонник или спросить
              про доступ — пишите, мы читаем всё.
            </p>

            <div className="mt-9 space-y-3">
              {CHANNELS.map((c) => (
                <div
                  key={c.title}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card/50 px-5 py-4 transition-colors hover:border-primary/35"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Icon name={c.icon} size={19} />
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm">{c.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.title} · {c.hint}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={submit}
            className="rounded-3xl border border-border bg-card/70 p-8 shadow-xl"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="c-name">Имя</Label>
                <Input
                  id="c-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ваше имя"
                  className="border-border bg-background/60"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">Почта</Label>
                <Input
                  id="c-email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@dream.ru"
                  className="border-border bg-background/60"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <Label htmlFor="c-msg">Сообщение</Label>
              <Textarea
                id="c-msg"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="О чём хотите рассказать?"
                className="min-h-[150px] resize-none border-border bg-background/60"
              />
              {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
            </div>
            <Button type="submit" className="mt-6 h-12 w-full rounded-full text-base">
              <Icon name="Send" size={17} className="mr-2" />
              Отправить письмо
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Отправляя форму, вы соглашаетесь с обработкой персональных данных.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contacts;
