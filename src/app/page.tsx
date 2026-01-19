import { Suspense } from 'react';
import { getExchangeInfoWithTiming } from '@/services/binance.service';
import { ResponseTime } from './components/ResponseTime/ResponseTime';
import { SymbolSelect } from './components/SymbolSelect';

async function DataFetcher() {
  const { data: exchangeInfo, responseTime } = await getExchangeInfoWithTiming();

  return (
    <>
      <ResponseTime responseTime={responseTime} />
      <SymbolSelect
        symbols={exchangeInfo.symbols}
        placeholder={`Buscá un símbolo (${exchangeInfo.symbols.length} disponibles)`}
      />
    </>
  );
}

export default async function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center justify-start py-12 px-6 bg-white dark:bg-black">
        <div className="w-full space-y-6">
          {/* Título fuera del Suspense para LCP rápido */}
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Orderbook Viewer
          </h1>
          <h3 className="text-md  text-zinc-900 dark:text-white">
            Esta herramienta te permite ver el order book de un símbolo (crypto currency) en tiempo real.
          </h3>
          <Suspense fallback={<SymbolSelect loading />}>
            <DataFetcher />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
