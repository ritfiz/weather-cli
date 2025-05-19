# WeatherBaby

A simple CLI tool to fetch and display current weather information from OpenWeatherMap.

<img width="371" alt="Screenshot 2025-05-19 at 11 48 16 PM" src="https://github.com/user-attachments/assets/c5e21b10-de16-4a0d-b55d-b8f3692d77a0" />

## Installation

Make sure you have Node.js (v14 or higher) installed.

Install globally using npm:
```bash
> npm install -g weatherbaby
````

````
> weatherbaby -c 'Delhi'
````
## Troubleshooting

### I do not have the openweathermap api key

Go to https://home.openweathermap.org/api_keys and generate a key, then run

    export OPENWEATHER_API_KEY="YOUR_API_KEY"

### I have installed the package but cannot run the command

Check if your path is correctly set


    > npm get prefix

    > export PATH="[prefix]/bin:$PATH" >> ~/.bash_profile
    
    > source ~/.bash_profile
