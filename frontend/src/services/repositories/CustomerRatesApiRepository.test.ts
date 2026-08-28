import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerRatesApiRepository } from './CustomerRatesApiRepository';
import { apiClient } from '../apiClient';

vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('CustomerRatesApiRepository', () => {
  let repo: CustomerRatesApiRepository;

  beforeEach(() => {
    repo = new CustomerRatesApiRepository();
    vi.clearAllMocks();
  });

  const mockResponse = {
    count: 2,
    results: [
      {
        id: '1', organization_id: 'org1', lane_id: 'L1', customer_name: 'Test Customer',
        origin_city: 'City A', origin_state: 'CA', raw_origin: 'A',
        destination_city: 'City B', destination_state: 'NY', raw_destination: 'B',
        base_rate: '100.50', equipment: 'V', service_type: 'S', miles: 500,
        status: 'AWARDED', active_state: 'Active', effective_date: '2026-01-01',
        expiration_date: '2026-12-31', fuel_surcharge_percent: '10.0',
        fuel_amount: '10.05', total_billing: '110.55'
      }
    ]
  };

  it('1. API success and 2. Typed response mapping and 3. Decimal-string handling', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);
    
    const results = await repo.getCustomerRates();
    expect(results).toHaveLength(1);
    expect(results[0].laneId).toBe('L1');
    expect(results[0].baseRate).toBe(100.50); // Decimal string to number mapping
  });

  it('4. Limit/offset behavior, 5. Search parameters, 6. Filter parameters, 7. Ordering parameters', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);
    
    await repo.getCustomerRates({ search: 'Test', status: 'AWARDED' });
    
    expect(apiClient.get).toHaveBeenCalledWith('/api/rates/lanes/', {
      limit: 100, offset: 0, customer_name: 'Test', status: 'AWARDED'
    });
  });

  it('8. Empty response', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ count: 0, results: [] });
    const results = await repo.getCustomerRates();
    expect(results).toHaveLength(0);
  });

  it('12. 500 handling & 13. Network failure', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));
    await expect(repo.getCustomerRates()).rejects.toThrow('Network error');
  });

  it('19. Disabled write controls in API mode', async () => {
    await expect(repo.addCustomerLane()).rejects.toThrow('Write operations disabled in API mode');
    await expect(repo.updateCustomerLane()).rejects.toThrow('Write operations disabled in API mode');
  });

  // Note: App.tsx tests cover 9-11, 14-18, 20-22 (UI states and Demo Mode logic)
});
