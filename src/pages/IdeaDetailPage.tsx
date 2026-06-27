import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Idea, Status, Scores } from '../types';
import { calcTotal, isScored } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ScoreBadge } from '../components/ScoreBadge';
import { ScoreInput } from '../components/ScoreInput';

const STATUS_OPTIONS: Status[] = ['未評価', '保留', '有望', '検証中', '却下', '事業化候補'];

const SCORE_CRITERIA: { key: keyof Scores; label: string; icon: string }[] = [
  { key: 'excitement',      label: 'ワクワク度',  icon: '🔥' },
  { key: 'marketPotential', label: '市場性',      icon: '📈' },
  { key: 'strength',        label: '自分の強み',  icon: '💪' },
  { key: 'differentiation', label: '棲み分け',    icon: '🎯' },
  { key: 'sustainability',  label: '継続性',      icon: '♻️' },
];

interface Props {
  ideas: Idea[];
  onUpdate: (id: string, data: Partial<Omit<Idea, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

function inputCls() {
  return 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function ScoreSelect({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-sm text-gray-700">{icon} {label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-28"
      >
        <option value="">— 未評価</option>
        {[1, 2, 3, 4, 5].map((v) => (
          <option key={v} value={v}>{v} 点</option>
        ))}
      </select>
      {value !== null && (
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((v) => (
            <span
              key={v}
              className={`w-2 h-2 rounded-full ${v <= value ? 'bg-indigo-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function IdeaDetailPage({ ideas, onUpdate, onDelete }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'view' | 'score' | 'edit'>('view');
  const [form, setForm] = useState<Omit<Idea, 'id' | 'createdAt' | 'updatedAt'> | null>(null);
  const [quickScores, setQuickScores] = useState<Scores>({
    excitement: null,
    marketPotential: null,
    strength: null,
    differentiation: null,
    sustainability: null,
  });

  const idea = ideas.find((i) => i.id === id);

  useEffect(() => {
    if (idea) {
      setForm({
        title: idea.title,
        category: idea.category,
        targetUser: idea.targetUser,
        marketDefinition: idea.marketDefinition,
        problem: idea.problem,
        service: idea.service,
        price: idea.price,
        revenueModel: idea.revenueModel,
        memo: idea.memo,
        status: idea.status,
        scores: { ...idea.scores },
        validationMemo: idea.validationMemo,
        nextAction: idea.nextAction,
      });
    }
  }, [idea]);

  if (!idea || !form) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">🔍</p>
        <p>アイデアが見つかりません</p>
        <button onClick={() => navigate('/ideas')} className="mt-4 text-indigo-600 hover:underline">一覧に戻る</button>
      </div>
    );
  }

  const set = (key: string, val: string) => setForm((f) => f ? { ...f, [key]: val } : f);
  const total = calcTotal(mode === 'score' ? quickScores : form.scores);
  const isPromising = total !== null && total >= 20;
  const unscored = !isScored(idea.scores);

  const handleStartScore = () => {
    setQuickScores({ ...idea.scores });
    setMode('score');
  };

  const handleSaveScores = () => {
    onUpdate(idea.id, { scores: quickScores });
    setMode('view');
  };

  const handleCancelScore = () => {
    setMode('view');
  };

  const handleSaveEdit = () => {
    if (!form) return;
    onUpdate(idea.id, form);
    setMode('view');
  };

  const handleCancelEdit = () => {
    setForm({
      title: idea.title,
      category: idea.category,
      targetUser: idea.targetUser,
      marketDefinition: idea.marketDefinition,
      problem: idea.problem,
      service: idea.service,
      price: idea.price,
      revenueModel: idea.revenueModel,
      memo: idea.memo,
      status: idea.status,
      scores: { ...idea.scores },
      validationMemo: idea.validationMemo,
      nextAction: idea.nextAction,
    });
    setMode('view');
  };

  const handleDelete = () => {
    if (confirm(`「${idea.title}」を削除しますか？`)) {
      onDelete(idea.id);
      navigate('/ideas');
    }
  };

  const quickTotal = calcTotal(quickScores);

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/ideas')} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">←</button>
        <div className="flex-1 min-w-0">
          {mode === 'edit' ? (
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="text-xl font-bold w-full border-b-2 border-indigo-400 focus:outline-none bg-transparent"
            />
          ) : (
            <h1 className="text-xl font-bold text-gray-900 truncate">{idea.title}</h1>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {mode === 'view' && (
            <>
              <button
                onClick={handleStartScore}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  unscored
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                ★ 評価
              </button>
              <button
                onClick={() => setMode('edit')}
                className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                編集
              </button>
              <button
                onClick={handleDelete}
                className="border border-red-200 text-red-500 px-4 py-1.5 rounded-lg text-sm hover:bg-red-50 transition-colors"
              >
                削除
              </button>
            </>
          )}
          {mode === 'score' && (
            <>
              <button
                onClick={handleSaveScores}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                評点保存
              </button>
              <button
                onClick={handleCancelScore}
                className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </>
          )}
          {mode === 'edit' && (
            <>
              <button onClick={handleSaveEdit} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">保存</button>
              <button onClick={handleCancelEdit} className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">キャンセル</button>
            </>
          )}
        </div>
      </div>

      {/* Quick Score Panel */}
      {mode === 'score' && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-indigo-800">評価入力</h2>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-700">{quickTotal ?? '—'}</span>
              <span className="text-sm text-indigo-400"> / 25点</span>
              {quickTotal !== null && quickTotal >= 20 && (
                <p className="text-xs font-bold text-emerald-600 mt-0.5">✨ 有望アイデア</p>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {SCORE_CRITERIA.map(({ key, label, icon }) => (
              <ScoreSelect
                key={key}
                label={label}
                icon={icon}
                value={quickScores[key]}
                onChange={(v) => setQuickScores((s) => ({ ...s, [key]: v }))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Score Banner */}
      {mode !== 'score' && (
        <div className={`rounded-xl p-5 mb-6 flex items-center gap-6 ${
          isPromising ? 'bg-emerald-50 border-2 border-emerald-300' : 'bg-white border border-gray-200'
        }`}>
          <div>
            {isPromising && <p className="text-xs font-bold text-emerald-600 mb-1">✨ 有望アイデア</p>}
            <ScoreBadge total={total} size="lg" />
            <p className="text-xs text-gray-400 mt-1">合計スコア（満点25点）</p>
          </div>
          <div className="flex-1 grid grid-cols-5 gap-2">
            {(
              [
                { label: 'ワクワク', val: form.scores.excitement },
                { label: '市場性',  val: form.scores.marketPotential },
                { label: '強み',    val: form.scores.strength },
                { label: '棲み分け', val: form.scores.differentiation },
                { label: '継続性',  val: form.scores.sustainability },
              ] as const
            ).map(({ label, val }) => (
              <div key={label} className="text-center">
                <p className={`text-xl font-black ${val !== null ? 'text-indigo-600' : 'text-gray-300'}`}>{val ?? '—'}</p>
                <p className="text-xs text-gray-400 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Status & Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="ステータス">
              {mode === 'edit' ? (
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls()}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <StatusBadge status={idea.status} />
              )}
            </Field>
            <Field label="カテゴリ">
              {mode === 'edit' ? (
                <input value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls()} />
              ) : (
                <p className="text-sm text-gray-700">{idea.category || '—'}</p>
              )}
            </Field>
          </div>
        </div>

        {/* Market Info */}
        <Section title="市場情報">
          <Field label="対象ユーザー">
            {mode === 'edit' ? (
              <input value={form.targetUser} onChange={(e) => set('targetUser', e.target.value)} className={inputCls()} />
            ) : (
              <p className="text-sm text-gray-700">{idea.targetUser || '—'}</p>
            )}
          </Field>
          <Field label="1000人市場の定義">
            {mode === 'edit' ? (
              <textarea value={form.marketDefinition} onChange={(e) => set('marketDefinition', e.target.value)} rows={2} className={inputCls()} />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{idea.marketDefinition || '—'}</p>
            )}
          </Field>
        </Section>

        {/* Problem & Service */}
        <Section title="課題とサービス">
          <Field label="課題">
            {mode === 'edit' ? (
              <textarea value={form.problem} onChange={(e) => set('problem', e.target.value)} rows={2} className={inputCls()} />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{idea.problem || '—'}</p>
            )}
          </Field>
          <Field label="提供サービス案">
            {mode === 'edit' ? (
              <textarea value={form.service} onChange={(e) => set('service', e.target.value)} rows={2} className={inputCls()} />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{idea.service || '—'}</p>
            )}
          </Field>
        </Section>

        {/* Revenue */}
        <Section title="収益モデル">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="想定単価">
              {mode === 'edit' ? (
                <input value={form.price} onChange={(e) => set('price', e.target.value)} className={inputCls()} />
              ) : (
                <p className="text-sm font-semibold text-gray-800">{idea.price || '—'}</p>
              )}
            </Field>
          </div>
          <Field label="月商100万円の計算式">
            {mode === 'edit' ? (
              <input value={form.revenueModel} onChange={(e) => set('revenueModel', e.target.value)} className={inputCls()} />
            ) : (
              <p className="text-sm text-gray-700">{idea.revenueModel || '—'}</p>
            )}
          </Field>
        </Section>

        {/* Scoring (edit mode only) */}
        {mode === 'edit' && (
          <Section title="採点">
            <ScoreInput scores={form.scores} onChange={(s: Scores) => setForm((f) => f ? { ...f, scores: s } : f)} />
          </Section>
        )}

        {/* Memo */}
        <Section title="メモ・アクション">
          <Field label="メモ">
            {mode === 'edit' ? (
              <textarea value={form.memo} onChange={(e) => set('memo', e.target.value)} rows={3} className={inputCls()} />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{idea.memo || '—'}</p>
            )}
          </Field>
          <Field label="検証メモ">
            {mode === 'edit' ? (
              <textarea value={form.validationMemo} onChange={(e) => set('validationMemo', e.target.value)} rows={3} className={inputCls()} />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{idea.validationMemo || '—'}</p>
            )}
          </Field>
          <Field label="次のアクション">
            {mode === 'edit' ? (
              <input value={form.nextAction} onChange={(e) => set('nextAction', e.target.value)} className={inputCls()} />
            ) : (
              <p className="text-sm text-gray-700">{idea.nextAction || '—'}</p>
            )}
          </Field>
        </Section>

        <p className="text-xs text-gray-400 text-right">
          登録: {new Date(idea.createdAt).toLocaleString('ja-JP')} ／
          更新: {new Date(idea.updatedAt).toLocaleString('ja-JP')}
        </p>
      </div>
    </div>
  );
}
