/**
 * Servicio para consumir la API de Binance
 * Optimizado para manejar respuestas pesadas con ISR y cache
 */

import { ApiClient } from '@/lib/apiClient';
import type { Symbols, Symbol as BinanceSymbol } from '@/types/Symbols';
import type { BidsAsks } from '@/types/bidsAsks';

// Cliente específico para Binance con headers requeridos
const binanceClient = new ApiClient('https://api.binance.com/api/v3', {
  'Accept': 'application/json',
});

/**
 * Obtiene la información completa del exchange
 * Optimizado con ISR - revalidación cada 6 horas
 * La información del exchange no cambia frecuentemente
 */
export async function getExchangeInfo(): Promise<Symbols> {
  try {
    const response = await binanceClient.get<Symbols>('/exchangeInfo', {
      // Deshabilitar cache de Next.js temporalmente para debugging
      cache: 'no-store',
    });

    return response.data;
  } catch (error) {
    console.error('Error al obtener información del exchange:', error);
    throw error;
  }
}

/**
 * Obtiene la información del exchange con tiempo de respuesta
 */
export async function getExchangeInfoWithTiming(): Promise<{
  data: Symbols;
  responseTime: number;
}> {
  const startTime = Date.now();
  const data = await getExchangeInfo();
  const endTime = Date.now();
  const responseTime = endTime - startTime;

  return {
    data,
    responseTime,
  };
}

/**
 * Obtiene símbolos filtrados para optimizar el payload
 * Solo retorna símbolos activos de spot trading
 */
export async function getActiveSpotSymbols(): Promise<BinanceSymbol[]> {
  try {
    const exchangeInfo = await getExchangeInfo();

    // Filtrar solo símbolos activos y con spot trading habilitado
    const activeSymbols = exchangeInfo.symbols.filter(
      symbol =>
        symbol.status === 'TRADING' &&
        symbol.isSpotTradingAllowed
    );

    return activeSymbols;
  } catch (error) {
    console.error('Error al obtener símbolos activos:', error);
    throw error;
  }
}

/**
 * Obtiene información básica del exchange (sin todos los símbolos)
 * Útil cuando solo necesitas metadata básica
 */
export async function getExchangeBasicInfo(): Promise<{
  timezone: string;
  serverTime: number;
  totalSymbols: number;
  activeSymbols: number;
}> {
  try {
    const exchangeInfo = await getExchangeInfo();

    return {
      timezone: exchangeInfo.timezone,
      serverTime: exchangeInfo.serverTime,
      totalSymbols: exchangeInfo.symbols.length,
      activeSymbols: exchangeInfo.symbols.filter(s => s.status === 'TRADING').length,
    };
  } catch (error) {
    console.error('Error al obtener información básica del exchange:', error);
    throw error;
  }
}

/**
 * Busca un símbolo específico
 */
export async function getSymbolInfo(symbolName: string): Promise<BinanceSymbol | undefined> {
  try {
    const exchangeInfo = await getExchangeInfo();
    return exchangeInfo.symbols.find(s => s.symbol === symbolName);
  } catch (error) {
    console.error(`Error al buscar el símbolo ${symbolName}:`, error);
    throw error;
  }
}

/**
 * Obtiene el order book (bids y asks) para un símbolo específico
 * 
 * @param symbol - Símbolo del par de trading (ej: "BTCUSDT")
 * @param limit - Cantidad de niveles a obtener (default: 10, max: 5000)
 * @returns Order book con bids y asks
 */
export async function getOrderBook(
  symbol: string,
  limit: number = 10
): Promise<BidsAsks> {
  try {
    // Construir URL con query params
    const url = `/depth?symbol=${symbol}&limit=${limit}`;

    const response = await binanceClient.get<BidsAsks>(url, {
      cache: 'no-store', // Order book es data en tiempo real
    });

    return response.data;
  } catch (error) {
    console.error(`Error al obtener order book para ${symbol}:`, error);
    throw error;
  }
}

/**
 * Obtiene el order book con tiempo de respuesta
 */
export async function getOrderBookWithTiming(
  symbol: string,
  limit: number = 10
): Promise<{
  data: BidsAsks;
  responseTime: number;
}> {
  const startTime = Date.now();
  const data = await getOrderBook(symbol, limit);
  const endTime = Date.now();
  const responseTime = endTime - startTime;

  return {
    data,
    responseTime,
  };
}
