import type { Status } from '../types';

const config: Record<Status, { bg: string; text: string }> = {
  '未評価':     { bg: 'bg-gray-100',   text: 'text-gray-600' },
  '保留':       { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  '有望':       { bg: 'bg-green-100',  text: 'text-green-700' },
  '検証中':     { bg: 'bg-blue-100',   text: 'text-blue-700' },
  '却下':       { bg: 'bg-red-100',    text: 'text-red-600' },
  '事業化候補': { bg: 'bg-purple-100', text: 'text-purple-700' },
};

export function StatusBadge({ status }: { status: Status }) {
  const { bg, text } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {status}
    </span>
  );
}
