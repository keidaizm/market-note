import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Idea, Status } from '../types';
import { calcTotal, isScored } from '../types';
import { IdeaCard } from '../components/IdeaCard';
import { IdeaTable } from '../components/IdeaTable';
import { JsonImport } from '../components/JsonImport';
import type { ImportIdea } from '../types';

type ViewMode = 'card' | 'table';
type SortKey = 'totalScore' | 'createdAt' | 'price';

const STATUS_OPTIONS: Status[] = ['未評価', '保留', '有望', '検証中', '却下', '事業化候補'];

interface Props {
  ideas: Idea[];
  onDelete: (id: string) => void;
  onImport: (items: ImportIdea[]) => number;
  onExportJson: () => string;
  onExportCsv: () => string;
}

export function IdeaListPage({ ideas, onDelete, onImport, onExportJson, onExportCsv }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<ViewMode>('card');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDesc, setSortDesc] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showImport, setShowImport] = useState(false);
  const [searchText, setSearchText] = useState('');

  // URLパラメータでフィルターを初期化
  useEffect(() => {
    const f = searchParams.get('filter');
    if (f) setFilterStatus(f);
  }, [searchParams]);

  const categories = useMemo(() => {
    const cats = new Set(ideas.map((i) => i.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [ideas]);

  const filtered = useMemo(() => {
    let list = [...ideas];

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.targetUser.toLowerCase().includes(q)
      );
    }

    if (filterStatus === '未評価のみ') {
      list = list.filter((i) => !isScored(i.scores));
    } else if (filterStatus === '有望のみ') {
      list = list.filter((i) => {
        const t = calcTotal(i.scores);
        return t !== null && t >= 20;
      });
    } else if (filterStatus !== 'all') {
      list = list.filter((i) => i.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      list = list.filter((i) => i.category === filterCategory);
    }

    list.sort((a, b) => {
      let diff = 0;
      if (sortKey === 'totalScore') {
        const ta = calcTotal(a.scores) ?? -1;
        const tb = calcTotal(b.scores) ?? -1;
        diff = ta - tb;
      } else if (sortKey === 'createdAt') {
        diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortKey === 'price') {
        const pa = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
        const pb = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
        diff = pa - pb;
      }
      return sortDesc ? -diff : diff;
    });

    return list;
  }, [ideas, searchText, filterStatus, filterCategory, sortKey, sortDesc]);

  const downloadFile = (content: string, filename: string, type: string) => {
    const bom = type === 'text/csv' ? '﻿' : '';
    const blob = new Blob([bom + content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {showImport && (
        <JsonImport
          onImport={(items) => {
            const count = onImport(items);
            return count;
          }}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">アイデア一覧</h1>
          <p className="text-sm text-gray-400">{filtered.length} 件表示 / 全{ideas.length}件</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            📥 JSONインポート
          </button>
          <button
            onClick={() => downloadFile(onExportJson(), 'market-note-export.json', 'application/json')}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            📤 JSON出力
          </button>
          <button
            onClick={() => downloadFile(onExportCsv(), 'market-note-export.csv', 'text/csv')}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            📊 CSV出力
          </button>
          <button
            onClick={() => navigate('/ideas/new')}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            ＋ 追加
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="名前・カテゴリ・対象で検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">ステータス: 全て</option>
            <option value="未評価のみ">未評価のみ</option>
            <option value="有望のみ">有望のみ（20点以上）</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">カテゴリ: 全て</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="createdAt">登録日順</option>
            <option value="totalScore">合計点順</option>
            <option value="price">単価順</option>
          </select>

          <button
            onClick={() => setSortDesc((v) => !v)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
          >
            {sortDesc ? '↓ 降順' : '↑ 昇順'}
          </button>

          {/* View toggle */}
          <div className="ml-auto flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('card')}
              className={`px-3 py-1.5 text-sm transition-colors ${view === 'card' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              ▦ カード
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 text-sm transition-colors ${view === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              ≡ テーブル
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">💡</p>
          <p className="font-medium">アイデアがありません</p>
          <p className="text-sm mt-1">「＋ 追加」またはJSONインポートでアイデアを登録してください</p>
        </div>
      ) : view === 'card' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <IdeaTable ideas={filtered} onDelete={onDelete} />
      )}
    </div>
  );
}
