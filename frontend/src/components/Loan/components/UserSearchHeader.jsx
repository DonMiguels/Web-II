import {
  Search,
  User,
  ShieldCheck,
  Users,
  IdCard,
  Loader2,
  X,
} from "lucide-react";

/**
 * Cabecera de búsqueda y selección de usuario para préstamos.
 *
 * @param {Object} props - Props del componente.
 * @param {string} props.userSearchTerm - Término de búsqueda de usuario.
 * @param {Function} props.onUserSearchTermChange - Actualiza el término.
 * @param {Function} props.onUserSearch - Ejecuta la búsqueda.
 * @param {boolean} props.isSearchingUser - Indica si la búsqueda está en curso.
 * @param {Object|null} props.selectedUser - Usuario seleccionado.
 * @param {Function} props.onClearUser - Limpia la selección de usuario.
 * @returns {JSX.Element} Cabecera de búsqueda.
 */
export const UserSearchHeader = ({
  userSearchTerm,
  onUserSearchTermChange,
  onUserSearch,
  isSearchingUser,
  selectedUser,
  onClearUser,
}) => {
  return (
    <div className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-4">
      {isSearchingUser ? (
        <div className="w-full flex items-center justify-center gap-3 text-blue-600 font-bold italic py-4">
          <Loader2 className="animate-spin" size={20} />
          <span>Buscando información del usuario...</span>
        </div>
      ) : !selectedUser ? (
        <div className="relative w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={userSearchTerm}
            onChange={(e) => onUserSearchTermChange(e.target.value)}
            onKeyDown={onUserSearch}
            placeholder="Ingrese Cédula de Identidad..."
            className="w-full bg-slate-50 dark:bg-[#0f1115] border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 dark:text-slate-200"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <User size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white leading-none">
                {selectedUser.name}
              </h2>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <IdCard size={13} className="text-blue-500" />
                  {selectedUser.ci}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <ShieldCheck size={13} className="text-green-500" />
                  {selectedUser.profile}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Users size={13} className="text-purple-500" />
                  {selectedUser.group}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearUser}
            className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
