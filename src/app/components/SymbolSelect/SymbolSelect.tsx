"use client";

import { useState, useTransition, useRef } from 'react';
import { Skeleton } from "@heroui/skeleton";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tabs, Tab, Select, SelectItem } from "@heroui/react";
import { SelectComponent } from '../Select';
import { RegresiveCount, type RegresiveCountRef } from '../RegresiveCount';
import { SpreadIndicator } from '../SpreadIndicator';
import type { Symbol as BinanceSymbol } from '@/types/Symbols';
import type { BidsAsks } from '@/types/bidsAsks';
import { fetchOrderBook } from '@/app/actions/binanceActions';

const LIMIT_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
import { ResponseTime } from '../ResponseTime/ResponseTime';

interface SymbolSelectProps {
  symbols?: BinanceSymbol[];
  label?: string;
  placeholder?: string;
  className?: string;
  loading?: boolean;
}

/**
 * Select específico para símbolos de Binance con loading integrado
 * Llama a Server Actions para obtener el order book manteniendo SSR
 */
export function SymbolSelect({
  symbols,
  label = "Seleccionar símbolo",
  placeholder = "Elegí un símbolo",
  loading = false,
}: SymbolSelectProps) {
  const [orderBook, setOrderBook] = useState<BidsAsks | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("bids");
  const [limit, setLimit] = useState<number>(10);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const countdownRef = useRef<RegresiveCountRef>(null);

  const fetchData = async (symbolKey: string, currentLimit?: number, isRefresh = false) => {
    // Marcar como refetching si no es la carga inicial
    if (isRefresh && !isInitialLoad) {
      setIsRefetching(true);
    }

    startTransition(async () => {
      const result = await fetchOrderBook(symbolKey, currentLimit ?? limit);

      if (result.success && result.data) {
        setOrderBook(result.data);
        setResponseTime(result.responseTime || 0);
        console.log(`Order book de ${symbolKey}:`, result.data);
        console.log(`Tiempo de respuesta: ${result.responseTime}ms`);

        // Marcar que ya no es la carga inicial
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } else {
        console.error('Error al obtener order book:', result.error);
      }

      // Quitar el estado de refetching
      setIsRefetching(false);
    });
  };

  const handleSelectionChange = async (symbolKey: string) => {
    setSelectedSymbol(symbolKey);
    setIsInitialLoad(true); // Nueva selección = carga inicial
    await fetchData(symbolKey, undefined, false);
    // Reset countdown al seleccionar nuevo símbolo
    countdownRef.current?.reset();
  };

  const handleRefresh = async () => {
    if (selectedSymbol) {
      await fetchData(selectedSymbol, undefined, true);
    }
  };

  if (loading || !symbols) {
    return (
      <Skeleton className="w-[38%] h-10 rounded-xl">
        <div />
      </Skeleton>
    );
  }
  return (
    <div className="space-y-4">
      <div className="w-full max-w-xs">
        <SelectComponent
          data={symbols}
          keyProperty="symbol"
          primaryTextKey="symbol"
          secondaryTextKey="baseAsset"
          label={label}
          placeholder={placeholder}
          className="w-full"
          onSelectionChange={(key) => handleSelectionChange(key as string)}
        />

      </div>
      {isPending && isInitialLoad && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Cargando order book...
        </div>
      )}

      {orderBook && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Order Book
              </h3>
              {isRefetching && (
                <span className="text-xs text-blue-500 dark:text-blue-400 animate-pulse">
                  Actualizando...
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <RegresiveCount
                ref={countdownRef}
                onFinish={handleRefresh}
                duration={3}
                loadingLabel={`Actualizando ${activeTab === 'bids' ? 'Bids' : 'Asks'}...`}
              />
              {responseTime && (
                <ResponseTime responseTime={responseTime} />
              )}
            </div>
          </div>
          <div className="w-full max-w-xs">
            <Select
              label="Cantidad de órdenes"
              labelPlacement="outside"
              placeholder="Seleccionar límite"
              selectedKeys={new Set([String(limit)])}
              onSelectionChange={(keys) => {
                const newLimit = Number(Array.from(keys)[0]);
                setLimit(newLimit);
                if (selectedSymbol) {
                  fetchData(selectedSymbol, newLimit, true);
                  countdownRef.current?.reset();
                }
              }}
              onOpenChange={(isOpen) => {
                if (isOpen) {
                  countdownRef.current?.pause();
                } else {
                  countdownRef.current?.resume();
                }
              }}
              isDisabled={(isPending && isInitialLoad) || !selectedSymbol}
              className="w-full"
              size="sm"
              disallowEmptySelection
            >
              {LIMIT_OPTIONS.map((value) => (
                <SelectItem key={String(value)} textValue={`${value} órdenes`}>
                  {value} órdenes
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex gap-4 w-full justify-between items-center h-full">
            <div className="w-full">
              <Tabs
                aria-label="Order book tabs"
                color="primary"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                classNames={{
                  cursor: "bg-primary",
                  tabContent: "group-data-[selected=true]:text-white"
                }}
              >
                <Tab
                  key="bids"
                  title={
                    <span className="font-semibold text-green-600 group-data-[selected=true]:text-white dark:text-green-400">
                      Bids (Compra)
                    </span>
                  }
                >
                  <Table
                    aria-label="Tabla de bids"
                    className="min-w-full"
                  >
                    <TableHeader>
                      <TableColumn>#</TableColumn>
                      <TableColumn>PRECIO</TableColumn>
                      <TableColumn>CANTIDAD</TableColumn>
                      <TableColumn>ULT. ACTUALIZACIÓN</TableColumn>

                    </TableHeader>
                    <TableBody>
                      {orderBook.bids.map((bid, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-zinc-600 dark:text-zinc-400 font-mono">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="text-green-600 dark:text-green-400 font-mono">
                            {bid[0]}
                          </TableCell>
                          <TableCell className="text-zinc-600 dark:text-zinc-400 font-mono">
                            {bid[1]}
                          </TableCell>
                          <TableCell className="text-zinc-600 dark:text-zinc-400 font-mono">
                            {orderBook.lastUpdateId}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Tab>

                <Tab
                  key="asks"
                  title={
                    <span className="font-semibold text-red-600 group-data-[selected=true]:text-white dark:text-red-400">
                      Asks (Venta)
                    </span>
                  }
                >
                  <Table
                    aria-label="Tabla de asks"
                    className="min-w-full"
                  >
                    <TableHeader>
                      <TableColumn>PRECIO</TableColumn>
                      <TableColumn>CANTIDAD</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {orderBook.asks.map((ask, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-red-600 dark:text-red-400 font-mono">
                            {ask[0]}
                          </TableCell>
                          <TableCell className="text-zinc-600 dark:text-zinc-400 font-mono">
                            {ask[1]}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Tab>
              </Tabs>
            </div>
          </div>
          <div className="h-full">
            <SpreadIndicator orderBook={orderBook} />
          </div>
        </div>
      )}
    </div>
  );
}
