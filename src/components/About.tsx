import Icon from '@/components/ui/icon';

const STEPS = [
  {
    icon: 'PenLine',
    title: 'Вы рассказываете',
    text: 'Описываете сон свободным текстом — обрывками, ощущениями, без порядка.',
  },
  {
    icon: 'ScanSearch',
    title: 'СонникАИ читает',
    text: 'Модель выделяет архетипы, определяет интонацию и связи между образами.',
  },
  {
    icon: 'ScrollText',
    title: 'Вы получаете разбор',
    text: 'Понятное толкование с символами и мягкой рекомендацией на ближайшие дни.',
  },
];

const TEAM = [
  {
    name: 'Алиса Верещагина',
    role: 'Психолог-сомнолог',
    text: 'Собрала базу архетипов и следит, чтобы толкования оставались бережными.',
    icon: 'HeartHandshake',
  },
  {
    name: 'Тимур Наумов',
    role: 'ИИ-инженер',
    text: 'Учит модель различать интонацию сна и не скатываться в гадания.',
    icon: 'BrainCircuit',
  },
  {
    name: 'Ника Орлова',
    role: 'Дизайнер',
    text: 'Отвечает за ночную эстетику: звёзды, золото и тишину интерфейса.',
    icon: 'Palette',
  },
];

const About = () => (
  <section id="about" className="relative scroll-mt-24 py-20 md:py-28">
    <div className="container">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">О проекте</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
            Не гадание,{' '}
            <span className="gold-text italic font-semibold">а разговор с собой</span>
          </h2>
          <p className="mt-5 text-muted-foreground">
            СонникАИ появился из простой идеи: сон — это письмо от самого себя, написанное
            непривычным алфавитом. Мы соединили психологию сновидений и языковую модель,
            чтобы это письмо можно было прочитать за минуту.
          </p>
          <p className="mt-4 text-muted-foreground">
            Мы не обещаем предсказаний будущего. Мы помогаем услышать то, что вы и так знаете,
            но пока не сформулировали словами.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {[
              { value: '48 000', label: 'разобранных снов' },
              { value: '12', label: 'архетипов в базе' },
              { value: '4 сек', label: 'на толкование' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card/50 p-4">
                <p className="font-display text-3xl gold-text">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="group flex gap-5 rounded-2xl border border-border bg-card/50 p-6 transition-colors hover:border-primary/35"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary transition-transform duration-300 group-hover:scale-110">
                <Icon name={s.icon} size={21} />
              </span>
              <div>
                <p className="font-display text-xl">
                  <span className="mr-2 text-sm text-primary/70">0{i + 1}</span>
                  {s.title}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20">
        <h3 className="text-center font-display text-3xl font-light">Команда</h3>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TEAM.map((m) => (
            <div
              key={m.name}
              className="rounded-2xl border border-border bg-card/50 p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/35"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                <Icon name={m.icon} size={22} />
              </span>
              <p className="mt-5 font-display text-xl">{m.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-primary/80">{m.role}</p>
              <p className="mt-4 text-sm text-muted-foreground">{m.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default About;
