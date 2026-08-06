export interface MoonInfo {
  date: Date;
  lunarDay: number;
  phaseIndex: number;
  phaseName: string;
  phaseIcon: string;
  illumination: number;
  dreamMeaning: string;
  advice: string;
}

const SYNODIC = 29.530588853;
const NEW_MOON_REF = Date.UTC(2000, 0, 6, 18, 14) / 86400000;

const PHASES = [
  { name: 'Новолуние', icon: 'Circle' },
  { name: 'Растущий серп', icon: 'MoonStar' },
  { name: 'Первая четверть', icon: 'CircleDashed' },
  { name: 'Растущая луна', icon: 'Moon' },
  { name: 'Полнолуние', icon: 'CircleDot' },
  { name: 'Убывающая луна', icon: 'Moon' },
  { name: 'Последняя четверть', icon: 'CircleDashed' },
  { name: 'Старая луна', icon: 'MoonStar' },
];

const PHASE_DREAMS = [
  {
    meaning: 'Сны новолуния — семена. Они показывают не то, что есть, а то, что только зарождается.',
    advice: 'Запишите сон и загадайте желание: сейчас намерения приживаются лучше всего.',
  },
  {
    meaning: 'Сны растущего серпа подсказывают направление — часто в них появляются дороги, двери и незнакомцы.',
    advice: 'Сделайте первый маленький шаг к тому, что приснилось. Он окупится.',
  },
  {
    meaning: 'На первой четверти сны становятся тревожнее: подсознание проверяет вас на прочность.',
    advice: 'Не принимайте страшный сон за пророчество — это репетиция, а не приговор.',
  },
  {
    meaning: 'Сны растущей луны яркие и сюжетные, часто про успех, людей и признание.',
    advice: 'Обратите внимание на того, кто приснился: с этим человеком стоит связаться.',
  },
  {
    meaning: 'Сны полнолуния самые сильные и вещие — но и самые запутанные, эмоции перекрывают смысл.',
    advice: 'Толкуйте такой сон утром на свежую голову и не спешите с выводами.',
  },
  {
    meaning: 'На убывающей луне снится то, что пора отпустить: старые обиды, люди, привычки.',
    advice: 'Сон указывает, от чего освободиться. Это подсказка, а не потеря.',
  },
  {
    meaning: 'Сны последней четверти подводят итоги и возвращают в прошлое, к незакрытым историям.',
    advice: 'Завершите начатое дело — сон намекает именно на него.',
  },
  {
    meaning: 'Сны старой луны тихие и мудрые, часто с умершими родственниками и детством.',
    advice: 'Такой сон — про покой и принятие. Отдохните, не начинайте новое.',
  },
];

export const getMoonInfo = (date: Date): MoonInfo => {
  const days = date.getTime() / 86400000 - NEW_MOON_REF;
  const age = ((days % SYNODIC) + SYNODIC) % SYNODIC;
  const phaseIndex = Math.floor((age / SYNODIC) * 8 + 0.5) % 8;
  const lunarDay = Math.floor(age) + 1;
  const illumination = Math.round((1 - Math.cos((2 * Math.PI * age) / SYNODIC)) * 50);

  return {
    date,
    lunarDay,
    phaseIndex,
    phaseName: PHASES[phaseIndex].name,
    phaseIcon: PHASES[phaseIndex].icon,
    illumination,
    dreamMeaning: PHASE_DREAMS[phaseIndex].meaning,
    advice: PHASE_DREAMS[phaseIndex].advice,
  };
};

export const getMonthGrid = (year: number, month: number): (MoonInfo | null)[] => {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (MoonInfo | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(getMoonInfo(new Date(year, month, d, 12)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

export const MONTH_NAMES = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];

export const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

export const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
