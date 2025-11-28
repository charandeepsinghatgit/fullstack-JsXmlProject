const axios = require('axios');

const BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

// Cache for exchange rates (to reduce API calls)
let ratesCache = {
  data: null,
  timestamp: null,
  ttl: 3600000 // 1 hour in milliseconds
};

/**
 * Get exchange rates for a base currency
 */
async function getExchangeRates(baseCurrency = 'USD') {
  try {
    // Check cache first
    const now = Date.now();
    if (ratesCache.data && ratesCache.timestamp && (now - ratesCache.timestamp) < ratesCache.ttl) {
      return {
        success: true,
        data: ratesCache.data,
        cached: true
      };
    }

    // Fetch new rates
    const response = await axios.get(`${BASE_URL}/${baseCurrency}`);
    
    // Update cache
    ratesCache = {
      data: response.data,
      timestamp: now,
      ttl: 3600000
    };

    return {
      success: true,
      data: response.data,
      cached: false
    };
  } catch (error) {
    console.error('Exchange Rate API Error:', error.message);
    
    // Return cached data if available, even if expired
    if (ratesCache.data) {
      return {
        success: true,
        data: ratesCache.data,
        cached: true,
        warning: 'Using cached rates due to API error'
      };
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Convert amount from one currency to another
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  try {
    const ratesResult = await getExchangeRates(fromCurrency);
    
    if (!ratesResult.success) {
      throw new Error('Failed to get exchange rates');
    }

    const rates = ratesResult.data.rates;
    
    if (!rates[toCurrency]) {
      throw new Error(`Currency ${toCurrency} not found`);
    }

    const convertedAmount = amount * rates[toCurrency];

    return {
      success: true,
      data: {
        original: {
          amount: amount,
          currency: fromCurrency
        },
        converted: {
          amount: convertedAmount,
          currency: toCurrency
        },
        rate: rates[toCurrency],
        date: ratesResult.data.date
      }
    };
  } catch (error) {
    console.error('Currency Conversion Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Format currency with symbol
 */
function formatCurrency(amount, currency) {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'CA$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$'
  };

  const symbol = symbols[currency] || currency;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  return `${symbol}${formatted}`;
}

/**
 * Get popular currency list
 */
function getPopularCurrencies() {
  return [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' }
  ];
}

module.exports = {
  getExchangeRates,
  convertCurrency,
  formatCurrency,
  getPopularCurrencies
};