import { Suspense } from 'react';
import { getExchangeInfoWithTiming } from '@/services/binance.service';
import { ResponseTime } from './components/ResponseTime/ResponseTime';
import { SymbolSelect } from './components/SymbolSelect';

async function SymbolSelectWithData() {
  const { data: exchangeInfo, responseTime } = await getExchangeInfoWithTiming();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Elegí un symbol
        </h1>
        <ResponseTime responseTime={responseTime} />
      </div>

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
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-start py-12 px-6 bg-white dark:bg-black">
        <div className="w-full space-y-6">
          <Suspense
            fallback={
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                    Cargando...
                  </h1>
                </div>
                <SymbolSelect loading />
              </>
            }
          >
            <SymbolSelectWithData />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
