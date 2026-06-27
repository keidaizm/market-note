import type { Scores } from '../types';

const SCORE_LABELS: { key: keyof Scores; label: string; icon: string }[] = [
  { key: 'excitement',      label: 'ワクワク度',   icon: '🔥' },
  { key: 'marketPotential', label: '市場性',       icon: '📈' },
  { key: 'strength',        label: '自分の強み',   icon: '💪' },
  { key: 'differentiation', label: '棲み分け',     icon: '🎯' },
  { key: 'sustainability',  label: '継続性',       icon: '♻️' },
];

interface Props {
  scores: Scores;
  onChange: (scores: Scores) => void;
}

export function ScoreInput({ scores, onChange }: Props) {
  const handleScore = (key: keyof Scores, val: number) => {
    const current = scores[key];
    onChange({ ...scores, [key]: current === val ? null : val });
  };

  return (
    <div className="space-y-3">
      {SCORE_LABELS.map(({ key, label, icon }) => (
        <div key={key} className="flex items-center gap-3">
          <div className="w-36 flex-shrink-0">
            <span className="text-sm text-gray-700">{icon} {label}</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((v) => {
              const active = scores[key] === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleScore(key, v)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md scale-110'
                      : 'bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-700'
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
          <span className="text-sm text-gray-400 w-4">
            {scores[key] !== null ? scores[key] : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}
