import { Trash2, Plus } from "lucide-react";

export const Table = ({
  children,
  title,
  onSelectAll,
  isAllSelected,
  headers = [],
  onAddClick,
  onDeleteClick,
  showId = true,
  showSelection = true,
  showToolbarActions = true,
}) => {
  return (
    <div className="bg-white dark:bg-[#0f1115] rounded-[24px] shadow-sm overflow-hidden border border-slate-200 dark:border-white/5">
      <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5">
        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
          {title}
        </h2>
        {showToolbarActions ? (
          <div className="flex gap-3">
            <button
              onClick={onDeleteClick}
              className="flex items-center justify-center w-10 h-10 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 cursor-pointer group"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onAddClick}
              className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/5 uppercase text-[10px] font-black tracking-widest text-slate-500 border-b border-slate-100 dark:border-white/5">
              {showId ? <th className="p-4 text-center w-20">ID</th> : null}
              {showSelection ? (
                <th className="p-4 text-center w-12">
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={onSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                    />
                  </div>
                </th>
              ) : null}
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`p-4 ${header.align === "center" ? "text-center" : "text-left"} ${header.width || ""}`}
                >
                  {header.label}
                </th>
              ))}
              <th className="p-4 text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};
