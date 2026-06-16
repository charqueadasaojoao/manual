export default function ProcessoCard({ processo, departamento, ancoraId }) {
  const p = processo;
  const localArmazenamento = p.local_armazenamento || "";
  const localEhLink = /^https?:\/\//i.test(localArmazenamento);
  const fluxogramaOriginal = p.fluxograma_imagem_url || "";
  const planilhasUrls = normalizarPlanilhasGoogleSheets(p.planilhas_google_urls || "");
  const fluxogramaUrl = normalizarUrlFluxograma(fluxogramaOriginal);
  const fluxogramaEhPdfOuDrive = fluxogramaUrl && (ehPdf(fluxogramaUrl) || ehLinkDrive(fluxogramaOriginal));
  const temFluxograma = Boolean(fluxogramaUrl);

  return (
    <article id={ancoraId} className="max-w-[920px]">
      <div className="flex items-start gap-5 mb-2">
        <span className="selo-corte font-corpo text-xs font-bold tracking-wider text-marinho bg-dourado px-3 py-1.5 rounded flex-shrink-0 mt-1.5 whitespace-nowrap">
          {p.codigo}
        </span>
        <h1 className="font-display text-3xl font-semibold leading-tight m-0">{p.titulo}</h1>
      </div>

      <p className="font-corpo text-xs uppercase tracking-[0.14em] text-pasto mb-6">
        {departamento ? departamento.nome : ""}
      </p>

      {p.resumo && (
        <p className="text-[1.05rem] text-marinho-suave border-l-[3px] border-kraft pl-4 mb-7">
          {p.resumo}
        </p>
      )}

      {temFluxograma && (
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold mb-3.5 pb-2 border-b-2 border-kraft-claro">
            Fluxograma visual
          </h2>
          {fluxogramaEhPdfOuDrive ? (
            <iframe
              src={fluxogramaUrl}
              title={`Fluxograma do processo ${p.codigo}`}
              className="w-full h-[78vh] min-h-[520px] rounded border border-kraft-claro bg-white shadow-sm"
            />
          ) : (
            <a href={fluxogramaUrl} target="_blank" rel="noreferrer" className="block">
              <img
                src={fluxogramaUrl}
                alt={`Fluxograma do processo ${p.codigo}`}
                className="w-full max-w-full rounded border border-kraft-claro bg-white shadow-sm"
              />
            </a>
          )}
          <p className="mt-2 text-xs text-marinho-suave">
            {fluxogramaEhPdfOuDrive
              ? "Se o preview do Drive não carregar, abra o link original em uma nova aba."
              : "Clique na imagem para abrir em tamanho original."}
          </p>
        </section>
      )}

      {planilhasUrls.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold mb-3.5 pb-2 border-b-2 border-kraft-claro">
            Tabelas do Google Sheets
          </h2>
          <div className="space-y-6">
            {planilhasUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="space-y-2">
                <iframe
                  src={url}
                  title={`Tabela do Google Sheets ${index + 1} do processo ${p.codigo}`}
                  className="w-full h-[72vh] min-h-[460px] rounded border border-kraft-claro bg-white shadow-sm"
                />
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs text-marinho-suave">
                    Se a tabela não carregar, abra o link em uma nova aba.
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-dourado hover:opacity-80"
                  >
                    Abrir tabela
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(p.local_armazenamento || (p.responsaveis && p.responsaveis.length > 0)) && (
        <div className="flex flex-wrap gap-3 mb-8">
          {p.local_armazenamento && (
            <div className="bg-papel-sel border border-kraft-claro rounded px-3.5 py-2.5 text-sm">
              <strong className="block font-corpo text-[0.68rem] uppercase tracking-wider text-dourado mb-1">
                Local de armazenamento
              </strong>
              {localEhLink ? (
                <a
                  href={localArmazenamento}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm break-all text-marinho underline decoration-dourado underline-offset-2 hover:opacity-80"
                >
                  {localArmazenamento}
                </a>
              ) : (
                <code className="text-sm break-all">{localArmazenamento}</code>
              )}
            </div>
          )}
          {p.responsaveis && p.responsaveis.length > 0 && (
            <div className="bg-papel-sel border border-kraft-claro rounded px-3.5 py-2.5 text-sm">
              <strong className="block font-corpo text-[0.68rem] uppercase tracking-wider text-dourado mb-1">
                Responsáveis
              </strong>
              {p.responsaveis.join(", ")}
            </div>
          )}
        </div>
      )}

      {p.campos && p.campos.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold mb-3.5 pb-2 border-b-2 border-kraft-claro">
            Campos de controle
          </h2>
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
            {p.campos.map((c, i) => (
              <li key={i} className="font-corpo text-xs bg-papel border border-kraft text-marinho-suave px-2.5 py-1.5 rounded">
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}

      {p.passos && p.passos.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold mb-3.5 pb-2 border-b-2 border-kraft-claro">
            Fluxo do processo
          </h2>
          <ol className="list-none m-0 p-0 border-l-2 border-kraft-claro ml-3.5">
            {p.passos.map((s, i) => (
              <li key={i} className="relative pl-7 py-1 pb-5">
                <span className="absolute -left-[15px] top-0 w-7 h-7 bg-papel border-2 border-dourado text-dourado font-corpo font-bold text-xs rounded-full flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="inline-block font-corpo text-[0.7rem] uppercase tracking-wider text-pasto bg-pasto/10 px-2 py-0.5 rounded mb-1">
                  {s.responsavel}
                </span>
                <p className="m-0 text-[0.97rem]">{s.acao}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {p.observacoes && (
        <section>
          <h2 className="font-display text-lg font-semibold mb-3.5 pb-2 border-b-2 border-kraft-claro">
            Observações
          </h2>
          <p className="bg-papel-sel border-l-[3px] border-pasto px-4 py-3.5 rounded text-sm m-0">
            {p.observacoes}
          </p>
        </section>
      )}
    </article>
  );
}

function normalizarUrlFluxograma(url) {
  if (!url) return "";

  const trimmed = url.trim();
  const driveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/i);

  if (driveMatch) {
    if (trimmed.toLowerCase().includes("/preview")) {
      return trimmed;
    }

    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  return trimmed;
}

function ehLinkDrive(url) {
  return /drive\.google\.com/i.test(url || "");
}

function ehPdf(url) {
  return /\.pdf($|[?#])/i.test(url || "");
}

function normalizarPlanilhasGoogleSheets(valor) {
  return valor
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map((linha) => normalizarUrlSheets(linha));
}

function normalizarUrlSheets(url) {
  if (!url) return "";

  const trimmed = url.trim();
  const match = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i);
  if (!match) return trimmed;

  const sheetId = match[1];
  const gidMatch = trimmed.match(/[?#&]gid=(\d+)/i);
  const gid = gidMatch ? gidMatch[1] : "0";

  if (/\/preview/i.test(trimmed)) {
    return trimmed;
  }

  return `https://docs.google.com/spreadsheets/d/${sheetId}/preview?gid=${gid}`;
}
