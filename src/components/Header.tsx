import { Store, Wallet, SlidersHorizontal } from 'lucide-react';

export type TabId = 'simulador' | 'real' | 'parametros';

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: typeof Store }[] = [
  { id: 'simulador', label: 'Simulador de Balcão', icon: Store },
  { id: 'real', label: 'Simulador Real', icon: Wallet },
  { id: 'parametros', label: 'Taxas e Parâmetros', icon: SlidersHorizontal },
];

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-gradient-to-br from-teal-950 via-teal-900 to-stone-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-400/30 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight leading-tight">Simulador de Política de Vendas</h1>
            <p className="text-xs text-teal-200/80 font-medium">
              Descontos, parcelamento e sobra líquida da clínica em tempo real
            </p>
          </div>
        </div>
        <nav
          className="flex flex-wrap bg-teal-950/80 p-1 rounded-xl border border-teal-800/80 self-start md:self-auto gap-1"
          aria-label="Abas do sistema"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const ativo = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                  ativo
                    ? 'font-semibold bg-teal-600 text-white shadow-sm'
                    : 'font-medium text-teal-200 hover:text-white hover:bg-teal-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default Header;
