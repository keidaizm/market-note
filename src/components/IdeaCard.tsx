import { useNavigate } from 'react-router-dom';
import type { Idea } from '../types';
import { calcTotal } from '../types';
import { StatusBadge } from './StatusBadge';
import { ScoreBadge } from './ScoreBadge';

interface Props {
  idea: Idea;
  onDelete: (id: string) => void;
}

export function IdeaCard({ idea, onDelete }: Props) {
  const navigate = useNavigate();
  const total = calcTotal(idea.scores);
  const isPromising = total !== null && total >= 20;
  const isUnscored = total === null;

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md cursor-pointer ${
        isPromising
          ? 'border-emerald-400 ring-2 ring-emerald-100'
          : isUnscored
          ? 'border-gray-200 border-dashed'
          : 'border-gray-200'
      }`}
      onClick={() => navigate(`/ideas/${idea.id}`)}
    >
      {isPromising && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
          有望 ✨
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1">
            {idea.title}
          </h3>
          <ScoreBadge total={total} />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <StatusBadge status={idea.status} />
          {idea.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-600 font-medium">
              {idea.category}
            </span>
          )}
        </div>

        {idea.targetUser && (
          <p className="text-xs text-gray-500 mb-1">
            <span className="font-medium">対象：</span>{idea.targetUser}
          </p>
        )}
        {idea.price && (
          <p className="text-xs text-gray-500 mb-1">
            <span className="font-medium">単価：</span>{idea.price}
          </p>
        )}
        {idea.revenueModel && (
          <p className="text-xs text-gray-500">
            <span className="font-medium">月商：</span>{idea.revenueModel}
          </p>
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-2 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {new Date(idea.createdAt).toLocaleDateString('ja-JP')}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`「${idea.title}」を削除しますか？`)) {
              onDelete(idea.id);
            }
          }}
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          削除
        </button>
      </div>
    </div>
  );
}
