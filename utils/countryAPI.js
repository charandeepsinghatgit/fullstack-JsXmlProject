const axios = require("axios");

async function getCountryInfo(countryName) {
  try {
    const url = `https://restcountries.com/v3.1/name/${countryName}?fullText=false`;

    const response = await axios.get(url);

    return response.data[0];
  } catch (err) {
    console.error("Country API error:", err.message);
    return null;
  }
}

module.exports = { getCountryInfo };
