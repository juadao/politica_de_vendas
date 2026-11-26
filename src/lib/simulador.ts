export type OperadoraId = 'capim' | 'op2';

export interface Modalidade {
  id: string;
  nome: string;
  parcelas: number;
}

export interface TaxaMap {
  [modalidadeId: string]: number | null;
}

export interface LinhaModalidade {
  modalidade: Modalidade;
  disponivel: boolean;
  taxaPercent: number;
  descontoPercent: number;
  descontoReais: number;
  precoMinimo: number;
  valorParcela: number;
  liquidoPosMaq: number;
  taxaMaqReais: number;
  irReais: number;
  repasseReais: number;
  sobraClinica: number;
  margemSobreCobrado: number;
  margemSobreTabela: number;
}

export interface Parametros {
  irPercent: number;
  repassePercent: number;
  tetoAVistaPercent: number;
  travaParcelaCapim: number;
  taxasCapim: TaxaMap;
  taxasOp2: TaxaMap;
}

export const MODALIDADES_PADRAO: Modalidade[] = [
  { id: 'avista', nome: 'Débito / PIX (à vista)', parcelas: 1 },
  { id: 'credito_1x', nome: 'Crédito 1x', parcelas: 1 },
  { id: 'credito_2x', nome: 'Crédito 2x sem juros', parcelas: 2 },
  { id: 'credito_3x', nome: 'Crédito 3x sem juros', parcelas: 3 },
  { id: 'credito_4x', nome: 'Crédito 4x sem juros', parcelas: 4 },
  { id: 'credito_5x', nome: 'Crédito 5x sem juros', parcelas: 5 },
  { id: 'credito_6x', nome: 'Crédito 6x sem juros', parcelas: 6 },
  { id: 'credito_7x', nome: 'Crédito 7x sem juros', parcelas: 7 },
  { id: 'credito_8x', nome: 'Crédito 8x sem juros', parcelas: 8 },
  { id: 'credito_9x', nome: 'Crédito 9x sem juros', parcelas: 9 },
  { id: 'credito_10x', nome: 'Crédito 10x sem juros', parcelas: 10 },
  { id: 'credito_11x', nome: 'Crédito 11x sem juros', parcelas: 11 },
  { id: 'credito_12x', nome: 'Crédito 12x sem juros', parcelas: 12 },
];

export const TAXAS_PADRAO_CAPIM: TaxaMap = {
  avista: 2.49,
  credito_1x: 4.98,
  credito_2x: 6.38,
  credito_3x: 7.38,
  credito_4x: 8.08,
  credito_5x: 8.68,
  credito_6x: 9.18,
  credito_7x: 9.58,
  credito_8x: 9.93,
  credito_9x: 10.23,
  credito_10x: 10.48,
  credito_11x: 10.71,
  credito_12x: 10.91,
};

export const TAXAS_PADRAO_OP2: TaxaMap = {
  avista: 1.99,
  credito_1x: 3.99,
  credito_2x: 4.99,
  credito_3x: 5.69,
  credito_4x: 6.19,
  credito_5x: 6.59,
  credito_6x: 6.89,
  credito_7x: 7.14,
  credito_8x: 7.34,
  credito_9x: 7.52,
  credito_10x: 7.67,
  credito_11x: 7.80,
  credito_12x: 7.91,
};

export const PARAMETROS_PADRAO: Parametros = {
  irPercent: 17.0,
  repassePercent: 20.0,
  tetoAVistaPercent: 15.0,
  travaParcelaCapim: 12,
  taxasCapim: { ...TAXAS_PADRAO_CAPIM },
  taxasOp2: { ...TAXAS_PADRAO_OP2 },
};

const DEDUCAO_DECIMAL = 1; // IR + repasse incidem sobre o valor bruto, em paralelo

export function taxaDaModalidade(
  modalidadeId: string,
  operadora: OperadoraId,
  parametros: Parametros
): number | null {
  const map = operadora === 'capim' ? parametros.taxasCapim : parametros.taxasOp2;
  const taxa = map[modalidadeId];
  return taxa === undefined ? null : taxa;
}

/**
 * Política de desconto: o desconto máximo de cada modalidade é aquele que
 * deixa a clínica com a mesma sobra líquida de uma venda à vista com o
 * desconto-teto (ex.: 15%).
 *
 * Sobra(P) = P·(1 - t) - P·(ir + repasse), com P = V·(1 - d)
 * Igualando à sobra do à vista com desconto-teto e isolando d:
 * d = 1 - (1 - tAv)·(1 - tAvista - ir - repasse) / (1 - t - ir - repasse)
 */
