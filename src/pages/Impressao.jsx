import { Link } from "react-router-dom";
import { useProcessos } from "../hooks/useProcessos";
import ProcessoCard from "../components/ProcessoCard";

function ancoraDoProcesso(codigo) {
  return "proc-" + codigo.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function Impressao() {
  const { departamentos, processos, carregando, erro } = useProcessos();

  const hoje = new Date().toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (carregando) {
    return <p className="p-16 text-marinho-suave">Carregando manual...</p>;
  }

  if (erro) {
    return <p className="p-16 text-dourado">Erro ao carregar dados: {erro}</p>;
  }

  if (processos.length === 0) {
    return <p className="p-16 text-marinho-suave">Nenhum processo cadastrado ainda.</p>;
  }

  return (
    <div className="bg-papel min-h-screen">
      {/* ---------- controles em tela, ocultos na impressão ---------- */}
      <div className="no-print sticky top-0 z-10 flex items-center gap-4 bg-marinho px-6 py-3.5 border-b-4 border-dourado">
        <button
          onClick={() => window.print()}
          className="bg-dourado text-marinho font-corpo font-semibold text-sm px-[18px] py-2.5 rounded hover:opacity-90"
        >
          🖨️ Imprimir / Salvar como PDF
        </button>
        <Link to="/" className="text-papel-sel text-sm hover:text-papel">
          ← Voltar ao dashboard
        </Link>
      </div>

      <div className="max-w-[760px] mx-auto px-5 py-10">
        {/* ---------- capa ---------- */}
        <section className="quebra-pagina flex flex-col justify-center items-start min-h-[90vh] border-b-[6px] border-dourado pb-14 mb-14 print:min-h-0 print:pt-[30vh]">
          <p className="font-corpo text-xs uppercase tracking-[0.24em] text-dourado mb-[18px]">
            Manual Interno de Processos
          </p>
          <h1 className="font-display text-6xl font-bold leading-tight mb-3">
            Charqueada
            <br />
            São João
          </h1>
          <p className="font-display text-2xl text-marinho-suave mb-10">
            Procedimentos, fluxos e controles operacionais
          </p>
          <p className="font-corpo text-xs text-pasto tracking-wider">
            {processos.length} processos · {departamentos.length} departamentos · atualizado em {hoje}
          </p>
        </section>

        {/* ---------- sumário ---------- */}
        <section className="quebra-pagina mb-14">
          <h2 className="font-display text-3xl mb-7 pb-3 border-b-2 border-kraft-claro">Sumário</h2>

          {departamentos.map((depto) => {
            const lista = processos.filter((p) => p.departamento_id === depto.id);
            if (lista.length === 0) return null;
            return (
              <div key={depto.id} className="mb-6">
                <h3 className="font-corpo text-xs uppercase tracking-wider text-dourado mb-2.5">{depto.nome}</h3>
                <ul className="list-none m-0 p-0">
                  {lista.map((p) => (
                    <li key={p.codigo} className="sumario-linha flex items-baseline gap-2.5 py-1.5 text-[0.97rem]">
                      <span className="font-corpo text-xs text-marinho-suave flex-shrink-0">{p.codigo}</span>
                      <span>{p.titulo}</span>
                      <span className="flex-1 border-b border-dotted border-kraft relative -top-1" />
                      <a className="pagina-num" href={`#${ancoraDoProcesso(p.codigo)}`} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        {/* ---------- processos por departamento ---------- */}
        {departamentos.map((depto) => {
          const lista = processos.filter((p) => p.departamento_id === depto.id);
          if (lista.length === 0) return null;
          return (
            <section key={depto.id} className="quebra-pagina pt-2.5 mb-2.5">
              <h2 className="font-display text-3xl border-b-4 border-dourado pb-3 mb-7">{depto.nome}</h2>
              {lista.map((p) => (
                <div key={p.codigo} className="evitar-quebra mb-12 pb-9 border-b border-kraft-claro last:border-none">
                  <ProcessoCard processo={p} departamento={depto} ancoraId={ancoraDoProcesso(p.codigo)} />
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
