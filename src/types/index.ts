export type Status =
  | '未評価'
  | '保留'
  | '有望'
  | '検証中'
  | '却下'
  | '事業化候補';

export interface Scores {
  excitement: number | null;      // ワクワク度
  marketPotential: number | null; // 市場性
  strength: number | null;        // 自分の強み
  differentiation: number | null; // 棲み分け
  sustainability: number | null;  // 継続性
}

export interface Idea {
  id: string;
  title: string;
  category: string;
  targetUser: string;
  marketDefinition: string;
  problem: string;
  service: string;
  price: string;
  revenueModel: string;
  memo: string;
  status: Status;
  scores: Scores;
  validationMemo: string;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportIdea {
  title: string;
  category?: string;
  targetUser?: string;
  marketDefinition?: string;
  problem?: string;
  service?: string;
  price?: string;
  revenueModel?: string;
  memo?: string;
}

export type SortKey =
  | 'totalScore'
  | 'createdAt'
  | 'price'
  | 'title';

export type FilterStatus = Status | 'all' | '未評価のみ' | '有望のみ';

export function calcTotal(scores: Scores): number | null {
  const vals = [
    scores.excitement,
    scores.marketPotential,
    scores.strength,
    scores.differentiation,
    scores.sustainability,
  ];
  if (vals.every((v) => v === null)) return null;
  return vals.reduce<number>((sum, v) => sum + (v ?? 0), 0);
}

export function isScored(scores: Scores): boolean {
  return Object.values(scores).some((v) => v !== null);
}
