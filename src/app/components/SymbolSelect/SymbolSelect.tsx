"use client";

import { useState, useTransition } from 'react';
import { Skeleton } from "@heroui/skeleton";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tabs, Tab } from "@heroui/react";
import { SelectComponent } from '../Select';
import type { Symbol as BinanceSymbol } from '@/types/Symbols';
import type { BidsAsks } from '@/types/bidsAsks';
import { fetchOrderBook } from '@/app/actions/binanceActions';

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
  className,
  loading = false,
}: SymbolSelectProps) {
  const [orderBook, setOrderBook] = useState<BidsAsks | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelectionChange = async (symbolKey: string) => {
    startTransition(async () => {
      const result = await fetchOrderBook(symbolKey, 10);

      if (result.success && result.data) {
        setOrderBook(result.data);
        setResponseTime(result.responseTime || 0);
        console.log(`Order book de ${symbolKey}:`, result.data);
        console.log(`Tiempo de respuesta: ${result.responseTime}ms`);
      } else {
        console.error('Error al obtener order book:', result.error);
      }
    });
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
      <SelectComponent
        data={symbols}
        keyProperty="symbol"
        primaryTextKey="symbol"
        secondaryTextKey="baseAsset"
        label={label}
        placeholder={placeholder}
        className={className}
        onSelectionChange={(key) => handleSelectionChange(key as string)}
      />

      {isPending && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Cargando order book...
        </div>
      )}

      {orderBook && !isPending && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Order Book
            </h3>
            {responseTime && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {responseTime}ms
              </span>
            )}
          </div>

          <Tabs
            aria-label="Order book tabs"
            color="primary"
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
                  <TableColumn>PRECIO</TableColumn>
                  <TableColumn>CANTIDAD</TableColumn>
                </TableHeader>
                <TableBody>
                  {orderBook.bids.map((bid, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-green-600 dark:text-green-400 font-mono">
                        {parseFloat(bid[0]).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400 font-mono">
                        {parseFloat(bid[1]).toFixed(6)}
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
                        {parseFloat(ask[0]).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400 font-mono">
                        {parseFloat(ask[1]).toFixed(6)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Tab>
          </Tabs>
        </div>
      )}
    </div>
  );
}
