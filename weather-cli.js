#!/usr/bin/env node

// weather-cli.js
// (Your existing JavaScript code from the previous immersive will go here)
// No changes are strictly needed to the JavaScript logic itself for packaging,
// assuming it's saved in a file like 'weather-cli.js'.

// Required modules
const axios = require('axios'); // For making HTTP requests
const yargs = require('yargs/yargs'); // For parsing command-line arguments
const { hideBin } = require('yargs/helpers');
const chalk = require('chalk'); // For styling terminal output (optional, but nice)

// --- Configuration ---
// IMPORTANT: Replace with your OpenWeatherMap API key
// You can get a free API key by signing up at https://openweathermap.org/appid
// It's best to store this as an environment variable, e.g., process.env.OPENWEATHER_API_KEY
const API_KEY = process.env.OPENWEATHER_API_KEY || 'YOUR_API_KEY_HERE'; // Fallback, but ideally use env var

if (API_KEY === 'YOUR_API_KEY_HERE' && !process.env.OPENWEATHER_API_KEY) {
    console.error(chalk.red('Error: OPENWEATHER_API_KEY is not set.'));
    console.log(chalk.yellow('Please get an API key from https://openweathermap.org/appid and set it as an environment variable or directly in the script.'));
    process.exit(1); // Exit if no API key
}

// --- Helper Functions ---

/**
 * Maps OpenWeatherMap condition codes to simple icons and descriptions.
 * You can find condition codes here: https://openweathermap.org/weather-conditions
 * @param {number} conditionCode - The weather condition code from OpenWeatherMap.
 * @param {string} iconCode - The icon code from OpenWeatherMap (e.g., "01d" for clear sky day).
 * @returns {object} An object with an icon and a textual description.
 */
function getWeatherVisuals(conditionCode, iconCode) {
    // Basic mapping, can be expanded significantly
    const isDay = iconCode.endsWith('d');

    if (conditionCode >= 200 && conditionCode < 300) return { icon: '⛈️', text: 'Thunderstorm' }; // Thunderstorm
    if (conditionCode >= 300 && conditionCode < 400) return { icon: '💧', text: 'Drizzle' };    // Drizzle
    if (conditionCode >= 500 && conditionCode < 600) return { icon: '🌧️', text: 'Rain' };       // Rain
    if (conditionCode >= 600 && conditionCode < 700) return { icon: '❄️', text: 'Snow' };       // Snow
    if (conditionCode >= 700 && conditionCode < 800) return { icon: '🌫️', text: 'Atmosphere' }; // Atmosphere (fog, mist, etc.)
    if (conditionCode === 800) return { icon: isDay ? '☀️' : '🌙', text: 'Clear' };        // Clear
    if (conditionCode === 801) return { icon: isDay ? '🌤️' : '☁️🌙', text: 'Few Clouds' };   // Few clouds
    if (conditionCode === 802) return { icon: isDay ? '⛅️' : '☁️🌙', text: 'Scattered Clouds' }; // Scattered clouds
    if (conditionCode === 803) return { icon: '☁️', text: 'Broken Clouds' };  // Broken clouds
    if (conditionCode === 804) return { icon: '☁️☁️', text: 'Overcast Clouds' };// Overcast clouds

    // Default fallback
    return { icon: '❓', text: 'Unknown' };
}

/**
 * Determines a qualitative description based on temperature (Celsius).
 * @param {number} tempCelsius - Temperature in Celsius.
 * @returns {string} A qualitative description like "Very Hot", "Cold", etc.
 */
function getTemperatureFeel(tempCelsius) {
    if (tempCelsius > 35) return chalk.redBright('Very Hot 🔥');
    if (tempCelsius > 28) return chalk.red('Hot 🥵');
    if (tempCelsius > 20) return chalk.yellow('Warm');
    if (tempCelsius > 10) return chalk.blue('Cool');
    if (tempCelsius > 0) return chalk.blueBright('Cold 🥶');
    return chalk.cyanBright('Very Cold 🧊');
}

