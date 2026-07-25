import { Eye, Pencil } from "lucide-react";

/**
 * Fila de tabla para un ítem de inventario (equipo o componente).
 *
 * @param {Object} props - Props del componente.
 * @param {Object} props.item - Datos del ítem (id, descripción, modelo, etc.).
 * @param {string} props.category - Categoría (`equipos` o `componentes`).
 * @param {boolean} props.selected - Si la fila está seleccionada.
 * @param {Function} props.onSelect - Callback al cambiar la selección (recibe id).
 * @param {Function} [props.onView] - Callback al ver detalle.
 * @param {Function} [props.onEdit] - Callback al editar.
 * @returns {JSX.Element} Fila `<tr>` del ítem.
 */
export const ItemTable = ({
  item,
  category,
  selected,
  onSelect,
  onView,
  onEdit,
}) => (
  <tr
    className={`hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 transition-colors ${selected ? "bg-blue-50/30 dark:bg-blue-500/5" : ""}`}
  >
    <td className="py-4 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 text-center w-20">
      #{item.id}
    </td>

    <td className="py-4 px-4 w-12">
      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(item.id)}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
        />
      </div>
    </td>

    <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300 text-left">
      {item.description}
    </td>
    <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300 text-center">
      {item.modelo}
    </td>
    <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300 text-center">
      {item.marca}
    </td>

    <td className="py-4 px-4 text-sm">
      <div className="flex justify-center text-sm text-slate-700 dark:text-slate-300">
        {item.condicion}
      </div>
    </td>

    <td className="py-4 px-4 text-sm">
      <div className="flex justify-center text-sm text-slate-700 dark:text-slate-300">
        {item.estatus}
      </div>
    </td>

    {category === "componentes" ? (
      <td className="py-4 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">
        {item.cantidad}
      </td>
    ) : null}

    <td className="py-4 px-4 w-32">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onView?.(item)}
          title="Ver detalle"
          className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl cursor-pointer"
        >
          <Eye size={18} />
        </button>
        <button
          type="button"
          onClick={() => onEdit?.(item)}
          title={category === "equipos" ? "Editar equipo" : "Editar componente"}
          className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl cursor-pointer"
        >
          <Pencil size={18} />
        </button>
      </div>
    </td>
  </tr>
);
