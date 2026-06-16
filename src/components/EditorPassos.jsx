export default function EditorPassos({ passos, onChange }) {
  function atualizarPasso(index, campo, valor) {
    const novos = passos.map((p, i) => (i === index ? { ...p, [campo]: valor } : p));
    onChange(novos);
  }

  function removerPasso(index) {
    onChange(passos.filter((_, i) => i !== index));
  }

  function adicionarPasso() {
    onChange([...passos, { responsavel: "", acao: "" }]);
  }

  return (
    <div>
      {passos.map((passo, i) => (
        <div key={i} className="flex gap-2.5 items-start mb-2.5 p-3 bg-papel-sel rounded">
          <div className="flex-1 flex flex-col gap-2">
            <input
              type="text"
              placeholder="Responsável (ex: João / Pedro)"
              value={passo.responsavel}
              onChange={(e) => atualizarPasso(i, "responsavel", e.target.value)}
              className="bg-white border border-kraft rounded px-3 py-2 text-sm focus:border-dourado focus:outline-none"
            />
            <input
              type="text"
              placeholder="Ação realizada nesse passo"
              value={passo.acao}
              onChange={(e) => atualizarPasso(i, "acao", e.target.value)}
              className="bg-white border border-kraft rounded px-3 py-2 text-sm focus:border-dourado focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => removerPasso(i)}
            title="Remover passo"
            className="flex-shrink-0 w-7 h-7 rounded-full bg-marinho text-white text-base leading-none hover:bg-marinho-suave"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={adicionarPasso}
        className="w-full border-2 border-dashed border-kraft text-marinho-suave py-2.5 rounded text-sm hover:border-dourado hover:text-dourado mb-6"
      >
        + Adicionar passo
      </button>
    </div>
  );
}
