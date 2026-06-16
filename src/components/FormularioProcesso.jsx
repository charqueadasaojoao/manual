import { useEffect, useState } from "react";
import EditorPassos from "./EditorPassos";

const FORM_VAZIO = {
  codigo: "",
  departamento_id: "",
  titulo: "",
  resumo: "",
  local_armazenamento: "",
  fluxograma_imagem_url: "",
  responsaveisTexto: "",
  camposTexto: "",
  passos: [{ responsavel: "", acao: "" }],
  observacoes: "",
};

function processoParaForm(p) {
  return {
    codigo: p.codigo,
    departamento_id: p.departamento_id || "",
    titulo: p.titulo || "",
    resumo: p.resumo || "",
    local_armazenamento: p.local_armazenamento || "",
    fluxograma_imagem_url: p.fluxograma_imagem_url || "",
    responsaveisTexto: (p.responsaveis || []).join(", "),
    camposTexto: (p.campos || []).join(", "),
    passos: p.passos && p.passos.length ? p.passos : [{ responsavel: "", acao: "" }],
    observacoes: p.observacoes || "",
  };
}

export default function FormularioProcesso({
  departamentos,
  processoEditando, // null = criando novo
  onSalvar,
  onExcluir,
}) {
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null); // { tipo: 'sucesso' | 'erro', texto }

  useEffect(() => {
    setForm(processoEditando ? processoParaForm(processoEditando) : FORM_VAZIO);
    setMensagem(null);
  }, [processoEditando]);

  function campo(nome, valor) {
    setForm((f) => ({ ...f, [nome]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    setMensagem(null);

    const dados = {
      codigo: form.codigo.trim(),
      departamento_id: form.departamento_id,
      titulo: form.titulo.trim(),
      resumo: form.resumo.trim(),
      local_armazenamento: form.local_armazenamento.trim(),
      fluxograma_imagem_url: form.fluxograma_imagem_url.trim(),
      responsaveis: form.responsaveisTexto.split(",").map((s) => s.trim()).filter(Boolean),
      campos: form.camposTexto.split(",").map((s) => s.trim()).filter(Boolean),
      passos: form.passos.filter((p) => p.responsavel.trim() || p.acao.trim()),
      observacoes: form.observacoes.trim(),
    };

    const { error } = await onSalvar(dados, processoEditando?.id);

    setSalvando(false);

    if (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao salvar: " + error.message });
      return;
    }

    setMensagem({
      tipo: "sucesso",
      texto: processoEditando ? "Processo atualizado com sucesso." : "Processo criado com sucesso.",
    });

    if (!processoEditando) setForm(FORM_VAZIO);
  }

  async function handleExcluir() {
    if (!processoEditando) return;
    const confirmar = window.confirm(
      `Excluir o processo "${processoEditando.codigo} — ${processoEditando.titulo}"? Esta ação não pode ser desfeita.`
    );
    if (!confirmar) return;

    const { error } = await onExcluir(processoEditando.id);
    if (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao excluir: " + error.message });
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-7">
        {processoEditando ? "Editar processo" : "Novo processo"}
      </h1>

      {mensagem && (
        <div
          className={`px-3.5 py-2.5 rounded text-sm mb-5 ${
            mensagem.tipo === "sucesso"
              ? "bg-pasto/15 border-l-[3px] border-pasto text-[#2e3a24]"
              : "bg-[#fdeae4] border-l-[3px] border-dourado text-[#7a2c17]"
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <CampoTexto
            label="Código (ex: FIN-06)"
            value={form.codigo}
            onChange={(v) => campo("codigo", v)}
            required
            disabled={!!processoEditando}
            className="flex-1"
          />
          <div className="flex-1 mb-5">
            <label className="block font-corpo text-xs uppercase tracking-wider text-marinho-suave mb-1.5">
              Departamento
            </label>
            <select
              required
              value={form.departamento_id}
              onChange={(e) => campo("departamento_id", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-kraft rounded text-sm bg-white focus:border-dourado focus:outline-none"
            >
              <option value="" disabled>
                Selecione...
              </option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <CampoTexto label="Título do processo" value={form.titulo} onChange={(v) => campo("titulo", v)} required />

        <CampoArea label="Resumo (uma frase)" value={form.resumo} onChange={(v) => campo("resumo", v)} rows={2} />

        <CampoTexto
          label="Local de armazenamento (pasta, sistema ou link do Drive)"
          placeholder="Cole aqui o link do Drive ou o caminho da pasta"
          value={form.local_armazenamento}
          onChange={(v) => campo("local_armazenamento", v)}
        />

        <CampoTexto
          label="Fluxograma visual (link da imagem do Drive ou Lucidchart)"
          placeholder="Cole aqui a URL da imagem do fluxograma"
          value={form.fluxograma_imagem_url}
          onChange={(v) => campo("fluxograma_imagem_url", v)}
        />

        <CampoTexto
          label="Responsáveis (separados por vírgula)"
          placeholder="Eva, João, Pedro"
          value={form.responsaveisTexto}
          onChange={(v) => campo("responsaveisTexto", v)}
        />

        <CampoTexto
          label="Campos de controle / planilha (separados por vírgula)"
          placeholder="Cliente, Valor, Data evento"
          value={form.camposTexto}
          onChange={(v) => campo("camposTexto", v)}
        />

        <div className="mb-5">
          <label className="block font-corpo text-xs uppercase tracking-wider text-marinho-suave mb-1.5">
            Passos do fluxo
          </label>
          <EditorPassos passos={form.passos} onChange={(novos) => campo("passos", novos)} />
        </div>

        <CampoArea label="Observações" value={form.observacoes} onChange={(v) => campo("observacoes", v)} rows={3} />

        <div className="flex gap-3 mt-8 pt-6 border-t border-kraft-claro">
          <button
            type="submit"
            disabled={salvando}
            className="bg-pasto text-white font-corpo font-semibold text-sm px-6 py-3 rounded hover:opacity-90 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar processo"}
          </button>

          {processoEditando && (
            <button
              type="button"
              onClick={handleExcluir}
              className="border border-dourado text-dourado font-corpo font-semibold text-sm px-5 py-3 rounded hover:bg-dourado hover:text-marinho"
            >
              Excluir processo
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function CampoTexto({ label, value, onChange, required, disabled, placeholder, className = "" }) {
  return (
    <div className={`mb-5 ${className}`}>
      <label className="block font-corpo text-xs uppercase tracking-wider text-marinho-suave mb-1.5">{label}</label>
      <input
        type="text"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 border border-kraft rounded text-sm bg-white focus:border-dourado focus:outline-none disabled:bg-papel-sel disabled:text-marinho-suave"
      />
    </div>
  );
}

function CampoArea({ label, value, onChange, rows }) {
  return (
    <div className="mb-5">
      <label className="block font-corpo text-xs uppercase tracking-wider text-marinho-suave mb-1.5">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 border border-kraft rounded text-sm bg-white focus:border-dourado focus:outline-none resize-y"
      />
    </div>
  );
}