/**
 * Fetches weather data for a given city.
 * @param {string} city - The name of the city.
 * @returns {Promise<object>} A promise that resolves with the weather data.
 */
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 401) {
                throw new Error('Invalid API key. Please check your OPENWEATHER_API_KEY.');
            } else if (error.response.status === 404) {
                throw new Error(`City "${city}" not found.`);
            } else {
                throw new Error(`API Error: ${error.response.data.message || error.response.status}`);
            }
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('Network error. Unable to connect to weather service.');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(`Error: ${error.message}`);
        }
    }
}

// --- Main CLI Logic ---
async function main() {
    const argv = yargs(hideBin(process.argv))
        .usage('Usage: $0 -c <city> [options] \nOr: weather-cli -c <city> [options]')
        .option('c', {
            alias: 'city',
            describe: 'Name of the city to fetch weather for',
            type: 'string',
            demandOption: true, // Makes this option required
        })
        .option('d', {
            alias: 'details',
            describe: 'Show more detailed weather information',
            type: 'boolean',
            default: false
        })
        .alias('h', 'help')
        .alias('v', 'version')
        .epilogue('For more information, visit https://openweathermap.org/current')
        .parse();

    const city = argv.city;

    try {
        console.log(chalk.blue(`Fetching weather for ${chalk.bold(city)}...`));
        const weatherData = await fetchWeather(city);

        // Extract relevant information
        const temperature = weatherData.main.temp;
        const feelsLike = weatherData.main.feels_like;
        const description = weatherData.weather[0].description;
        const conditionCode = weatherData.weather[0].id;
        const iconCode = weatherData.weather[0].icon; // e.g., "01d", "10n"
        const humidity = weatherData.main.humidity;
        const windSpeed = weatherData.wind.speed; // m/s
        const country = weatherData.sys.country;

        const visuals = getWeatherVisuals(conditionCode, iconCode);
        const tempFeel = getTemperatureFeel(temperature);

        // Display basic weather information
        console.log(`\n${chalk.bold.yellow(city)}, ${chalk.cyan(country)}`);
        console.log(`------------------------------------`);
        console.log(`${visuals.icon}  ${chalk.green(visuals.text)} (${description})`);
        console.log(`🌡️  Temperature: ${chalk.magentaBright(temperature.toFixed(1) + '°C')} (${tempFeel})`);
        
        if (argv.details) {
            console.log(`🤔 Feels like: ${chalk.magenta(feelsLike.toFixed(1) + '°C')}`);
            console.log(`💧 Humidity: ${chalk.blue(humidity + '%')}`);
            console.log(`🌬️  Wind: ${chalk.cyan(windSpeed.toFixed(1) + ' m/s')}`); // toFixed(1) for one decimal place
        }

        // Wind indication (simple text based on speed)
        if (windSpeed > 10) { // Threshold for "windy" in m/s (approx > 36 km/h)
            console.log(chalk.blueBright('💨 It\'s quite windy!'));
        } else if (windSpeed > 5) {
            console.log(chalk.blue('🍃 Gentle breeze.'));
        }

        // Temperature indication
        if (temperature > 30 && (country === 'IN' || city.toLowerCase().includes('delhi') || city.toLowerCase().includes('mumbai'))) { // Example for Indian context
             console.log(chalk.redBright("☀️ It's a hot day, especially for this region!"));
        } else if (temperature < 10 && (country === 'IN' || city.toLowerCase().includes('shimla') || city.toLowerCase().includes('manali'))) {
             console.log(chalk.cyanBright("❄️ It's cold, typical for hilly regions or winter!"));
        }


    } catch (error) {
        console.error(chalk.red(`\nError: ${error.message}`));
        process.exit(1); // Exit with an error code
    }
}

// Run the main function
main();

