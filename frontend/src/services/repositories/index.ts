import { DemoRateRepository } from './DemoRateRepository';
import { CustomerRatesApiRepository } from './CustomerRatesApiRepository';
import { IRateRepository } from './IRateRepository';

// VITE_DATA_MODE is 'api' by default, or 'demo' for dev mock data
const mode = import.meta.env.VITE_DATA_MODE || 'api';

if (import.meta.env.PROD && mode === 'demo') {
    throw new Error("Demo mode cannot be used in production builds.");
}

export const rateRepository: IRateRepository = mode === 'demo' 
  ? new DemoRateRepository() 
  : new CustomerRatesApiRepository();
