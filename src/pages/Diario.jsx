import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "manual-diario-v1";
const HOJE = new Date().toISOString().slice(0, 10);
const EMPREGADOS_PADRAO = ["Eva", "João", "Pedro", "Marcelo", "Contador"];

function novoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function estadoInicial() {
  return {
    empregados: EMPREGADOS_PADRAO,
    selecionado: EMPREGADOS_PADRAO[0],
    porFuncionario: {},
  };
}

function normalizarEstado(salvo) {
  const base = estadoInicial();
  const empregados = Array.isArray(salvo?.empregados) && salvo.empregados.length ? salvo.empregados : base.empregados;
  const selecionado = empregados.includes(salvo?.selecionado) ? salvo.selecionado : empregados[0];
  const porFuncionario = salvo?.porFuncionario && typeof salvo.porFuncionario === "object" ? salvo.porFuncionario : {};

  const estado = { empregados, selecionado, porFuncionario: {} };

  for (const nome of empregados) {
    const registro = porFuncionario[nome] || { tarefas: [], atualizadoEm: HOJE };
    const tarefas = Array.isArray(registro.tarefas) ? registro.tarefas : [];
    estado.porFuncionario[nome] = {
      atualizadoEm: registro.atualizadoEm === HOJE ? HOJE : HOJE,
      tarefas: registro.atualizadoEm === HOJE ? tarefas : tarefas.map((t) => ({ ...t, concluida: false })),
    };
  }

  return estado;
}

function carregarEstado() {
  if (typeof window === "undefined") return estadoInicial();

  try {
    const salvo = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    return normalizarEstado(salvo);
  } catch {
    return estadoInicial();
  }
}

