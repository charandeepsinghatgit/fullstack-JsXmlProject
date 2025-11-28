const express = require('express');
const router = express.Router();
const { convertCurrency, getPopularCurrencies, formatCurrency } = require('../utils/currencyAPI');
const { getAllCountries } = require('../utils/countryAPI');

// Freelancer tools page
router.get('/', (req, res) => {
  res.render('tools', {
    title: 'Freelancer Tools - FreelanceHub',
    currencies: getPopularCurrencies()
  });
});

// Currency converter API endpoint
router.post('/convert', async (req, res) => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    const result = await convertCurrency(parseFloat(amount), from, to);

    if (result.success) {
      res.json({
        success: true,
        original: {
          amount: result.data.original.amount,
          currency: result.data.original.currency,
          formatted: formatCurrency(result.data.original.amount, from)
        },
        converted: {
          amount: result.data.converted.amount,
          currency: result.data.converted.currency,
          formatted: formatCurrency(result.data.converted.amount, to)
        },
        rate: result.data.rate,
        date: result.data.date
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Conversion Error:', error);
    res.status(500).json({
      success: false,
      error: 'Conversion failed'
    });
  }
});

// Time zone calculator
router.get('/timezone', async (req, res) => {
  try {
    const countriesResult = await getAllCountries();
    
    res.render('timezone', {
      title: 'Time Zone Calculator - FreelanceHub',
      countries: countriesResult.success ? countriesResult.data : []
    });
  } catch (error) {
    console.error('Timezone Tool Error:', error);
    res.render('timezone', {
      title: 'Time Zone Calculator - FreelanceHub',
      countries: [],
      error: 'Failed to load countries'
    });
  }
});

module.exports = router;