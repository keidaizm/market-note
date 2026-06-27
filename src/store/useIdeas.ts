import { useState, useEffect, useCallback } from 'react';
import type { Idea, Scores, Status } from '../types';

const STORAGE_KEY = 'market_note_ideas';

function generateId(): string {
  return `idea_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): Idea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(ideas: Idea[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(ideas);
  }, [ideas]);

  const addIdea = useCallback((data: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Idea => {
    const now = new Date().toISOString();
    const idea: Idea = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setIdeas((prev) => [idea, ...prev]);
    return idea;
  }, []);

  const updateIdea = useCallback((id: string, data: Partial<Omit<Idea, 'id' | 'createdAt'>>) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id
          ? { ...idea, ...data, updatedAt: new Date().toISOString() }
          : idea
      )
    );
  }, []);

  const deleteIdea = useCallback((id: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
  }, []);

  const importIdeas = useCallback((items: Array<{
    title: string;
    category?: string;
    targetUser?: string;
    marketDefinition?: string;
    problem?: string;
    service?: string;
    price?: string;
    revenueModel?: string;
    memo?: string;
  }>): number => {
    const emptyScores: Scores = {
      excitement: null,
      marketPotential: null,
      strength: null,
      differentiation: null,
      sustainability: null,
    };
    const now = new Date().toISOString();
    const newIdeas: Idea[] = items.map((item) => ({
      id: generateId(),
      title: item.title,
      category: item.category ?? '',
      targetUser: item.targetUser ?? '',
      marketDefinition: item.marketDefinition ?? '',
      problem: item.problem ?? '',
      service: item.service ?? '',
      price: item.price ?? '',
      revenueModel: item.revenueModel ?? '',
      memo: item.memo ?? '',
      status: '未評価' as Status,
      scores: emptyScores,
      validationMemo: '',
      nextAction: '',
      createdAt: now,
      updatedAt: now,
    }));
    setIdeas((prev) => [...newIdeas, ...prev]);
    return newIdeas.length;
  }, []);

  const exportJson = useCallback((): string => {
    return JSON.stringify(ideas, null, 2);
  }, [ideas]);

  const exportCsv = useCallback((): string => {
    const headers = [
      'ID', 'アイデア名', 'カテゴリ', '対象ユーザー', '1000人市場の定義',
      '課題', 'サービス案', '想定単価', '月商100万円の計算式', 'メモ',
      'ステータス', 'ワクワク度', '市場性', '自分の強み', '棲み分け',
      '継続性', '合計点', '検証メモ', '次のアクション', '作成日', '更新日',
    ];
    const rows = ideas.map((idea) => {
      const s = idea.scores;
      const total = [s.excitement, s.marketPotential, s.strength, s.differentiation, s.sustainability]
        .reduce<number>((sum, v) => sum + (v ?? 0), 0);
      return [
        idea.id,
        idea.title,
        idea.category,
        idea.targetUser,
        idea.marketDefinition,
        idea.problem,
        idea.service,
        idea.price,
        idea.revenueModel,
        idea.memo,
        idea.status,
        s.excitement ?? '',
        s.marketPotential ?? '',
        s.strength ?? '',
        s.differentiation ?? '',
        s.sustainability ?? '',
        total,
        idea.validationMemo,
        idea.nextAction,
        idea.createdAt,
        idea.updatedAt,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }, [ideas]);

  return {
    ideas,
    addIdea,
    updateIdea,
    deleteIdea,
    importIdeas,
    exportJson,
    exportCsv,
  };
}
