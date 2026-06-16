import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Sidebar({ departamentos, processos }) {
  const { sair } = useAuth();
  const [busca, setBusca] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const [departamentosAbertos, setDepartamentosAbertos] = useState(() => new Set(departamentos.map((d) => d.id)));

  const termo = busca.trim().toLowerCase();

  const grupos = useMemo(() => {
    return departamentos
      .map((depto) => {
        const todos = processos.filter((p) => p.departamento_id === depto.id);
        const filtrados = termo
          ? todos.filter(
              (p) =>
                p.titulo.toLowerCase().includes(termo) ||
                p.codigo.toLowerCase().includes(termo) ||
                (p.resumo || "").toLowerCase().includes(termo)
            )
          : todos;
        return { depto, processos: filtrados };
      })
      .filter((g) => g.processos.length > 0 || (!termo && g.processos.length === 0 && false))
      .filter((g) => termo ? g.processos.length > 0 : true);
  }, [departamentos, processos, termo]);

  function alternarDepartamento(id) {
    setDepartamentosAbertos((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  return (
    <aside className="w-full md:w-[300px] flex-shrink-0 bg-marinho text-papel-sel flex flex-col md:h-screen md:sticky md:top-0 md:overflow-y-auto border-r-[6px] border-dourado">
      <div className="px-6 pt-7 pb-5 border-b border-white/10">
        <p className="font-display text-2xl font-semibold leading-tight text-papel">Charqueada São João</p>
        <p className="font-corpo text-[0.7rem] uppercase tracking-[0.18em] text-dourado mt-1.5">
          Manual de Processos
        </p>
      </div>

      <button
        className="md:hidden flex items-center justify-between w-full px-5 py-3.5 font-corpo text-xs uppercase tracking-wider border-t border-b border-white/10"
        onClick={() => setMenuAberto((v) => !v)}
        aria-expanded={menuAberto}
      >
        <span>Menu de processos</span>
        <span aria-hidden="true">☰</span>
      </button>

      <div className="px-5 py-4 border-b border-white/10">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar processo, código ou palavra-chave..."
          aria-label="Buscar processo"
          className="w-full bg-marinho-suave border border-white/15 text-papel font-corpo text-sm px-3 py-2.5 rounded placeholder:text-white/40 focus:border-dourado focus:outline-none"
        />
      </div>

      <nav className={`flex-1 py-2 pb-6 ${menuAberto ? "block" : "hidden md:block"}`} aria-label="Navegação de processos">
        {grupos.length === 0 && (
          <p className="px-5 py-5 text-kraft text-sm">
            {termo ? `Nenhum processo encontrado para "${busca}".` : "Nenhum processo cadastrado ainda."}
          </p>
        )}

        {grupos.map(({ depto, processos: lista }) => {
          const aberto = departamentosAbertos.has(depto.id);
          return (
            <div key={depto.id}>
              <button
                onClick={() => alternarDepartamento(depto.id)}
                className="flex items-center justify-between w-full px-5 pt-4 pb-2 font-corpo text-[0.72rem] uppercase tracking-[0.16em] text-papel-sel/90 text-left"
              >
                <span>
                  {depto.nome} <span className="opacity-50">({lista.length})</span>
                </span>
                <span className={`text-dourado text-xs transition-transform ${aberto ? "rotate-90" : ""}`} aria-hidden="true">
                  ▸
                </span>
              </button>

              {aberto && (
                <ul className="list-none m-0 p-0">
                  {lista.map((p) => (
                    <li key={p.codigo}>
                      <NavLink
                        to={`/processo/${p.codigo}`}
                        onClick={() => setMenuAberto(false)}
                        className={({ isActive }) =>
                          `flex items-baseline gap-2.5 px-5 py-2.5 pl-7 text-sm border-l-[3px] ${
                            isActive
                              ? "border-dourado bg-dourado/15 text-papel font-semibold"
                              : "border-transparent hover:bg-white/5"
                          }`
                        }
                      >
                        <span className="font-corpo text-[0.7rem] text-dourado flex-shrink-0">{p.codigo}</span>
                        <span>{p.titulo}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <Link
          to="/diario"
          className="block w-full text-center bg-dourado text-marinho font-corpo font-semibold text-sm py-3 rounded mb-2.5 hover:opacity-90"
        >
          🗓️ Passo a passo diário
        </Link>
        <Link
          to="/admin"
          className="block w-full text-center bg-pasto text-papel font-corpo font-semibold text-sm py-3 rounded mb-2.5 hover:opacity-90"
        >
          ⚙️ Gerenciar processos
        </Link>
        <Link
          to="/imprimir"
          target="_blank"
          rel="noopener"
          className="block w-full text-center bg-dourado text-marinho font-corpo font-semibold text-sm py-3 rounded mb-2.5 hover:opacity-90"
        >
          🖨️ Versão para impressão
        </Link>
        <button
          onClick={sair}
          className="block w-full text-center bg-transparent border border-white/25 text-papel-sel font-corpo text-sm py-3 rounded hover:bg-white/5"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
