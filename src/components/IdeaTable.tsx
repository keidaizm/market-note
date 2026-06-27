import { useNavigate } from 'react-router-dom';
import type { Idea } from '../types';
import { calcTotal } from '../types';
import { StatusBadge } from './StatusBadge';
import { ScoreBadge } from './ScoreBadge';

interface Props {
  ideas: Idea[];
  onDelete: (id: string) => void;
}

export function IdeaTable({ ideas, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">アイデア名</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">カテゴリ</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">対象ユーザー</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">ステータス</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">合計点</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">想定単価</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">月商計算式</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {ideas.map((idea) => {
            const total = calcTotal(idea.scores);
            const isPromising = total !== null && total >= 20;
            return (
              <tr
                key={idea.id}
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                  isPromising ? 'bg-emerald-50/30' : ''
                }`}
                onClick={() => navigate(`/ideas/${idea.id}`)}
              >
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                  <div className="flex items-center gap-2">
                    {isPromising && <span className="text-emerald-500 text-xs font-bold">✨</span>}
                    <span className="truncate">{idea.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{idea.category}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{idea.targetUser}</td>
                <td className="px-4 py-3"><StatusBadge status={idea.status} /></td>
                <td className="px-4 py-3"><ScoreBadge total={total} /></td>
                <td className="px-4 py-3 text-gray-500">{idea.price}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{idea.revenueModel}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`「${idea.title}」を削除しますか？`)) {
                        onDelete(idea.id);
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
                  >
                    削除
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