export function calcularLinhaModalidade(
  modalidade: Modalidade,
  valorTabela: number,
  operadora: OperadoraId,
  parametros: Parametros
): LinhaModalidade {
  const taxaPercent = taxaDaModalidade(modalidade.id, operadora, parametros);
  const irDec = parametros.irPercent / 100;
  const repasseDec = parametros.repassePercent / 100;
  const k = 1 - irDec - repasseDec;

  const tAvista = taxaDaModalidade('avista', operadora, parametros) ?? 0;
  const tDec = (taxaPercent ?? 0) / 100;
  const tAvDec = tAvista / 100;
  const tetoDec = parametros.tetoAVistaPercent / 100;

  const disponivel = taxaPercent !== null;
  const descontoPercent = disponivel
    ? Math.min(
        100,
        Math.max(
          0,
          (1 - ((1 - tetoDec) * (1 - tAvDec - irDec - repasseDec)) / (1 - tDec - irDec - repasseDec)) * 100
        )
      )
    : 0;

  const precoMinimo = valorTabela * (1 - descontoPercent / 100);
  const valorParcela = modalidade.parcelas > 0 ? precoMinimo / modalidade.parcelas : precoMinimo;

  const taxaMaqReais = precoMinimo * tDec;
  const liquidoPosMaq = precoMinimo - taxaMaqReais;
  const irReais = precoMinimo * irDec;
  const repasseReais = precoMinimo * repasseDec;
  const sobraClinica = liquidoPosMaq - irReais - repasseReais;

  const margemSobreCobrado = precoMinimo > 0 ? (sobraClinica / precoMinimo) * 100 : 0;
  const margemSobreTabela = valorTabela > 0 ? (sobraClinica / valorTabela) * 100 : 0;

  return {
    modalidade,
    disponivel,
    taxaPercent: taxaPercent ?? 0,
    descontoPercent,
    descontoReais: valorTabela - precoMinimo,
    precoMinimo,
    valorParcela,
    liquidoPosMaq,
    taxaMaqReais,
    irReais,
    repasseReais,
    sobraClinica,
    margemSobreCobrado,
    margemSobreTabela,
  };
}

export function calcularTodasModalidades(
  valorTabela: number,
  operadora: OperadoraId,
  parametros: Parametros
): LinhaModalidade[] {
  return MODALIDADES_PADRAO.map((m) => calcularLinhaModalidade(m, valorTabela, operadora, parametros));
}

export interface CalculoReal {
  modalidade: Modalidade;
  valorTabela: number;
  valorPago: number;
  taxaPercent: number;
  taxaMaqReais: number;
  liquidoPosMaq: number;
  irReais: number;
  repasseReais: number;
  sobraClinica: number;
  descontoReais: number;
  descontoPercent: number;
  valorParcela: number;
  margemSobreCobrado: number;
  margemSobreTabela: number;
  precoMinPolitica: number;
  sobraMaxPolitica: number;
  liqMaxPolitica: number;
  descMaxPoliticaPct: number;
  ganhoExtraSobra: number;
  statusPolitica: 'abaixo_piso' | 'acima_tabela' | 'dentro';
}

export function calcularCobrancaReal(
  valorTabela: number,
  valorPago: number,
  modalidade: Modalidade,
  operadora: OperadoraId,
  parametros: Parametros
): CalculoReal {
  const ref = calcularLinhaModalidade(modalidade, valorTabela, operadora, parametros);
  const taxaPercent = ref.taxaPercent;
  const taxaDec = taxaPercent / 100;
  const irDec = parametros.irPercent / 100;
  const repasseDec = parametros.repassePercent / 100;

  const pago = Math.max(0, valorPago);
  const taxaMaqReais = pago * taxaDec;
  const liquidoPosMaq = pago - taxaMaqReais;
  const irReais = pago * irDec;
  const repasseReais = pago * repasseDec;
  const sobraClinica = liquidoPosMaq - irReais - repasseReais;

  const descontoReais = valorTabela - pago;
  const descontoPercent = valorTabela > 0 ? (descontoReais / valorTabela) * 100 : 0;
  const valorParcela = modalidade.parcelas > 0 ? pago / modalidade.parcelas : pago;

  const margemSobreCobrado = pago > 0 ? (sobraClinica / pago) * 100 : 0;
  const margemSobreTabela = valorTabela > 0 ? (sobraClinica / valorTabela) * 100 : 0;

  const precoMinPolitica = ref.disponivel ? ref.precoMinimo : valorTabela;
  const sobraMaxPolitica = ref.disponivel ? ref.sobraClinica : sobraClinica;
  const liqMaxPolitica = ref.disponivel ? ref.liquidoPosMaq : liquidoPosMaq;
  const descMaxPoliticaPct = ref.disponivel ? ref.descontoPercent : 0;

  const ganhoExtraSobra = sobraClinica - sobraMaxPolitica;

  const statusPolitica: CalculoReal['statusPolitica'] =
    pago < precoMinPolitica - 0.01
      ? 'abaixo_piso'
      : pago > valorTabela + 0.01
        ? 'acima_tabela'
        : 'dentro';

  return {
    modalidade,
    valorTabela,
    valorPago: pago,
    taxaPercent,
    taxaMaqReais,
    liquidoPosMaq,
    irReais,
    repasseReais,
    sobraClinica,
    descontoReais,
    descontoPercent,
    valorParcela,
    margemSobreCobrado,
    margemSobreTabela,
    precoMinPolitica,
    sobraMaxPolitica,
    liqMaxPolitica,
    descMaxPoliticaPct,
    ganhoExtraSobra,
    statusPolitica,
  };
}

// ----------------- Formatação -----------------

const fmtNum = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatarMoeda(valor: number): string {
  return `R$ ${fmtNum.format(valor)}`;
}

export function formatarPercentual(valor: number): string {
  return `${fmtNum.format(valor)}%`;
}

export function parseMoedaInput(bruto: string): number {
  const limpo = bruto.replace(/[^\d,]/g, '');
  if (!limpo) return 0;
  const numero = parseFloat(limpo.replace(',', '.'));
  return Number.isNaN(numero) ? 0 : numero;
}
