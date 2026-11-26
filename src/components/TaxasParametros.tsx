import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { OperadoraId, Parametros, TaxaMap } from '@/lib/simulador';
import { MODALIDADES_PADRAO, formatarPercentual } from '@/lib/simulador';

interface TaxasParametrosProps {
  parametros: Parametros;
  onChange: (p: Parametros) => void;
  onReset: () => void;
}

interface CampoNumeroProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: string;
  min?: string;
  max?: string;
}

function CampoNumero({ label, value, onChange, suffix = '%', step = '0.01', min = '0', max }: CampoNumeroProps) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(Number.isNaN(v) ? 0 : v);
          }}
          className="w-full px-3 py-2.5 text-sm font-bold text-teal-950 bg-stone-50 border-2 border-stone-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white transition-all"
        />
        <span className="absolute inset-y-0 right-3 flex items-center text-stone-400 text-xs font-bold pointer-events-none">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function EditorTaxas({
  titulo,
  mapa,
  taxas,
  onChange,
}: {
  titulo: string;
  mapa: TaxaMap;
  taxas: TaxaMap;
  onChange: (id: string, valor: number | null) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-stone-100 bg-stone-50/60">
        <h3 className="text-sm font-bold text-teal-950">{titulo}</h3>
        <p className="text-[11px] text-stone-500">Deixe vazio para marcar a modalidade como indisponível.</p>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {MODALIDADES_PADRAO.map((m) => {
          const valor = taxas[m.id];
          const indisponivel = valor === null || valor === undefined;
          return (
            <div key={m.id} className={`rounded-xl border p-2.5 ${indisponivel ? 'bg-stone-50 border-stone-200' : 'bg-white border-stone-200'}`}>
              <span className="text-[11px] font-bold text-stone-600 block mb-1 truncate" title={m.nome}>
                {m.nome}
              </span>
              <div className="relative">
                <input
                  type="number"
                  value={indisponivel ? '' : (valor as number)}
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="—"
                  onChange={(e) => {
                    const bruto = e.target.value;
                    if (bruto === '') {
                      onChange(m.id, null);
                      return;
                    }
                    const v = parseFloat(bruto);
                    if (!Number.isNaN(v) && v >= 0 && v <= 100) onChange(m.id, v);
                  }}
                  className="w-full pl-2.5 pr-7 py-1.5 text-sm font-bold text-teal-950 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-teal-700 focus:bg-white transition-all"
                />
                <span className="absolute inset-y-0 right-2 flex items-center text-stone-400 text-[11px] font-bold pointer-events-none">
                  %
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TaxasParametros({ parametros, onChange, onReset }: TaxasParametrosProps) {
  const setTaxa = (mapKey: 'taxasCapim' | 'taxasOp2', id: string, valor: number | null) => {
    onChange({ ...parametros, [mapKey]: { ...parametros[mapKey], [id]: valor } });
  };

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
          <div className="flex items-center gap-2 text-teal-950 font-bold text-base">
            <SlidersHorizontal className="w-5 h-5 text-teal-700" />
            <h2>Parâmetros Gerais da Política</h2>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-teal-800 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar padrão
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CampoNumero
            label="IR / Tributos"
            value={parametros.irPercent}
            onChange={(v) => onChange({ ...parametros, irPercent: v })}
          />
          <CampoNumero
            label="Repasse Profissional Executor"
            value={parametros.repassePercent}
            onChange={(v) => onChange({ ...parametros, repassePercent: v })}
          />
          <CampoNumero
            label="Teto de Desconto à Vista"
            value={parametros.tetoAVistaPercent}
            onChange={(v) => onChange({ ...parametros, tetoAVistaPercent: v })}
          />
          <CampoNumero
            label="Trava de Parcelas (Capim)"
            value={parametros.travaParcelaCapim}
            suffix="x"
            step="1"
            max="24"
            onChange={(v) => onChange({ ...parametros, travaParcelaCapim: Math.round(v) })}
          />
        </div>
        <p className="text-xs text-stone-500 mt-4 leading-relaxed">
          O teto de desconto à vista ({formatarPercentual(parametros.tetoAVistaPercent)}) define a referência de sobra
          da clínica: o desconto máximo de cada outra modalidade é aquele que preserva essa mesma sobra. A trava de
          parcelas limita o parcelamento sem juros contratado com a operadora Capim.
        </p>
      </div>

      <EditorTaxas
        titulo="Taxas Capim (Maquininha)"
        mapa={parametros.taxasCapim}
        taxas={parametros.taxasCapim}
        onChange={(id, valor) => setTaxa('taxasCapim', id, valor)}
      />
      <EditorTaxas
        titulo="Taxas Outra Operadora (Tab. 2)"
        mapa={parametros.taxasOp2}
        taxas={parametros.taxasOp2}
        onChange={(id, valor) => setTaxa('taxasOp2', id, valor)}
      />
    </section>
  );
}

export default TaxasParametros;
