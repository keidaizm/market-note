import { useState, useRef, useCallback } from 'react';
import type { ImportIdea } from '../types';

interface Props {
  onImport: (items: ImportIdea[]) => number;
  onClose: () => void;
}

const REQUIRED_FIELDS: (keyof ImportIdea)[] = ['title'];

export function JsonImport({ onImport, onClose }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json')) {
      setError(['JSONファイル（.json）を選択してください。']);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setText(String(e.target?.result ?? ''));
      setError([]);
      setSuccess(null);
    };
    reader.readAsText(file, 'utf-8');
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // 子要素へのフォーカス移動では解除しない
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  };

  const handleImport = () => {
    setError([]);
    setSuccess(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      setError(['JSONの形式が正しくありません。有効なJSON配列を貼り付けてください。']);
      return;
    }

    if (!Array.isArray(parsed)) {
      setError(['JSONは配列形式（[...]）で貼り付けてください。']);
      return;
    }

    const errors: string[] = [];
    const valid: ImportIdea[] = [];

    parsed.forEach((item: unknown, idx: number) => {
      if (typeof item !== 'object' || item === null) {
        errors.push(`[${idx + 1}件目] オブジェクト形式ではありません`);
        return;
      }
      const obj = item as Record<string, unknown>;
      const missing = REQUIRED_FIELDS.filter(
        (f) => !obj[f] || typeof obj[f] !== 'string' || !(obj[f] as string).trim()
      );
      if (missing.length > 0) {
        errors.push(`[${idx + 1}件目] 必須項目が不足しています: ${missing.join(', ')}`);
        return;
      }
      valid.push({
        title: String(obj.title ?? '').trim(),
        category: obj.category ? String(obj.category).trim() : '',
        targetUser: obj.targetUser ? String(obj.targetUser).trim() : '',
        marketDefinition: obj.marketDefinition ? String(obj.marketDefinition).trim() : '',
        problem: obj.problem ? String(obj.problem).trim() : '',
        service: obj.service ? String(obj.service).trim() : '',
        price: obj.price ? String(obj.price).trim() : '',
        revenueModel: obj.revenueModel ? String(obj.revenueModel).trim() : '',
        memo: obj.memo ? String(obj.memo).trim() : '',
      });
    });

    if (errors.length > 0) {
      setError(errors);
      return;
    }

    const count = onImport(valid);
    setSuccess(`${count}件のアイデアをインポートしました。`);
    setText('');
  };

  const sample = JSON.stringify(
    [
      {
        title: '小規模店舗向けGoogleビジネス改善支援',
        category: '地域ビジネス',
        targetUser: '松戸周辺の個人飲食店オーナー',
        marketDefinition: 'Googleマップ集客に困っている個人店約1000店舗',
        problem: '投稿や口コミ返信が継続できない',
        service: '月額で投稿・口コミ返信・写真改善を支援',
        price: '月額30000円',
        revenueModel: '3万円×34店舗=月商102万円',
        memo: 'サンシャインクロッフルの経験を横展開可能',
      },
    ],
    null,
    2
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">JSONインポート</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-sm text-gray-600">
            JSONファイルをドロップするか、テキストエリアに直接貼り付けてください。
            ステータスは「未評価」、採点は未入力で登録されます。
          </p>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-colors select-none ${
              isDragging
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            <p className="text-3xl mb-2">{isDragging ? '📂' : '📁'}</p>
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? 'ここで離してください' : 'JSONファイルをドラッグ＆ドロップ'}
            </p>
            <p className="text-xs text-gray-400 mt-1">またはクリックしてファイルを選択（.json）</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Paste area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              または JSON を直接貼り付け
            </label>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setError([]); setSuccess(null); }}
              rows={10}
              placeholder={sample}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {error.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-700 mb-1">エラー</p>
              <ul className="text-sm text-red-600 space-y-1">
                {error.map((e, i) => <li key={i}>・{e}</li>)}
              </ul>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-emerald-700">✅ {success}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={handleImport}
            disabled={!text.trim()}
            className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            インポート実行
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
