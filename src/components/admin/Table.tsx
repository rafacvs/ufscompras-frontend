import clsx from 'clsx';

type TableProps<T> = {
  columns: Array<{ key: keyof T | string; header: string; render?: (item: T) => React.ReactNode; className?: string }>;
  data: T[];
  emptyMessage?: string;
  className?: string;
};

const Table = <T,>({ columns, data, emptyMessage = 'Nenhum registro encontrado.', className }: TableProps<T>) => {
  if (!data.length) {
    return (
      <div className="rounded-2xl bg-[#1f1c25] p-8 text-center text-sm text-offwhite/70">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={clsx('overflow-hidden rounded-2xl border border-offwhite/10', className)}>
      <table className="w-full border-collapse text-sm">
        <thead className="bg-offwhite/5 text-offwhite/70">
          <tr>
            {columns.map((column) => (
              <th key={column.header} className={clsx('px-4 py-3 text-left text-xs uppercase tracking-widest', column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-offwhite/10 bg-[#16131c]">
          {data.map((item, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-white/5">
              {columns.map((column) => (
                <td key={column.header} className={clsx('px-4 py-3 text-offwhite/80', column.className)}>
                  {column.render ? column.render(item) : (item as Record<string, unknown>)[column.key as string]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

