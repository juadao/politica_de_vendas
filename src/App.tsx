import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Header, { type TabId } from '@/components/Header';
import SimuladorBalcao from '@/components/SimuladorBalcao';
import SimuladorReal from '@/components/SimuladorReal';
import TaxasParametros from '@/components/TaxasParametros';
import type { OperadoraId, Parametros } from '@/lib/simulador';
import { PARAMETROS_PADRAO } from '@/lib/simulador';

interface ToastState {
  msg: string;
  visible: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('simulador');

  // Aba Balcão
  const [valorTabela, setValorTabela] = useState(1000.0);
  const [operadora, setOperadora] = useState<OperadoraId>('capim');

  // Aba Simulador Real
  const [realValorTabela, setRealValorTabela] = useState(1000.0);
  const [realValorPago, setRealValorPago] = useState(950.0);
  const [realOperadora, setRealOperadora] = useState<OperadoraId>('capim');
  const [realModalidadeId, setRealModalidadeId] = useState('credito_10x');

  // Aba Taxas e Parâmetros
  const [parametros, setParametros] = useState<Parametros>(() => structuredClone(PARAMETROS_PADRAO));

  const [toast, setToast] = useState<ToastState>({ msg: '', visible: false });

  const mostrarToast = (msg: string) => {
    setToast({ msg, visible: true });
    window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const resetBalcao = () => {
    setValorTabela(1000.0);
    setOperadora('capim');
  };

  const resetReal = () => {
    setRealValorTabela(1000.0);
    setRealValorPago(950.0);
    setRealOperadora('capim');
    setRealModalidadeId('credito_10x');
    mostrarToast('Simulador Real restaurado para R$ 1.000,00 de tabela e R$ 950,00 cobrados.');
  };

  const resetParametros = () => {
    setParametros(structuredClone(PARAMETROS_PADRAO));
    mostrarToast('Taxas e parâmetros restaurados para o padrão da política.');
  };

  const aplicarOperadoraBalcao = (op: OperadoraId) => {
    setOperadora(op);
    mostrarToast(op === 'capim' ? 'Usando as taxas da operadora Capim.' : 'Usando as taxas da Outra Operadora (Tab. 2).');
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'simulador' && (
          <SimuladorBalcao
            valorTabela={valorTabela}
            onValorTabelaChange={setValorTabela}
            operadora={operadora}
            onOperadoraChange={aplicarOperadoraBalcao}
            parametros={parametros}
            onReset={resetBalcao}
          />
        )}
        {activeTab === 'real' && (
          <SimuladorReal
            valorTabela={realValorTabela}
            valorPago={realValorPago}
            operadora={realOperadora}
            modalidadeId={realModalidadeId}
            parametros={parametros}
            onValorTabelaChange={setRealValorTabela}
            onValorPagoChange={setRealValorPago}
            onOperadoraChange={setRealOperadora}
            onModalidadeChange={setRealModalidadeId}
            onReset={resetReal}
            onToast={mostrarToast}
          />
        )}
        {activeTab === 'parametros' && (
          <TaxasParametros parametros={parametros} onChange={setParametros} onReset={resetParametros} />
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-[11px] text-stone-400 text-center">
          Simulador de Política de Vendas — os descontos máximos equiparam a sobra líquida da clínica à de uma venda à
          vista com desconto-teto. Valores calculados em tempo real, sem armazenamento de dados.
        </p>
      </footer>

      <div
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-950 text-white text-sm font-semibold shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast.msg}
        </div>
      </div>
    </div>
  );
}
