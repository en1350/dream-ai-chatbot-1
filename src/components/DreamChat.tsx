import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { FREE_DREAMS, useDreamWallet } from '@/hooks/use-dream-wallet';
import { interpretDream } from '@/lib/oracle';
import { getMoonInfo } from '@/lib/moon';
import func2url from '../../backend/func2url.json';

const API_URL = func2url.api;

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  symbols?: string[];
}

const HINTS = [
  'Я летел над городом, а потом начал падать',
  'Мне снилась чистая вода и старый дом',
  'За мной кто-то гнался по тёмной дороге',
  'Я разговаривал с бабушкой, которой давно нет',
];

const formatText = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-primary">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );

const greeting: Message = {
  id: 'hello',
  role: 'bot',
  text:
    'Здравствуйте. Опишите сон так, как помните — обрывками, без порядка, это нормально. Чем больше деталей и ощущений, тем точнее толкование.',
};

const openPricing = () =>
  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const openAccount = () =>
  document.getElementById('account')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const DreamChat = () => {
  const { user, left, hasAccess, spend, syncAccess, addDream } = useDreamWallet();
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, typing]);

  const send = async () => {
    const value = input.trim();
    if (value.length < 12) {
      setError('Опишите сон чуть подробнее — минимум 12 символов.');
      return;
    }
    setError('');

    if (!hasAccess && left <= 0) {
      toast({
        title: 'Бесплатные сны закончились',
        description: user
          ? 'Откройте полный доступ, чтобы толковать без ограничений.'
          : 'Зарегистрируйтесь или откройте полный доступ.',
      });
      if (user) openPricing();
      else openAccount();
      return;
    }

    if (!user) {
      const allowed = await spend();
      if (!allowed) {
        toast({
          title: 'Бесплатные сны закончились',
          description: 'Создайте кабинет или откройте полный доступ.',
        });
        openAccount();
        return;
      }
    }

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: value };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const moon = getMoonInfo(new Date());
    const local = interpretDream(value);

    let answer = '';
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'interpret',
          dream: value,
          user_id: user?.user_id,
          moon_phase: `${moon.phaseName}, ${moon.lunarDay} лунный день`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.answer) answer = data.answer as string;
      if (res.ok && user) syncAccess(data);
    } catch {
      /* сеть недоступна — покажем локальный разбор */
    }

    const text = answer || local.text;
    setMessages((prev) => [
      ...prev,
      { id: `b-${Date.now()}`, role: 'bot', text, symbols: local.symbols.map((s) => s.title) },
    ]);
    setTyping(false);
    addDream({
      id: `d-${Date.now()}`,
      date: new Date().toISOString(),
      question: value,
      answer: text,
      mood: local.mood,
      symbols: local.symbols.map((s) => s.title),
    });
  };

  return (
    <section id="chat" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Главный зал</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
            Чат с <span className="gold-text italic font-semibold">СонникАИ</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Напишите сон своими словами. Бот найдёт архетипы, определит интонацию и объяснит,
            о чём говорит ваша ночь.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-border bg-card/70 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-border/70 bg-secondary/40 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                <Icon name="Moon" size={17} className="text-primary" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-medium">СонникАИ</p>
                <p className="text-xs text-muted-foreground">
                  {typing ? 'всматривается в сон…' : 'на связи'}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs">
              <Icon name="Wallet" size={13} className="text-primary" />
              {hasAccess ? 'Безлимит' : `${left} / ${FREE_DREAMS}`}
            </span>
          </div>

          <div className="max-h-[460px] space-y-5 overflow-y-auto px-5 py-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`animate-fade-in flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm border border-border bg-secondary/60 text-foreground'
                  }`}
                >
                  {m.role === 'bot' ? formatText(m.text) : m.text}
                  {m.symbols && m.symbols.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.symbols.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] text-primary"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-secondary/60 px-4 py-3.5">
                  <span className="h-1.5 w-1.5 animate-twinkle rounded-full bg-primary" />
                  <span
                    className="h-1.5 w-1.5 animate-twinkle rounded-full bg-primary"
                    style={{ animationDelay: '0.4s' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-twinkle rounded-full bg-primary"
                    style={{ animationDelay: '0.8s' }}
                  />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border/70 bg-secondary/25 px-5 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {HINTS.map((hint) => (
                <button
                  key={hint}
                  onClick={() => setInput(hint)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {hint}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Мне снилось, что..."
                className="min-h-[56px] resize-none border-border bg-background/70 text-sm"
              />
              <Button onClick={send} size="icon" className="h-12 w-12 shrink-0 rounded-xl">
                <Icon name="Send" size={18} />
              </Button>
            </div>
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            {!hasAccess && left === 0 && (
              <button
                onClick={user ? openPricing : openAccount}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm text-primary transition-colors hover:bg-primary/20"
              >
                <Icon name={user ? 'Sparkles' : 'UserPlus'} size={15} />
                {user
                  ? 'Бесплатные сны закончились — открыть полный доступ'
                  : 'Бесплатные сны закончились — создать кабинет'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DreamChat;