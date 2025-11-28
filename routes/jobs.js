const express = require('express');
const router = express.Router();
const { searchJobs, getJobDetails } = require('../utils/jobAPI');
const { getCountryByName, formatCountryData } = require('../utils/countryAPI');
const { convertCurrency, getPopularCurrencies } = require('../utils/currencyAPI');

// Job search page
router.get('/search', async (req, res) => {
  try {
    const { query = '', location = '', country = 'us', page = 1, currency = 'USD' } = req.query;
    
    // Search for jobs
    const jobsResult = await searchJobs(country, query, location, page);

    // Convert salaries if needed
    let jobsWithConvertedSalary = [];
    if (jobsResult.success && jobsResult.data.length > 0) {
      jobsWithConvertedSalary = await Promise.all(
        jobsResult.data.map(async (job) => {
          if (job.salary_min && job.salary_max && currency !== 'USD') {
            const minConverted = await convertCurrency(job.salary_min, 'USD', currency);
            const maxConverted = await convertCurrency(job.salary_max, 'USD', currency);
            
            return {
              ...job,
              converted_salary_min: minConverted.success ? minConverted.data.converted.amount : null,
              converted_salary_max: maxConverted.success ? maxConverted.data.converted.amount : null,
              converted_currency: currency
            };
          }
          return job;
        })
      );
    }

    res.render('jobs', {
      title: 'Job Search - FreelanceHub',
      jobs: jobsWithConvertedSalary,
      query: query,
      location: location,
      country: country,
      currentPage: parseInt(page),
      totalResults: jobsResult.count || 0,
      averageSalary: jobsResult.mean || 0,
      currencies: getPopularCurrencies(),
      selectedCurrency: currency,
      error: jobsResult.success ? null : 'Failed to load jobs'
    });
  } catch (error) {
    console.error('Job Search Error:', error);
    res.render('jobs', {
      title: 'Job Search - FreelanceHub',
      jobs: [],
      query: req.query.query || '',
      location: req.query.location || '',
      country: req.query.country || 'us',
      currentPage: 1,
      totalResults: 0,
      averageSalary: 0,
      currencies: getPopularCurrencies(),
      selectedCurrency: req.query.currency || 'USD',
      error: 'An error occurred while searching for jobs'
    });
  }
});

// Job detail page
router.get('/detail/:adref', async (req, res) => {
  try {
    const { id } = req.params;
    const { country = 'us' } = req.query;

    // Get job details
    const jobResult = await getJobDetails(country, id);

    if (!jobResult.success) {
      return res.render('error', {
        title: 'Job Not Found',
        message: 'The job you are looking for could not be found.',
        error: { status: 404 }
      });
    }

    const job = jobResult.data;

    // Extract country from location
    let countryInfo = null;
    if (job.location?.area && job.location.area.length > 0) {
      const locationParts = job.location.area;
      const countryName = locationParts[locationParts.length - 1];
      
      const countryResult = await getCountryByName(countryName);
      if (countryResult.success) {
        countryInfo = formatCountryData(countryResult.data);
      }
    }

    // Check if job is saved
    const isSaved = req.session.savedJobs.some(savedJob => savedJob.id === id);

    res.render('job-detail', {
      title: `${job.title} - FreelanceHub`,
      job: job,
      countryInfo: countryInfo,
      isSaved: isSaved,
      currencies: getPopularCurrencies()
    });
  } catch (error) {
    console.error('Job Detail Error:', error);
    res.render('error', {
      title: 'Error',
      message: 'An error occurred while loading job details.',
      error: error
    });
  }
});

// Save job
router.post('/save/:id', (req, res) => {
  const { id } = req.params;
  const { title, company, location } = req.body;

  // Check if already saved
  const alreadySaved = req.session.savedJobs.some(job => job.id === id);

  if (!alreadySaved) {
    req.session.savedJobs.push({
      id: id,
      title: title,
      company: company,
      location: location,
      savedAt: new Date()
    });
  }

  res.json({ success: true, saved: true });
});

// Remove saved job
router.post('/unsave/:id', (req, res) => {
  const { id } = req.params;
  req.session.savedJobs = req.session.savedJobs.filter(job => job.id !== id);
  res.json({ success: true, saved: false });
});

// View saved jobs
router.get('/saved', (req, res) => {
  res.render('saved-jobs', {
    title: 'Saved Jobs - FreelanceHub',
    savedJobs: req.session.savedJobs || []
  });
});

module.exports = router;