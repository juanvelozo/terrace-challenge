"use client";

import { useMemo } from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import type { BidsAsks } from '@/types/bidsAsks';

interface SpreadIndicatorProps {
  orderBook: BidsAsks;
}

export function SpreadIndicator({ orderBook }: SpreadIndicatorProps) {
  const spreadData = useMemo(() => {
    if (!orderBook.bids.length || !orderBook.asks.length) {
      return null;
    }

    const bestBid = parseFloat(orderBook.bids[0][0]);
    const bestAsk = parseFloat(orderBook.asks[0][0]);

    const spreadAbsolute = bestAsk - bestBid;
    const spreadPercent = (spreadAbsolute / bestAsk) * 100;
    const midPrice = (bestBid + bestAsk) / 2;

    // Determinar color basado en el spread %
    let color: "success" | "warning" | "danger" = "success";
    let liquidityLabel = "Alta liquidez";

    if (spreadPercent > 0.5) {
      color = "danger";
      liquidityLabel = "Baja liquidez";
    } else if (spreadPercent > 0.1) {
      color = "warning";
      liquidityLabel = "Liquidez media";
    }

    return {
      bestBid,
      bestAsk,
      spreadAbsolute,
      spreadPercent,
      midPrice,
      color,
      liquidityLabel,
    };
  }, [orderBook]);

  if (!spreadData) {
    return null;
  }

  return (
    <Card className="h-full!">
      <CardBody className="gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Spread Indicator
          </h4>
          <Chip
            color={spreadData.color}
            size="sm"
            variant="flat"
          >
            {spreadData.liquidityLabel}
          </Chip>
        </div>

        <div className="space-y-3">
          {/* Spread Absoluto */}
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Spread</p>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white font-mono">
              {spreadData.spreadAbsolute}
            </p>
          </div>

          {/* Spread Porcentaje */}
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Spread %</p>
            <p className={`mt-1 text-xl font-bold font-mono ${spreadData.color === 'success' ? 'text-green-600 dark:text-green-400' :
              spreadData.color === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
              {spreadData.spreadPercent}%
            </p>
          </div>

          {/* Mid Price */}
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Precio Medio</p>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white font-mono">
              {spreadData.midPrice}
            </p>
          </div>

          {/* Detalles adicionales */}
          <div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Mejor Bid:</span>
              <span className="font-mono text-green-600 dark:text-green-400">
                {spreadData.bestBid}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Mejor Ask:</span>
              <span className="font-mono text-red-600 dark:text-red-400">
                {spreadData.bestAsk}
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
