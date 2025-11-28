const axios = require('axios');

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

/**
 * Search for jobs using Adzuna API
 */
async function searchJobs(country = 'us', query = '', location = '', page = 1) {
  try {
    const params = {
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      results_per_page: 20,
      what: query,
      where: location,
      'content-type': 'application/json'
    };

    const response = await axios.get(
      `${BASE_URL}/${country}/search/${page}`,
      { params }
    );

    return {
      success: true,
      data: response.data.results,
      count: response.data.count,
      mean: response.data.mean
    };
  } catch (error) {
    console.error('Adzuna API Error:', error.message);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Get job details by ID
 */
async function getJobDetails(country = 'us', adId) {
  try {
    const params = {
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY
    };

    const response = await axios.get(
      `${BASE_URL}/${country}/details/${adId}`,
      { params }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Adzuna API Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get top companies hiring
 */
async function getTopCompanies(country = 'us') {
  try {
    const params = {
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY
    };

    const response = await axios.get(
      `${BASE_URL}/${country}/top_companies`,
      { params }
    );

    return {
      success: true,
      data: response.data.leaderboard
    };
  } catch (error) {
    console.error('Adzuna API Error:', error.message);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Get salary statistics
 */
async function getSalaryStats(country = 'us', query = '') {
  try {
    const params = {
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      what: query
    };

    const response = await axios.get(
      `${BASE_URL}/${country}/history`,
      { params }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Adzuna API Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  searchJobs,
  getJobDetails,
  getTopCompanies,
  getSalaryStats
};