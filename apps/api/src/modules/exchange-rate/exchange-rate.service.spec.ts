import { ExchangeRateService } from './exchange-rate.service';

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    service = new ExchangeRateService();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('parsea serie[0] de mindicador y devuelve el resultado', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          serie: [{ fecha: '2026-07-25T04:00:00.000Z', valor: 946.24 }],
        }),
    });

    const result = await service.getRate('USD');

    expect(result).toEqual({
      currency: 'USD',
      rate: '946.24',
      date: '2026-07-25',
      source: 'mindicador.cl',
    });
  });

  it('devuelve null cuando fetch rechaza (timeout/red)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('aborted'));

    expect(await service.getRate('USD')).toBeNull();
  });

  it('devuelve null cuando la respuesta es inválida', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ serie: [] }),
    });

    expect(await service.getRate('USD')).toBeNull();
  });

  it('cachea: una segunda llamada dentro de la ventana no re-consulta', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          serie: [{ fecha: '2026-07-25T04:00:00.000Z', valor: 946.24 }],
        }),
    });
    global.fetch = fetchMock;

    await service.getRate('USD');
    await service.getRate('USD');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