export default function Diario() {
  const [estado, setEstado] = useState(() => carregarEstado());
  const [novaTarefa, setNovaTarefa] = useState("");
  const [novoEmpregado, setNovoEmpregado] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  }, [estado]);

  const funcionarioAtual = estado.selecionado;
  const tarefas = useMemo(() => estado.porFuncionario[funcionarioAtual]?.tarefas || [], [estado, funcionarioAtual]);
  const concluidas = tarefas.filter((t) => t.concluida).length;

  function salvarFuncionario(nome, updater) {
    setEstado((atual) => {
      const atualPorFuncionario = atual.porFuncionario[nome] || { tarefas: [], atualizadoEm: HOJE };
      const atualizado = updater(atualPorFuncionario);
      return {
        ...atual,
        porFuncionario: {
          ...atual.porFuncionario,
          [nome]: {
            ...atualizado,
            atualizadoEm: HOJE,
          },
        },
      };
    });
  }

  function adicionarTarefa() {
    const texto = novaTarefa.trim();
    if (!texto) return;

    salvarFuncionario(funcionarioAtual, (atualizado) => ({
      ...atualizado,
      tarefas: [...atualizado.tarefas, { id: novoId(), texto, concluida: false }],
    }));
    setNovaTarefa("");
  }

  function alternarTarefa(id) {
    salvarFuncionario(funcionarioAtual, (atualizado) => ({
      ...atualizado,
      tarefas: atualizado.tarefas.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t)),
    }));
  }

  function limparMarcacoes() {
    salvarFuncionario(funcionarioAtual, (atualizado) => ({
      ...atualizado,
      tarefas: atualizado.tarefas.map((t) => ({ ...t, concluida: false })),
    }));
  }

  function removerTarefa(id) {
    salvarFuncionario(funcionarioAtual, (atualizado) => ({
      ...atualizado,
      tarefas: atualizado.tarefas.filter((t) => t.id !== id),
    }));
  }

  function selecionarFuncionario(nome) {
    setEstado((atual) => ({ ...atual, selecionado: nome }));
  }

  function adicionarFuncionario() {
    const nome = novoEmpregado.trim();
    if (!nome) return;

    setEstado((atual) => {
      if (atual.empregados.includes(nome)) {
        return { ...atual, selecionado: nome };
      }

      return {
        ...atual,
        empregados: [...atual.empregados, nome],
        selecionado: nome,
        porFuncionario: {
          ...atual.porFuncionario,
          [nome]: atual.porFuncionario[nome] || { tarefas: [], atualizadoEm: HOJE },
        },
      };
    });

    setNovoEmpregado("");
  }

  return (
    <div className="min-h-screen bg-papel px-5 py-7 md:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <p className="font-corpo text-xs uppercase tracking-[0.18em] text-dourado mb-2">Rotina diária</p>
            <h1 className="font-display text-4xl leading-tight">Passo a passo diário</h1>
          </div>
          <Link to="/" className="font-corpo text-sm text-marinho-suave hover:text-marinho">
            ← Voltar ao manual
          </Link>
        </div>

        <div className="bg-white border border-kraft-claro rounded-2xl shadow-sm p-5 md:p-6 mb-5">
          <div className="grid gap-4 md:grid-cols-[1.3fr_1fr_auto] items-end">
            <div>
              <label className="block font-corpo text-xs uppercase tracking-wider text-marinho-suave mb-1.5">
                Funcionário
              </label>
              <select
                value={funcionarioAtual}
                onChange={(e) => selecionarFuncionario(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-kraft rounded text-sm bg-white focus:border-dourado focus:outline-none"
              >
                {estado.empregados.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-corpo text-xs uppercase tracking-wider text-marinho-suave mb-1.5">
                Novo funcionário
              </label>
              <input
                type="text"
                value={novoEmpregado}
                onChange={(e) => setNovoEmpregado(e.target.value)}
                placeholder="Ex: Mariana"
                className="w-full px-3.5 py-2.5 border border-kraft rounded text-sm bg-white focus:border-dourado focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={adicionarFuncionario}
              className="bg-marinho text-white font-corpo font-semibold text-sm px-5 py-3 rounded hover:opacity-90"
            >
              + Adicionar
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              type="button"
              onClick={limparMarcacoes}
              className="bg-dourado text-marinho font-corpo font-semibold text-sm px-5 py-3 rounded hover:opacity-90"
            >
              Limpar marcações do dia
            </button>
            <span className="text-sm text-marinho-suave">
              {concluidas} de {tarefas.length} concluídas hoje
            </span>
          </div>
        </div>

        <div className="bg-white border border-kraft-claro rounded-2xl shadow-sm p-5 md:p-6 mb-5">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={novaTarefa}
              onChange={(e) => setNovaTarefa(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  adicionarTarefa();
                }
              }}
              placeholder="Digite uma tarefa do dia e pressione Enter"
              className="flex-1 px-3.5 py-3 border border-kraft rounded text-sm bg-white focus:border-dourado focus:outline-none"
            />
            <button
              type="button"
              onClick={adicionarTarefa}
              className="bg-pasto text-white font-corpo font-semibold text-sm px-5 py-3 rounded hover:opacity-90"
            >
              + Adicionar tarefa
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {tarefas.length === 0 ? (
            <div className="bg-papel-sel border border-kraft-claro rounded-2xl p-6 text-marinho-suave">
              Nenhuma tarefa cadastrada para este funcionário.
            </div>
          ) : (
            tarefas.map((tarefa, indice) => (
              <div
                key={tarefa.id}
                className={`bg-white border rounded-2xl px-4 py-4 shadow-sm flex items-start gap-4 ${
                  tarefa.concluida ? "border-pasto/40 opacity-80" : "border-kraft-claro"
                }`}
              >
                <input
                  type="checkbox"
                  checked={tarefa.concluida}
                  onChange={() => alternarTarefa(tarefa.id)}
                  className="mt-1 h-5 w-5 accent-[color:var(--pasto)]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-corpo text-[0.7rem] uppercase tracking-wider text-dourado">
                      Tarefa {indice + 1}
                    </span>
                    {tarefa.concluida && (
                      <span className="font-corpo text-[0.65rem] uppercase tracking-wider text-pasto bg-pasto/10 px-2 py-0.5 rounded">
                        Concluída
                      </span>
                    )}
                  </div>
                  <p className={`m-0 text-[0.98rem] ${tarefa.concluida ? "line-through text-marinho-suave" : "text-marinho"}`}>
                    {tarefa.texto}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removerTarefa(tarefa.id)}
                  className="text-dourado text-sm hover:opacity-80 flex-shrink-0"
                  title="Remover tarefa"
                >
                  Remover
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
