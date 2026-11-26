import { RotateCcw, Store } from 'lucide-react';
import type { OperadoraId, Parametros, LinhaModalidade } from '@/lib/simulador';
import { calcularTodasModalidades, formatarMoeda, formatarPercentual } from '@/lib/simulador';
import { MoneyInput } from './MoneyInput';

interface SimuladorBalcaoProps {
  valorTabela: number;
  onValorTabelaChange: (v: number) => void;
  operadora: OperadoraId;
  onOperadoraChange: (op: OperadoraId) => void;
  parametros: Parametros;
  onReset: () => void;
}

export function SimuladorBalcao({
  valorTabela,
  onValorTabelaChange,
  operadora,
  onOperadoraChange,
  parametros,
  onReset,
}: SimuladorBalcaoProps) {
  const linhas = calcularTodasModalidades(valorTabela, operadora, parametros);
  const operadoraNome = operadora === 'capim' ? 'Capim' : 'Outra Operadora (Tab. 2)';

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="sm:w-72">
            <MoneyInput
              label="Valor de Tabela do Tratamento (R$)"
              value={valorTabela}
              onChange={onValorTabelaChange}
              large
            />
          </div>
          <div className="sm:w-72">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Tabela de Taxas (Operadora)
            </label>
            <select
              value={operadora}
              onChange={(e) => onOperadoraChange(e.target.value as OperadoraId)}
              className="w-full appearance-none px-3 py-2.5 text-sm font-semibold text-stone-800 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-teal-700 cursor-pointer"
            >
              <option value="capim">Capim</option>
              <option value="op2">Outra Operadora (Tab. 2)</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-teal-800 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resetar
          </button>
        </div>
        <p className="text-xs text-stone-500 mt-3 leading-relaxed">
          A política calcula, para cada modalidade, o <strong>desconto máximo</strong> que deixa a clínica com a mesma
          sobra líquida de uma venda à vista com {formatarPercentual(parametros.tetoAVistaPercent)} de desconto. Abaixo
          do preço mínimo, a aprovação exige autorização da gestão.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
          <Store className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-bold text-teal-950">
            Tabela Comparativa por Modalidade — {operadoraNome}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-teal-950 text-white text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Modalidade</th>
                <th className="py-3 px-3 font-bold text-right">Taxa Maq.</th>
                <th className="py-3 px-3 font-bold text-right">Desc. Máx. (%)</th>
                <th className="py-3 px-3 font-bold text-right">Desc. Máx. (R$)</th>
                <th className="py-3 px-4 font-bold text-right bg-teal-900">Preço Mínimo</th>
                <th className="py-3 px-3 font-bold text-right">Valor Parcela</th>
                <th className="py-3 px-3 font-bold text-right">Líq. Pós-Maq.</th>
                <th className="py-3 px-3 font-bold text-right">Sobra Clínica</th>
                <th className="py-3 px-3 font-bold text-right">Margem %</th>
                <th className="py-3 px-4 font-bold">Regra / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
              {linhas.map((linha) => (
                <LinhaTabela key={linha.modalidade.id} linha={linha} valorTabela={valorTabela} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function LinhaTabela({ linha, valorTabela }: { linha: LinhaModalidade; valorTabela: number }) {
  const sobraAvistaTeto = linhas.find((l) => l.modalidade.id === 'avista')?.sobraClinica ?? linha.sobraClinica;
  const alinhada = Math.abs(linha.sobraClinica - sobraAvistaTeto) < 0.02;

  return (
    <tr className="hover:bg-teal-50/40 transition-colors">
      <td className="py-2.5 px-4 font-bold text-teal-950 whitespace-nowrap">{linha.modalidade.nome}</td>
      <td className="py-2.5 px-3 text-right font-semibold text-stone-700">
        {linha.disponivel ? formatarPercentual(linha.taxaPercent) : '—'}
      </td>
      <td className="py-2.5 px-3 text-right font-semibold text-stone-700">
        {linha.disponivel ? formatarPercentual(linha.descontoPercent) : '—'}
      </td>
      <td className="py-2.5 px-3 text-right text-stone-600">
        {linha.disponivel ? `-${formatarMoeda(linha.descontoReais)}` : '—'}
      </td>
      <td className="py-2.5 px-4 text-right font-extrabold text-teal-900 bg-teal-50/60">
        {linha.disponivel ? formatarMoeda(linha.precoMinimo) : 'Indisponível'}
      </td>
      <td className="py-2.5 px-3 text-right text-stone-700">
        {linha.disponivel
          ? linha.modalidade.parcelas > 1
            ? `${formatarMoeda(linha.valorParcela)}`
            : '—'
          : '—'}
      </td>
      <td className="py-2.5 px-3 text-right font-semibold text-stone-800">
        {linha.disponivel ? formatarMoeda(linha.liquidoPosMaq) : '—'}
      </td>
      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700">
        {linha.disponivel ? formatarMoeda(linha.sobraClinica) : '—'}
      </td>
      <td className="py-2.5 px-3 text-right font-semibold text-stone-600">
        {linha.disponivel ? `${formatarPercentual(linha.margemSobreTabela)} tab.` : '—'}
      </td>
      <td className="py-2.5 px-4">
        {!linha.disponivel ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200">
            Modalidade não contratada
          </span>
        ) : alinhada ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Sobra equiparada ao à vista
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            Verificar política
          </span>
        )}
      </td>
    </tr>
  );
}
