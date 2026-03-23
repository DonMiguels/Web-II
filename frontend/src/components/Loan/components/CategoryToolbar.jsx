import { Search, Monitor, Package } from "lucide-react";

export const CategoryToolbar = ({
  activeCategory,
  onChangeCategory,
  searchTerm,
  onSearchTermChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50 dark:bg-white/5 backdrop-blur-md p-4 rounded-[20px] border border-slate-200 dark:border-white/5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
        <div className="flex gap-2 bg-slate-100 dark:bg-black/20 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 w-fit">
          <button
            onClick={() => onChangeCategory("equipos")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeCategory === "equipos"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Monitor size={18} /> Equipos
          </button>
          <button
            onClick={() => onChangeCategory("insumos")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeCategory === "insumos"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Package size={18} /> Insumos
          </button>
        </div>

        <div className="relative w-full lg:w-96">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Buscar por nombre, descripción o tipo..."
            className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
