import { useParams } from "react-router-dom";
import { useProcessos } from "../hooks/useProcessos";
import Sidebar from "../components/Sidebar";
import ProcessoCard from "../components/ProcessoCard";

export default function Dashboard() {
  const { codigo } = useParams();
  const { departamentos, processos, carregando, erro } = useProcessos();

  const processoAtual = codigo ? processos.find((p) => p.codigo === codigo) : null;
  const departamentoAtual = processoAtual
    ? departamentos.find((d) => d.id === processoAtual.departamento_id)
    : null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar departamentos={departamentos} processos={processos} />

      <main className="flex-1 px-5 py-7 md:px-16 md:py-12">
        {carregando && <p className="text-marinho-suave">Carregando...</p>}

        {erro && <p className="text-dourado">Erro ao carregar dados: {erro}</p>}

        {!carregando && !erro && codigo && processoAtual && (
          <ProcessoCard processo={processoAtual} departamento={departamentoAtual} />
        )}

        {!carregando && !erro && codigo && !processoAtual && (
          <div className="text-marinho-suave">
            <h2 className="font-display text-xl mb-2">Processo não encontrado</h2>
            <p>O código "{codigo}" não corresponde a nenhum processo cadastrado.</p>
          </div>
        )}

        {!carregando && !erro && !codigo && (
          <BoasVindas totalProcessos={processos.length} totalDeptos={departamentos.length} />
        )}
      </main>
    </div>
  );
}

function BoasVindas({ totalProcessos, totalDeptos }) {
  return (
    <div className="flex flex-col justify-center min-h-[70vh]">
      <p className="font-corpo text-xs uppercase tracking-[0.2em] text-dourado mb-3">
        Manual de Processos
      </p>
      <h1 className="font-display text-5xl mb-4 leading-tight">Charqueada São João</h1>
      <p className="text-lg text-marinho-suave max-w-[540px]">
        Este manual reúne os procedimentos, fluxos e controles utilizados no dia a dia
        da empresa. Use o menu lateral para navegar por departamento ou busque por
        palavra-chave, título ou código do processo.
      </p>
      <div className="flex gap-8 mt-10 font-corpo">
        <div>
          <span className="block font-display text-4xl font-semibold text-dourado">{totalProcessos}</span>
          <span className="text-xs uppercase tracking-wider text-marinho-suave">Processos</span>
        </div>
        <div>
          <span className="block font-display text-4xl font-semibold text-dourado">{totalDeptos}</span>
          <span className="text-xs uppercase tracking-wider text-marinho-suave">Departamentos</span>
        </div>
      </div>
    </div>
  );
}
