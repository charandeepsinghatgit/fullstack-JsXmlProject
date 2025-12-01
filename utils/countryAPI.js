const axios = require('axios');

const BASE_URL = 'https://restcountries.com/v3.1';

/**
 * Get country information by name
 */
async function getCountryByName(name) {
  try {
    const response = await axios.get(`${BASE_URL}/name/${name}`);
    return {
      success: true,
      data: response.data[0]
    };
  } catch (error) {
    console.error('REST Countries API Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get country information by code (US, GB, etc.)
 */
async function getCountryByCode(code) {
  try {
    const response = await axios.get(`${BASE_URL}/alpha/${code}`);
    return {
      success: true,
      data: response.data[0]
    };
  } catch (error) {
    console.error('REST Countries API Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all countries
 */
async function getAllCountries() {
  try {
    const response = await axios.get(`${BASE_URL}/all?fields=name,cca2,flags`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('REST Countries API Error:', error.message);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Extract useful country information
 */
function formatCountryData(countryData) {
  if (!countryData) return null;

  return {
    name: countryData.name?.common || 'Unknown',
    officialName: countryData.name?.official || '',
    capital: countryData.capital?.[0] || 'N/A',
    region: countryData.region || 'N/A',
    subregion: countryData.subregion || 'N/A',
    population: countryData.population || 0,
    languages: countryData.languages ? Object.values(countryData.languages) : [],
    currencies: countryData.currencies ? Object.keys(countryData.currencies) : [],
    currencyInfo: countryData.currencies || {},
    timezones: countryData.timezones || [],
    flag: countryData.flags?.svg || countryData.flags?.png || '',
    code: countryData.cca2 || ''
  };
}

/**
 * Calculate time difference between two timezones
 */
function calculateTimeDifference(timezone1, timezone2) {
  // Simple timezone difference calculator
  const getOffset = (tz) => {
    const match = tz.match(/UTC([+-]\d{1,2}):?(\d{2})?/);
    if (!match) return 0;
    const hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    return hours + (minutes / 60);
  };

  const offset1 = getOffset(timezone1);
  const offset2 = getOffset(timezone2);
  return offset1 - offset2;
}

module.exports = {
  getCountryByName,
  getCountryByCode,
  getAllCountries,
  formatCountryData,
  calculateTimeDifference
};