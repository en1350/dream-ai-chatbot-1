import { LENORMAND_CARDS } from './lenormand';

export type DeckId = 'lenormand' | 'tarot';

export interface OracleCard {
  name: string;
  icon: string;
  keyword: string;
  message: string;
  advice: string;
}

export const DECKS: Record<DeckId, { title: string; subtitle: string; icon: string; cards: OracleCard[] }> = {
  lenormand: {
    title: 'Ленорман',
    subtitle: 'Полная колода из 36 карт — говорит прямо о делах, деньгах и людях',
    icon: 'Clover',
    cards: LENORMAND_CARDS,
  },
  tarot: {
    title: 'Таро',
    subtitle: 'Старшие арканы — говорят о смысле и внутреннем пути',
    icon: 'Sparkles',
    cards: [
      {
        name: 'Шут',
        icon: 'Footprints',
        keyword: 'Начало',
        message: 'День чистого листа: можно начать что-то, не имея опыта и плана.',
        advice: 'Позвольте себе быть новичком — сегодня это преимущество, а не слабость.',
      },
      {
        name: 'Маг',
        icon: 'Wand2',
        keyword: 'Воля',
        message: 'У вас есть все инструменты, чтобы получить желаемое — не хватало решимости.',
        advice: 'Сформулируйте просьбу или предложение прямо. Сегодня «нет» маловероятно.',
      },
      {
        name: 'Верховная Жрица',
        icon: 'BookOpen',
        keyword: 'Тишина и знание',
        message: 'Ответ уже внутри, но проявится только в молчании.',
        advice: 'Не спорьте и не объясняйтесь. Наблюдайте — картина соберётся к вечеру.',
      },
      {
        name: 'Императрица',
        icon: 'Flower',
        keyword: 'Изобилие',
        message: 'День про рост, заботу и удовольствие от простых вещей.',
        advice: 'Сделайте что-то телесное и приятное: еда, прогулка, красота вокруг.',
      },
      {
        name: 'Колесница',
        icon: 'Rocket',
        keyword: 'Прорыв',
        message: 'Движение возможно, если возьмёте управление в свои руки.',
        advice: 'Выберите одно направление и не распыляйтесь — сегодня решает фокус.',
      },
      {
        name: 'Сила',
        icon: 'Shield',
        keyword: 'Мягкая власть',
        message: 'Победа сегодня достаётся терпению, а не напору.',
        advice: 'Там, где хочется надавить, — сделайте паузу на три вдоха.',
      },
      {
        name: 'Отшельник',
        icon: 'Lamp',
        keyword: 'Уединение',
        message: 'Вам нужно меньше людей и больше себя. Это не грусть, а перезагрузка.',
        advice: 'Отмените одну необязательную встречу и проведите вечер тихо.',
      },
      {
        name: 'Колесо Фортуны',
        icon: 'CircleDot',
        keyword: 'Поворот',
        message: 'Полоса меняется: то, что застыло, сдвинется без вашего участия.',
        advice: 'Не цепляйтесь за старый сценарий — новый выгоднее.',
      },
      {
        name: 'Звезда',
        icon: 'Star',
        keyword: 'Надежда',
        message: 'После трудного периода приходит тихая уверенность, что всё сложится.',
        advice: 'Загадайте желание конкретно, с датой — сегодня это работает.',
      },
      {
        name: 'Луна',
        icon: 'MoonStar',
        keyword: 'Иллюзия',
        message: 'Не всё выглядит тем, чем является: тревога сегодня преувеличивает.',
        advice: 'Отложите важные выводы до утра. Ночь исказит, утро прояснит.',
      },
      {
        name: 'Солнце',
        icon: 'SunMedium',
        keyword: 'Радость',
        message: 'Ясный, честный день — вас видят и принимают таким, какой вы есть.',
        advice: 'Покажите работу, идею или чувство. Прятать сегодня незачем.',
      },
      {
        name: 'Мир',
        icon: 'Globe',
        keyword: 'Завершение',
        message: 'Цикл закрывается: то, что тянулось, наконец получает финал.',
        advice: 'Поставьте точку сами, не дожидаясь, пока она поставится за вас.',
      },
    ],
  },
};

export const dayKey = (date = new Date()) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const hashString = (str: string) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 15;
  return h >>> 0;
};

export const drawDailyCard = (deck: DeckId, date = new Date()): OracleCard => {
  const cards = DECKS[deck].cards;
  return cards[hashString(`${dayKey(date)}::${deck}::sonnikai`) % cards.length];
};

export const todayLabel = () =>
  new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });