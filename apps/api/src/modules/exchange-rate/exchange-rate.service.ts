import { Injectable } from '@nestjs/common';
import { ExchangeRateResultDto } from './dto/exchange-rate-result.dto';

const MINDICADOR_BASE_URL = 'https://mindicador.cl/api';
const FETCH_TIMEOUT_MS = 3000;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const SOURCE = 'mindicador.cl';

// Mapea la moneda extranjera al indicador de mindicador (base implícita CLP).
const ENDPOINT_BY_CURRENCY: Record<string, string> = {
  USD: 'dolar',
  EUR: 'euro',
};

interface CacheEntry {
  result: ExchangeRateResultDto;
  fetchedAt: number;
}

@Injectable()
export class ExchangeRateService {
  private readonly cache = new Map<string, CacheEntry>();

  async getRate(from: string): Promise<ExchangeRateResultDto | null> {
    const endpoint = ENDPOINT_BY_CURRENCY[from];
    if (!endpoint) {
      return null;
    }

    const cached = this.cache.get(from);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.result;
    }

    const result = await this.fetchFromProvider(from, endpoint);
    if (result) {
      this.cache.set(from, { result, fetchedAt: Date.now() });
    }
    return result;
  }

  private async fetchFromProvider(
    from: string,
    endpoint: string,
  ): Promise<ExchangeRateResultDto | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(`${MINDICADOR_BASE_URL}/${endpoint}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        return null;
      }
      const data = (await response.json()) as {
        serie?: Array<{ fecha?: string; valor?: number }>;
      };
      const latest = data.serie?.[0];
      if (!latest || typeof latest.valor !== 'number' || !latest.fecha) {
        return null;
      }
      return {
        currency: from,
        rate: String(latest.valor),
        date: latest.fecha.slice(0, 10),
        source: SOURCE,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
