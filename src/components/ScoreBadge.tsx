interface Props {
  total: number | null;
  size?: 'sm' | 'lg';
}

export function ScoreBadge({ total, size = 'sm' }: Props) {
  if (total === null) {
    const cls = size === 'lg'
      ? 'text-2xl font-bold text-gray-300'
      : 'text-sm font-semibold text-gray-400';
    return <span className={cls}>—</span>;
  }

  let colorCls: string;
  if (total >= 20) {
    colorCls = size === 'lg'
      ? 'text-3xl font-black text-emerald-600'
      : 'text-sm font-bold text-emerald-600';
  } else if (total >= 15) {
    colorCls = size === 'lg'
      ? 'text-3xl font-black text-blue-600'
      : 'text-sm font-bold text-blue-600';
  } else if (total >= 10) {
    colorCls = size === 'lg'
      ? 'text-3xl font-black text-amber-500'
      : 'text-sm font-bold text-amber-500';
  } else {
    colorCls = size === 'lg'
      ? 'text-3xl font-black text-gray-500'
      : 'text-sm font-bold text-gray-500';
  }

  return (
    <span className={colorCls}>
      {total}<span className={size === 'lg' ? 'text-base font-normal text-gray-400 ml-1' : 'text-xs text-gray-400'}>/25</span>
    </span>
  );
}
