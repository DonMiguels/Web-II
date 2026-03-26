import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronsRight,
  ChevronsLeft,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth, useTheme } from "@/context";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar/Sidebar";

const Notifications = ({ embedded = false }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [group, setGroup] = useState("");
  const [message, setMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [notifiedUsers, setNotifiedUsers] = useState([]);

  const [checkedUsers, setCheckedUsers] = useState([]);
  const [checkedNotifiedUsers, setCheckedNotifiedUsers] = useState([]);

  const allUsersSelected =
    users.length > 0 && checkedUsers.length === users.length;
  const allNotifiedUsersSelected =
    notifiedUsers.length > 0 &&
    checkedNotifiedUsers.length === notifiedUsers.length;

  //Prueba
  useEffect(() => {
    const mockUsers = [
      { id: 1, name: "Carlos López", role: "Profesor" },
      { id: 2, name: "María Fernández", role: "Estudiante" },
      { id: 3, name: "Laura Gómez", role: "Estudiante" },
      { id: 4, name: "José Martínez", role: "Administrativo" },
      { id: 5, name: "Ana García", role: "Estudiante" },
    ];
    setUsers(mockUsers);
    setNotifiedUsers([]);
    setCheckedUsers([]);
    setCheckedNotifiedUsers([]);
  }, [group]);

  const toggleCheck = (id, listType) => {
    if (listType === "users") {
      setCheckedUsers((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    } else {
      setCheckedNotifiedUsers((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    }
  };

  const moveRight = (e) => {
    e.preventDefault();
    const itemsToMove = users.filter((u) => checkedUsers.includes(u.id));
    setNotifiedUsers([...notifiedUsers, ...itemsToMove]);
    setUsers(users.filter((u) => !checkedUsers.includes(u.id)));
    setCheckedUsers([]);
  };

  const moveLeft = (e) => {
    e.preventDefault();
    const itemsToMove = notifiedUsers.filter((u) =>
      checkedNotifiedUsers.includes(u.id),
    );
    setUsers([...users, ...itemsToMove]);
    setNotifiedUsers(
      notifiedUsers.filter((u) => !checkedNotifiedUsers.includes(u.id)),
    );
    setCheckedNotifiedUsers([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Notificando a:", notifiedUsers);
    console.log("Mensaje:", message);
  };

  const toggleSelectAllUsers = () => {
    if (allUsersSelected) {
      setCheckedUsers([]);
      return;
    }

    setCheckedUsers(users.map((u) => u.id));
  };

  const toggleSelectAllNotifiedUsers = () => {
    if (allNotifiedUsersSelected) {
      setCheckedNotifiedUsers([]);
      return;
    }

    setCheckedNotifiedUsers(notifiedUsers.map((u) => u.id));
  };

  return (
    <div
      className={`${embedded ? "w-full" : "flex h-screen w-full"} transition-colors duration-500 relative overflow-hidden font-sans`}
    >
      {!embedded && <Sidebar />}

      {!embedded && (
        <div className="absolute top-6 right-6 md:top-8 md:right-10 z-50 flex items-center gap-4 md:gap-6">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl border-blue-500/20 cursor-pointer"
          >
            {theme === "light" ? (
              <Moon size={20} />
            ) : (
              <Sun size={20} className="text-yellow-400" />
            )}
          </Button>
        </div>
      )}

      <div className="flex-1 p-6 md:p-8 relative overflow-y-auto custom-scrollbar flex flex-col">
        <div
          className={`${embedded ? "w-full" : "w-full max-w-6xl mx-auto"} flex flex-col gap-5 relative z-10`}
        >
          {!embedded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-start justify-between gap-4 w-full"
            >
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Notificaciones
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  PANEL DE LA URU • {new Date().toLocaleDateString("es-ES")}
                </p>
              </div>
            </motion.div>
          )}

          <div
            className={`flex-1 flex items-start ${embedded ? "justify-center pt-0 pb-2" : "justify-center pt-10 pb-8"}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${
                embedded
                  ? "w-full max-w-xl mx-auto p-0"
                  : "w-full max-w-xl p-4 md:p-5 mx-auto"
              }`}
            >
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white text-center mb-6 tracking-tight">
                Generar Notificación
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">
                    Seleccionar Grupo
                  </label>
                  <div className="relative">
                    <select
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-slate-700 dark:text-slate-200 text-sm transition-all cursor-pointer"
                    >
                      <option value="" className="dark:bg-[#0a0a0c]">
                        Todos los usuarios...
                      </option>
                      <option value="estudiantes" className="dark:bg-[#0a0a0c]">
                        Estudiantes
                      </option>
                      <option value="profesores" className="dark:bg-[#0a0a0c]">
                        Profesores
                      </option>
                      <option
                        value="administrativos"
                        className="dark:bg-[#0a0a0c]"
                      >
                        Administrativos
                      </option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                        Usuarios
                      </label>
                      <button
                        type="button"
                        onClick={toggleSelectAllUsers}
                        className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={allUsersSelected}
                          readOnly
                          className="accent-blue-600 w-3.5 h-3.5 cursor-pointer"
                        />
                        Todos
                      </button>
                    </div>
                    <div className="h-40 md:h-44 overflow-y-auto bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 custom-scrollbar">
                      {users.length === 0 ? (
                        <p className="text-[10px] text-center text-slate-400 mt-14 italic">
                          No hay usuarios
                        </p>
                      ) : (
                        users.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => toggleCheck(u.id, "users")}
                            className="flex items-center gap-3 p-1.5 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-white/10 transition-colors mb-0.5 border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                          >
                            <input
                              type="checkbox"
                              checked={checkedUsers.includes(u.id)}
                              readOnly
                              className="accent-blue-600 w-3.5 h-3.5 cursor-pointer"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                                {u.name}
                              </p>
                              <p className="text-[9px] text-slate-500 uppercase tracking-wider">
                                {u.role}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-6 md:mt-7">
                    <Button
                      onClick={moveRight}
                      disabled={checkedUsers.length === 0}
                      variant="outline"
                      className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] hover:border-blue-500 hover:text-blue-500 disabled:opacity-40 transition-colors"
                    >
                      <ChevronsRight size={16} />
                    </Button>
                    <Button
                      onClick={moveLeft}
                      disabled={checkedNotifiedUsers.length === 0}
                      variant="outline"
                      className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1115] hover:border-slate-400 hover:text-slate-400 disabled:opacity-40 transition-colors"
                    >
                      <ChevronsLeft size={16} />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                        Notificados
                      </label>
                      <button
                        type="button"
                        onClick={toggleSelectAllNotifiedUsers}
                        className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={allNotifiedUsersSelected}
                          readOnly
                          className="accent-slate-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        Todos
                      </button>
                    </div>
                    <div className="h-40 md:h-44 overflow-y-auto bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 custom-scrollbar">
                      {notifiedUsers.length === 0 ? (
                        <p className="text-[10px] text-center text-slate-400 mt-14 italic">
                          Selecciona usuarios
                        </p>
                      ) : (
                        notifiedUsers.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => toggleCheck(u.id, "notifiedUsers")}
                            className="flex items-center gap-3 p-1.5 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-white/10 transition-colors mb-0.5 border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                          >
                            <input
                              type="checkbox"
                              checked={checkedNotifiedUsers.includes(u.id)}
                              readOnly
                              className="accent-slate-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                                {u.name}
                              </p>
                              <p className="text-[9px] text-slate-500 uppercase tracking-wider">
                                {u.role}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-widest">
                    Mensaje
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe los detalles de la notificación aquí..."
                    className="w-full bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-200 text-sm resize-none h-16 transition-all custom-scrollbar placeholder:text-slate-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={notifiedUsers.length === 0 || message.trim() === ""}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-sm transition-all active:scale-95 uppercase tracking-widest text-[11px] disabled:opacity-50 disabled:active:scale-100"
                >
                  Enviar Notificación
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
