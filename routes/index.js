const express = require('express');
const router = express.Router();
const { searchJobs, getTopCompanies } = require('../utils/jobAPI');
const { getPopularCurrencies } = require('../utils/currencyAPI');

// Homepage
router.get('/', async (req, res) => {
  try {
    // Get some featured jobs for the homepage
    const jobsResult = await searchJobs('us', 'remote developer', '', 1);
    const companiesResult = await getTopCompanies('us');
    const currencies = getPopularCurrencies();

    res.render('index', {
      title: 'FreelanceHub - Find Your Next Opportunity',
      featuredJobs: jobsResult.success ? jobsResult.data.slice(0, 6) : [],
      topCompanies: companiesResult.success ? companiesResult.data.slice(0, 8) : [],
      currencies: currencies,
      error: null
    });
  } catch (error) {
    console.error('Homepage Error:', error);
    res.render('index', {
      title: 'FreelanceHub - Find Your Next Opportunity',
      featuredJobs: [],
      topCompanies: [],
      currencies: getPopularCurrencies(),
      error: 'Failed to load featured content'
    });
  }
});

// About page
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About FreelanceHub'
  });
});

module.exports = router;