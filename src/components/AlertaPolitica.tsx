import { AlertTriangle, ArrowDown, ShieldCheck, TrendingUp } from 'lucide-react';
import type { CalculoReal } from '@/lib/simulador';
import { formatarMoeda, formatarPercentual } from '@/lib/simulador';

interface AlertaPoliticaProps {
  calc: CalculoReal;
}

export function AlertaPolitica({ calc }: AlertaPoliticaProps) {
  const { statusPolitica, valorPago, precoMinPolitica, ganhoExtraSobra, descontoPercent, descMaxPoliticaPct, sobraClinica } =
    calc;

  if (statusPolitica === 'abaixo_piso') {
    return (
      <div className="rounded-2xl p-4 border-2 bg-rose-50 border-rose-300 text-rose-950 transition-all">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-rose-600 text-white">
                Atenção • Desconto Acima do Limite
              </span>
              <span className="text-xs font-bold text-rose-700">
                {formatarMoeda(precoMinPolitica - valorPago)} abaixo do piso da política
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium mt-1.5 leading-relaxed">
              O valor de <strong>{formatarMoeda(valorPago)}</strong> está abaixo do mínimo recomendado pela política (
              <strong>{formatarMoeda(precoMinPolitica)}</strong>). A sobra da clínica fica{' '}
              <strong>{formatarMoeda(Math.abs(ganhoExtraSobra))}</strong> menor que o piso de referência.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (statusPolitica === 'acima_tabela') {
    return (
      <div className="rounded-2xl p-4 border-2 bg-teal-50 border-teal-300 text-teal-950 transition-all">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-700 text-white">
                Cobrança Acima da Tabela
              </span>
              <span className="text-xs font-bold text-teal-800">
                + {formatarMoeda(ganhoExtraSobra)} de sobra extra vs. piso
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium mt-1.5 leading-relaxed">
              Valor cobrado acima do preço de tabela (
              <strong>+{formatarMoeda(valorPago - calc.valorTabela)}</strong>). A clínica amplia a sobra líquida para{' '}
              <strong>{formatarMoeda(sobraClinica)}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const noLimite = ganhoExtraSobra <= 0.01;
  return (
    <div className="rounded-2xl p-4 border-2 bg-emerald-50/90 border-emerald-300 text-emerald-950 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          {noLimite ? <ArrowDown className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-600 text-white">
              {noLimite ? 'Dentro da Política • No Limite Máximo' : 'Dentro da Política • Ganho Extra Preservado'}
            </span>
            <span className="text-xs font-bold text-emerald-800">
              {noLimite
                ? 'No piso mínimo da política'
                : `+ ${formatarMoeda(ganhoExtraSobra)} a mais para a clínica vs. desc. máx.`}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium mt-1.5 leading-relaxed">
            {noLimite ? (
              <>
                Valor alinhado ao limite máximo de desconto autorizado para esta modalidade (
                <strong>{formatarMoeda(precoMinPolitica)}</strong>).
              </>
            ) : (
              <>
                Como você está usando apenas <strong>{formatarPercentual(Math.max(0, descontoPercent))}</strong> de
                desconto (limite de {formatarPercentual(descMaxPoliticaPct)}), a clínica retém{' '}
                <strong>{formatarMoeda(ganhoExtraSobra)} a mais</strong> de sobra líquida.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AlertaPolitica;
