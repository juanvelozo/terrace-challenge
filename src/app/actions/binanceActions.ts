"use server";

import { getOrderBookWithTiming } from '@/services/binance.service';

/**
 * Server Action para obtener el order book de un símbolo
 * Se puede llamar desde Client Components manteniendo la lógica en el servidor
 */
export async function fetchOrderBook(symbol: string, limit: number = 10) {
  try {
    const result = await getOrderBookWithTiming(symbol, limit);
    return {
      success: true,
      data: result.data,
      responseTime: result.responseTime,
    };
  } catch (error) {
    console.error('Error en fetchOrderBook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
