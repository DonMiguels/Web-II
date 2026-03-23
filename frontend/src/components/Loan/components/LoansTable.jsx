import { Eye, Pencil } from "lucide-react";
import { Table } from "../../Table/Table";

const getHeaders = (category) =>
  category === "equipos"
    ? [
        { label: "Descripción", align: "left" },
        { label: "Tipo", align: "left" },
        { label: "Condición", align: "center" },
        { label: "Estatus", align: "center" },
        { label: "Fecha de préstamo", align: "center" },
        { label: "Fecha de devolución", align: "center" },
      ]
    : [
        { label: "Descripción", align: "left" },
        { label: "Tipo", align: "left" },
        { label: "Cantidad", align: "center" },
        { label: "Unidad", align: "center" },
        { label: "Condición", align: "center" },
        { label: "Estatus", align: "center" },
      ];

export const LoansTable = ({
  currentCategory,
  filteredData,
  selectedIds,
  isAllSelected,
  onSelectRow,
  onSelectAll,
  onAddClick,
  onDeleteClick,
  onView,
  onEdit,
}) => {
  const currentHeaders = getHeaders(currentCategory);

  return (
    <Table
      title={`Préstamos de ${currentCategory === "equipos" ? "Equipos" : "Insumos"}`}
      headers={currentHeaders}
      showId={false}
      showSelection={true}
      showToolbarActions={true}
      isAllSelected={isAllSelected}
      onSelectAll={onSelectAll}
      onAddClick={onAddClick}
      onDeleteClick={onDeleteClick}
    >
      {filteredData.map((loan) => (
        <tr
          key={`${currentCategory}-${loan.id}`}
          className={`hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 transition-colors ${selectedIds.includes(loan.id) ? "bg-blue-50/30 dark:bg-blue-500/5" : ""}`}
        >
          <td className="py-4 px-4 w-12">
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={selectedIds.includes(loan.id)}
                onChange={() => onSelectRow(loan.id)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
              />
            </div>
          </td>
          <td className="py-4 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">
            {loan.descripcion}
          </td>
          <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
            {loan.tipo}
          </td>
          {currentCategory === "equipos" ? (
            <>
              <td className="py-4 px-4 text-center text-slate-500">
                {loan.condicion}
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {loan.estatus}
                </span>
              </td>
              <td className="py-4 px-4 text-center text-slate-500">
                {loan.fechaPrestamo}
              </td>
              <td className="py-4 px-4 text-center text-slate-500">
                {loan.fechaDevolucion}
              </td>
            </>
          ) : null}
          {currentCategory === "insumos" ? (
            <>
              <td className="py-4 px-4 text-center text-slate-500 font-semibold">
                {loan.cantidad ?? "—"}
              </td>
              <td className="py-4 px-4 text-center text-slate-500">
                <span className="rounded-full bg-slate-100 dark:bg-white/5 px-3 py-1 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">
                  {loan.unidad || "—"}
                </span>
              </td>
              <td className="py-4 px-4 text-center text-slate-500">
                {loan.condicion || "—"}
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {loan.estatus}
                </span>
              </td>
            </>
          ) : null}
          <td className="py-4 px-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onView(loan)}
                className="p-2 rounded-xl text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                title="Ver detalle"
              >
                <Eye size={18} />
              </button>
              <button
                type="button"
                onClick={() => onEdit(loan)}
                className="p-2 rounded-xl text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                title="Editar préstamo"
              >
                <Pencil size={18} />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
};
