import { Copy, FileSpreadsheet, GitCompare, ListOrdered, RotateCcw, Wallet } from 'lucide-react';
import type { CalculoReal, Modalidade, OperadoraId, Parametros } from '@/lib/simulador';
import {
  MODALIDADES_PADRAO,
  calcularCobrancaReal,
  formatarMoeda,
  formatarPercentual,
} from '@/lib/simulador';
import { MoneyInput } from './MoneyInput';
import { AlertaPolitica } from './AlertaPolitica';

interface SimuladorRealProps {
  valorTabela: number;
  valorPago: number;
  operadora: OperadoraId;
  modalidadeId: string;
  parametros: Parametros;
  onValorTabelaChange: (v: number) => void;
  onValorPagoChange: (v: number) => void;
  onOperadoraChange: (op: OperadoraId) => void;
  onModalidadeChange: (id: string) => void;
  onReset: () => void;
  onToast: (msg: string) => void;
}

function copiar(texto: string, msg: string, onToast: (m: string) => void) {
  navigator.clipboard
    .writeText(texto)
    .then(() => onToast(msg))
    .catch(() => onToast('Não foi possível copiar automaticamente.'));
}

export function SimuladorReal({
  valorTabela,
  valorPago,
  operadora,
  modalidadeId,
  parametros,
  onValorTabelaChange,
  onValorPagoChange,
  onOperadoraChange,
  onModalidadeChange,
  onReset,
  onToast,
}: SimuladorRealProps) {
  const modalidade: Modalidade =
    MODALIDADES_PADRAO.find((m) => m.id === modalidadeId) ?? MODALIDADES_PADRAO[0];
  const calc: CalculoReal = calcularCobrancaReal(valorTabela, valorPago, modalidade, operadora, parametros);

  const opNome = operadora === 'capim' ? 'Capim' : 'Outra Operadora (Tab. 2)';
  const totalDeducoes = calc.irReais + calc.repasseReais;
  const maxSlider = Math.max(100, Math.round(valorTabela * 1.15));

  const aplicarPreset = (tipo: 'cheio' | 'metade' | 'maximo' | 'menos50') => {
    const piso = calc.precoMinPolitica;
    let novo = valorPago;
    if (tipo === 'cheio') novo = valorTabela;
    else if (tipo === 'maximo') novo = piso;
    else if (tipo === 'metade') novo = (valorTabela + piso) / 2;
    else if (tipo === 'menos50') novo = Math.max(0, valorPago - 50);
    onValorPagoChange(Math.round(novo * 100) / 100);
  };

  const resumoPaciente = () => {
    const formaLimpa = calc.modalidade.nome.replace(/ \(\d\dx\)$/, '');
    let texto = `🦷 *Orçamento Odontológico — Condição Definida*\n\n`;
    texto += `• Valor de tabela do tratamento: ${formatarMoeda(calc.valorTabela)}\n`;
    if (calc.descontoReais > 0.009) {
      texto += `• Desconto concedido: *${formatarMoeda(calc.descontoReais)} (${formatarPercentual(calc.descontoPercent)})*\n`;
    }
    texto += `• Valor final acordado: *${formatarMoeda(calc.valorPago)}*\n`;
    texto +=
      calc.modalidade.parcelas === 1
        ? `• Forma de pagamento: *${formaLimpa} (à vista)*\n`
        : `• Parcelamento: *${calc.modalidade.parcelas}x de ${formatarMoeda(calc.valorParcela)}* (sem juros no cartão)\n`;
    texto += `\n_Condição válida para fechamento hoje. Estou à disposição!_`;
    copiar(texto, 'Resumo para o paciente copiado!', onToast);
  };

  const resumoGerencial = () => {
    const texto = [
      `📊 *Resumo Interno — Cobrança Real*`,
      `• Operadora / Modalidade: ${opNome} — ${calc.modalidade.nome}`,
      `• Valor de Tabela: ${formatarMoeda(calc.valorTabela)}`,
      `• Valor Cobrado ao Paciente: ${formatarMoeda(calc.valorPago)} (Desc.: ${formatarPercentual(Math.max(0, calc.descontoPercent))})`,
      `• (-) Taxa Maquininha (${formatarPercentual(calc.taxaPercent)}): -${formatarMoeda(calc.taxaMaqReais)}`,
      `• (=) Líquido Pós-Maquininha: ${formatarMoeda(calc.liquidoPosMaq)}`,
      `• (-) IR (${formatarPercentual(parametros.irPercent)}): -${formatarMoeda(calc.irReais)}`,
      `• (-) Repasse (${formatarPercentual(parametros.repassePercent)}): -${formatarMoeda(calc.repasseReais)}`,
      `• *(=) Sobra Líquida Clínica: ${formatarMoeda(calc.sobraClinica)}* (${formatarPercentual(calc.margemSobreCobrado)} s/ cobrado | ${formatarPercentual(calc.margemSobreTabela)} s/ tabela)`,
      `• Diferença vs. Desconto Máx. da Política: ${calc.ganhoExtraSobra >= 0 ? '+' : ''}${formatarMoeda(calc.ganhoExtraSobra)}`,
    ].join('\n');
    copiar(texto, 'Resumo interno da clínica copiado!', onToast);
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Coluna esquerda: entradas */}
      <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-stone-200/90 p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-teal-950 font-bold text-base">
            <Wallet className="w-5 h-5 text-teal-700" />
            <h2>Cobrança Real do Paciente</h2>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-stone-500 hover:text-teal-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resetar
          </button>
        </div>

        <MoneyInput
          label="1. Valor de Tabela do Tratamento (R$)"
          value={valorTabela}
          onChange={onValorTabelaChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Operadora</label>
            <select
              value={operadora}
              onChange={(e) => onOperadoraChange(e.target.value as OperadoraId)}
              className="w-full appearance-none px-3 py-2.5 text-sm font-semibold text-stone-800 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-teal-700 cursor-pointer"
            >
              <option value="capim">Capim</option>
              <option value="op2">Outra Operadora (Tab. 2)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Forma / Parcelas
            </label>
            <select
              value={modalidadeId}
              onChange={(e) => onModalidadeChange(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 text-sm font-semibold text-teal-950 bg-teal-50/70 border border-teal-300 rounded-xl focus:outline-none focus:border-teal-700 cursor-pointer"
            >
              {MODALIDADES_PADRAO.map((m) => {
                const map = operadora === 'capim' ? parametros.taxasCapim : parametros.taxasOp2;
                const taxa = map[m.id];
                return (
                  <option key={m.id} value={m.id} disabled={taxa === null || taxa === undefined}>
                    {taxa === null || taxa === undefined
                      ? `${m.nome} — (Indisponível)`
                      : `${m.nome} — ${formatarPercentual(taxa)}`}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50/70 border-2 border-teal-200/90 space-y-3">
          <MoneyInput
            label="2. Valor que o Paciente Vai Pagar (R$)"
            value={valorPago}
            onChange={onValorPagoChange}
            badge={`Mín. Política: ${formatarMoeda(calc.precoMinPolitica)}`}
            large
            accent="strong"
          />
          <div>
            <input
              type="range"
              min={0}
              max={maxSlider}
              step={1}
              value={Math.min(maxSlider, Math.max(0, Math.round(valorPago)))}
              onChange={(e) => onValorPagoChange(parseFloat(e.target.value))}
              className="w-full accent-teal-800 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-500 font-medium mt-0.5">
              <span>R$ 0,00</span>
              <span>Piso: {formatarMoeda(calc.precoMinPolitica)}</span>
              <span>Tabela: {formatarMoeda(valorTabela)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => aplicarPreset('cheio')}
              className="text-[11px] font-semibold py-1.5 px-2 rounded-lg bg-white hover:bg-teal-100 text-stone-700 hover:text-teal-950 border border-stone-200 transition-colors cursor-pointer"
            >
              Sem desc. (0%)
            </button>
            <button
              type="button"
              onClick={() => aplicarPreset('metade')}
              className="text-[11px] font-semibold py-1.5 px-2 rounded-lg bg-white hover:bg-teal-100 text-stone-700 hover:text-teal-950 border border-stone-200 transition-colors cursor-pointer"
            >
              50% do máx.
            </button>
            <button
              type="button"
              onClick={() => aplicarPreset('maximo')}
              className="text-[11px] font-semibold py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
            >
              Desc. máx.
            </button>
            <button
              type="button"
              onClick={() => aplicarPreset('menos50')}
              className="text-[11px] font-semibold py-1.5 px-2 rounded-lg bg-white hover:bg-teal-100 text-stone-700 hover:text-teal-950 border border-stone-200 transition-colors cursor-pointer"
            >
              - R$ 50,00
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[11px] font-semibold text-stone-500 block">Desconto Praticado</span>
            <span
              className={`text-sm font-extrabold block mt-0.5 ${
                calc.descontoReais > 0.009
                  ? 'text-emerald-700'
                  : calc.descontoReais < -0.009
                    ? 'text-teal-900'
                    : 'text-stone-900'
              }`}
            >
              {calc.descontoReais > 0.009
                ? `${formatarMoeda(calc.descontoReais)} (${formatarPercentual(calc.descontoPercent)})`
                : calc.descontoReais < -0.009
                  ? `+${formatarMoeda(Math.abs(calc.descontoReais))} (+${formatarPercentual(Math.abs(calc.descontoPercent))})`
                  : 'R$ 0,00 (0,00%)'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[11px] font-semibold text-stone-500 block">Parcelamento do Paciente</span>
            <span className="text-sm font-extrabold text-teal-950 block mt-0.5">
              {calc.modalidade.parcelas === 1
                ? `À vista (${formatarMoeda(calc.valorPago)})`
                : `${calc.modalidade.parcelas}x de ${formatarMoeda(calc.valorParcela)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Coluna direita: resultados */}
      <div className="lg:col-span-7 space-y-5">
        <AlertaPolitica calc={calc} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/90">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Líquido Pós-Maquininha
            </span>
            <div className="text-2xl font-extrabold text-stone-900 mt-1">{formatarMoeda(calc.liquidoPosMaq)}</div>
            <div className="text-xs text-rose-600 font-semibold mt-1">
              Taxa {formatarPercentual(calc.taxaPercent)}: - {formatarMoeda(calc.taxaMaqReais)}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/90">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              IR ({formatarPercentual(parametros.irPercent)}) + Repasse ({formatarPercentual(parametros.repassePercent)})
            </span>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">- {formatarMoeda(totalDeducoes)}</div>
            <div className="text-xs text-stone-500 font-medium mt-1">
              IR {formatarMoeda(calc.irReais)} • Rep. {formatarMoeda(calc.repasseReais)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-teal-900 text-white rounded-2xl p-4 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 block">
              Entra Líquido p/ Clínica
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">{formatarMoeda(calc.sobraClinica)}</div>
            <div className="text-xs text-emerald-100 font-semibold mt-1">
              {formatarPercentual(calc.margemSobreCobrado)} cobrado • {formatarPercentual(calc.margemSobreTabela)} tabela
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-teal-700" />
                Extrato Detalhado da Cobrança Real
              </h3>
              <p className="text-xs text-stone-500">
                Cálculo exato sobre o valor pago pelo paciente e alíquotas vigentes
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resumoGerencial}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Copiar Resumo Interno</span>
              </button>
              <button
                type="button"
                onClick={resumoPaciente}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-950 hover:bg-teal-900 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar p/ Paciente</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-stone-100 text-sm">
            <div className="py-2.5 flex items-center justify-between">
              <span className="font-semibold text-stone-700">(+) Valor Final Cobrado ao Paciente</span>
              <span className="font-extrabold text-stone-950">{formatarMoeda(calc.valorPago)}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-rose-700 font-medium">
                (-) Taxa da Maquininha ({formatarPercentual(calc.taxaPercent)})
              </span>
              <span className="font-bold text-rose-700">- {formatarMoeda(calc.taxaMaqReais)}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between bg-teal-50/50 px-2.5 -mx-2.5 rounded-lg">
              <span className="font-bold text-teal-950">(=) Líquido Recebido Pós-Maquininha</span>
              <span className="font-extrabold text-teal-950">{formatarMoeda(calc.liquidoPosMaq)}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-amber-800 font-medium">
                (-) Imposto de Renda / Tributos ({formatarPercentual(parametros.irPercent)})
              </span>
              <span className="font-bold text-amber-800">- {formatarMoeda(calc.irReais)}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-sky-800 font-medium">
                (-) Repasse Profissional Executor ({formatarPercentual(parametros.repassePercent)})
              </span>
              <span className="font-bold text-sky-900">- {formatarMoeda(calc.repasseReais)}</span>
            </div>
            <div className="py-3 flex items-center justify-between bg-emerald-50 px-3 -mx-3 rounded-xl border border-emerald-200 mt-1">
              <div>
                <span className="font-extrabold text-emerald-950 block">(=) Sobra Líquida Final da Clínica</span>
                <span className="text-xs font-semibold text-emerald-700">
                  Margem de {formatarPercentual(calc.margemSobreCobrado)} sobre o valor cobrado •{' '}
                  {formatarPercentual(calc.margemSobreTabela)} sobre a tabela
                </span>
              </div>
              <span className="text-lg font-extrabold text-emerald-800">{formatarMoeda(calc.sobraClinica)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-5">
          <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2 mb-3">
            <GitCompare className="w-4 h-4 text-teal-700" />
            Comparativo: Cobrança Real vs. Limite Máximo de Desconto
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-950 uppercase text-xs tracking-wider">Cenário Praticado (Real)</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                  {formatarPercentual(Math.max(0, calc.descontoPercent))} desc.
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-stone-600">Valor ao paciente:</span>
                <span className="font-bold text-stone-900">{formatarMoeda(calc.valorPago)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Líquido pós-maq.:</span>
                <span className="font-semibold text-stone-800">{formatarMoeda(calc.liquidoPosMaq)}</span>
              </div>
              <div className="flex justify-between border-t border-teal-200/80 pt-2">
                <span className="font-bold text-emerald-900">Sobra líquida clínica:</span>
                <span className="font-extrabold text-emerald-700">{formatarMoeda(calc.sobraClinica)}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-700 uppercase text-xs tracking-wider">
                  No Limite Máx. da Política
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                  {formatarPercentual(calc.descMaxPoliticaPct)} desc.
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-stone-600">Preço mínimo política:</span>
                <span className="font-bold text-stone-900">{formatarMoeda(calc.precoMinPolitica)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Líquido pós-maq.:</span>
                <span className="font-semibold text-stone-800">{formatarMoeda(calc.liqMaxPolitica)}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2">
                <span className="font-bold text-stone-800">Sobra líquida clínica:</span>
                <span className="font-extrabold text-stone-900">{formatarMoeda(calc.sobraMaxPolitica)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SimuladorReal;
