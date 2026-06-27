import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Idea, Status, Scores } from '../types';
import { ScoreInput } from '../components/ScoreInput';

const STATUS_OPTIONS: Status[] = ['未評価', '保留', '有望', '検証中', '却下', '事業化候補'];

interface Props {
  onAdd: (data: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const emptyScores: Scores = {
  excitement: null,
  marketPotential: null,
  strength: null,
  differentiation: null,
  sustainability: null,
};

export function IdeaFormPage({ onAdd }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: '',
    targetUser: '',
    marketDefinition: '',
    problem: '',
    service: '',
    price: '',
    revenueModel: '',
    memo: '',
    status: '未評価' as Status,
    validationMemo: '',
    nextAction: '',
  });
  const [scores, setScores] = useState<Scores>(emptyScores);
  const [error, setError] = useState('');

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('アイデア名は必須です');
      return;
    }
    onAdd({ ...form, scores });
    navigate('/ideas');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">←</button>
        <h1 className="text-2xl font-bold text-gray-900">アイデアを追加</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Section title="基本情報">
          <Field label="アイデア名 *" error={error}>
            <input
              value={form.title}
              onChange={(e) => { set('title', e.target.value); setError(''); }}
              placeholder="例：小規模店舗向けGoogleビジネス改善支援"
              className={inputCls(!!error)}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="カテゴリ">
              <input value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="例：地域ビジネス" className={inputCls()} />
            </Field>
            <Field label="ステータス">
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls()}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="対象ユーザー">
            <input value={form.targetUser} onChange={(e) => set('targetUser', e.target.value)} placeholder="例：松戸周辺の個人飲食店オーナー" className={inputCls()} />
          </Field>
          <Field label="1000人市場の定義">
            <textarea value={form.marketDefinition} onChange={(e) => set('marketDefinition', e.target.value)} rows={2} placeholder="例：Googleマップ集客に困っている個人店約1000店舗" className={inputCls()} />
          </Field>
        </Section>

        {/* Problem & Service */}
        <Section title="課題とサービス">
          <Field label="課題">
            <textarea value={form.problem} onChange={(e) => set('problem', e.target.value)} rows={2} placeholder="例：投稿や口コミ返信が継続できない" className={inputCls()} />
          </Field>
          <Field label="提供サービス案">
            <textarea value={form.service} onChange={(e) => set('service', e.target.value)} rows={2} placeholder="例：月額で投稿・口コミ返信・写真改善を支援" className={inputCls()} />
          </Field>
        </Section>

        {/* Revenue */}
        <Section title="収益モデル">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="想定単価">
              <input value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="例：月額30,000円" className={inputCls()} />
            </Field>
          </div>
          <Field label="月商100万円の計算式">
            <input value={form.revenueModel} onChange={(e) => set('revenueModel', e.target.value)} placeholder="例：3万円×34店舗=月商102万円" className={inputCls()} />
          </Field>
        </Section>

        {/* Scoring */}
        <Section title="採点（1〜5点）">
          <ScoreInput scores={scores} onChange={setScores} />
        </Section>

        {/* Memo */}
        <Section title="メモ・アクション">
          <Field label="メモ">
            <textarea value={form.memo} onChange={(e) => set('memo', e.target.value)} rows={3} placeholder="気づき、参考情報など" className={inputCls()} />
          </Field>
          <Field label="検証メモ">
            <textarea value={form.validationMemo} onChange={(e) => set('validationMemo', e.target.value)} rows={2} placeholder="検証した内容、結果など" className={inputCls()} />
          </Field>
          <Field label="次のアクション">
            <input value={form.nextAction} onChange={(e) => set('nextAction', e.target.value)} placeholder="例：ヒアリング3件実施" className={inputCls()} />
          </Field>
        </Section>

        <div className="flex gap-3 pb-8">
          <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
            登録する
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}

function inputCls(hasError = false) {
  return `w-full border ${hasError ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h2 className="font-semibold text-gray-800 text-base">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
