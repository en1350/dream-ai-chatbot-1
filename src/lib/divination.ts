import { LENORMAND_CARDS } from './lenormand';
import { TAROT_CARDS } from './tarot';

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
    subtitle: 'Полная колода из 78 карт — говорит о смысле и внутреннем пути',
    icon: 'Sparkles',
    cards: TAROT_CARDS,
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