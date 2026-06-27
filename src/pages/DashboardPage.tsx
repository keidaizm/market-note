import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Idea } from '../types';
import { calcTotal, isScored } from '../types';

interface Props {
  ideas: Idea[];
}

export function DashboardPage({ ideas }: Props) {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const scored = ideas.filter((i) => isScored(i.scores));
    const unscored = ideas.filter((i) => !isScored(i.scores));
    const totals = scored.map((i) => calcTotal(i.scores)).filter((v): v is number => v !== null);
    const avg = totals.length > 0 ? (totals.reduce((s, v) => s + v, 0) / totals.length).toFixed(1) : null;
    const promising = ideas.filter((i) => {
      const t = calcTotal(i.scores);
      return t !== null && t >= 20;
    });

    const categoryMap = ideas.reduce<Record<string, number>>((acc, i) => {
      const c = i.category || '未分類';
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    }, {});

    return { scored, unscored, avg, promising, categoryMap };
  }, [ideas]);

  const topIdeas = useMemo(() => {
    return [...ideas]
      .map((i) => ({ ...i, total: calcTotal(i.scores) }))
      .filter((i) => i.total !== null)
      .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
      .slice(0, 5);
  }, [ideas]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-500 text-sm mt-1">1000人市場ノート — 事業アイデアの蓄積と評価</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="登録アイデア数"
          value={ideas.length}
          icon="💡"
          color="indigo"
          onClick={() => navigate('/ideas')}
        />
        <StatCard
          label="評価済み"
          value={stats.scored.length}
          icon="✅"
          color="green"
          onClick={() => navigate('/ideas')}
        />
        <StatCard
          label="未評価"
          value={stats.unscored.length}
          icon="📋"
          color="gray"
          onClick={() => navigate('/ideas?filter=未評価のみ')}
        />
        <StatCard
          label="平均点"
          value={stats.avg ? `${stats.avg}点` : '—'}
          icon="📊"
          color="blue"
        />
        <StatCard
          label="有望アイデア（20点以上）"
          value={stats.promising.length}
          icon="✨"
          color="emerald"
          onClick={() => navigate('/ideas?filter=有望のみ')}
        />
        <StatCard
          label="カテゴリ数"
          value={Object.keys(stats.categoryMap).length}
          icon="🏷️"
          color="purple"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Ideas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🏆</span> 高スコアランキング TOP5
          </h2>
          {topIdeas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">採点済みアイデアがありません</p>
          ) : (
            <ol className="space-y-2">
              {topIdeas.map((idea, i) => (
                <li
                  key={idea.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/ideas/${idea.id}`)}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-400 text-white' :
                    i === 1 ? 'bg-gray-300 text-white' :
                    i === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 text-gray-500'
                  }`}>{i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{idea.title}</span>
                  <span className={`text-sm font-bold flex-shrink-0 ${
                    (idea.total ?? 0) >= 20 ? 'text-emerald-600' :
                    (idea.total ?? 0) >= 15 ? 'text-blue-600' : 'text-gray-500'
                  }`}>{idea.total}点</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🏷️</span> カテゴリ別件数
          </h2>
          {Object.keys(stats.categoryMap).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">データがありません</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats.categoryMap)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 flex-1 truncate">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-indigo-400 h-2 rounded-full"
                          style={{ width: `${(count / ideas.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/ideas/new')}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          ＋ アイデアを追加
        </button>
        <button
          onClick={() => navigate('/ideas')}
          className="bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          一覧を見る
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  onClick,
}: {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  onClick?: () => void;
}) {
  const colorMap: Record<string, string> = {
    indigo:  'bg-indigo-50 border-indigo-200 text-indigo-700',
    green:   'bg-green-50 border-green-200 text-green-700',
    gray:    'bg-gray-50 border-gray-200 text-gray-600',
    blue:    'bg-blue-50 border-blue-200 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    purple:  'bg-purple-50 border-purple-200 text-purple-700',
  };
  return (
    <div
      className={`rounded-xl border p-4 ${colorMap[color]} ${onClick ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium opacity-70">{label}</span>
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
