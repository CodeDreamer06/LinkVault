"use client";

import React from "react";

interface NDTableColumn<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => React.ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
}

interface NDTableProps<T> {
  columns: NDTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  activeKey?: string;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
}

export function NDTable<T>({ columns, data, keyExtractor, activeKey, onRowClick, emptyState }: NDTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const alignCls = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border-visible">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary py-2 px-3 ${alignCls[col.align || "left"]}`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const key = keyExtractor(row);
            const isActive = activeKey === key;
            return (
              <tr
                key={key}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-b border-border transition-colors duration-150
                  ${isActive ? "bg-surface-raised border-l-2 border-l-accent" : "hover:bg-surface"}
                  ${onRowClick ? "cursor-pointer" : ""}
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 px-3 ${alignCls[col.align || "left"]}`}
                  >
                    {col.render(row, i)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
