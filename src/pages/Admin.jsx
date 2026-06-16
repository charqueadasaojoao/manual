import { useState } from "react";
import { Link } from "react-router-dom";
import { useProcessos } from "../hooks/useProcessos";
import FormularioProcesso from "../components/FormularioProcesso";

export default function Admin() {
  const { departamentos, processos, carregando, erro, criarProcesso, atualizarProcesso, excluirProcesso } =
    useProcessos();
  const [idEditando, setIdEditando] = useState(null); // null = formulário em modo "novo"

  const processoEditando = idEditando ? processos.find((p) => p.id === idEditando) : null;

  async function handleSalvar(dados, id) {
    if (id) return atualizarProcesso(id, dados);
    return criarProcesso(dados);
  }

  async function handleExcluir(id) {
    const resultado = await excluirProcesso(id);
    if (!resultado.error) setIdEditando(null);
    return resultado;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* ---------- lista lateral ---------- */}
      <aside className="w-full md:w-[360px] flex-shrink-0 bg-marinho text-papel-sel md:h-screen md:overflow-y-auto border-r-[6px] border-pasto">
        <div className="px-[22px] pt-6 pb-[18px] border-b border-white/10">
          <p className="font-display text-xl text-papel mb-1">Gerenciar Processos</p>
          <Link to="/" className="font-corpo text-xs uppercase tracking-wider text-kraft hover:text-papel">
            ← Voltar ao manual
          </Link>
        </div>

        <button
          onClick={() => setIdEditando(null)}
          className="block mx-[22px] my-4 w-[calc(100%-44px)] bg-pasto text-white font-corpo font-semibold text-sm py-3 rounded hover:opacity-90"
        >
          + Novo processo
        </button>

        {carregando && <p className="px-[22px] text-kraft text-sm">Carregando...</p>}
        {erro && <p className="px-[22px] text-dourado text-sm">Erro: {erro}</p>}

        {!carregando && processos.length === 0 && (
          <p className="px-[22px] text-kraft text-sm">Nenhum processo ainda.</p>
        )}

        {departamentos.map((depto) => {
          const lista = processos.filter((p) => p.departamento_id === depto.id);
          if (lista.length === 0) return null;
          return (
            <div key={depto.id}>
              <p className="px-[22px] pt-3.5 pb-1 font-corpo text-xs uppercase tracking-wider text-kraft">
                {depto.nome}
              </p>
              {lista.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setIdEditando(p.id)}
                  className={`flex flex-col gap-0.5 w-full text-left px-[22px] py-3 border-l-[3px] ${
                    p.id === idEditando ? "border-pasto bg-pasto/15" : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <span className="font-corpo text-[0.7rem] text-kraft">{p.codigo}</span>
                  <span className="text-sm">{p.titulo}</span>
                </button>
              ))}
            </div>
          );
        })}
      </aside>

      {/* ---------- formulário ---------- */}
      <main className="flex-1 px-5 py-7 md:px-14 md:py-10 max-w-[760px] md:h-screen md:overflow-y-auto">
        {!carregando && (
          <FormularioProcesso
            departamentos={departamentos}
            processoEditando={processoEditando}
            onSalvar={handleSalvar}
            onExcluir={handleExcluir}
          />
        )}
      </main>
    </div>
  );
}
