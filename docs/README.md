# GitHub Pages Website

This directory contains the GitHub Pages website for the Dollar-Rial-Toman Live Price Dataset.

## Features

- 📈 **Interactive Charts**: Candlestick, line, and area charts using TradingView Lightweight Charts
- 📊 **Live Data**: Automatically loads data from the GitHub repository
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Beautiful gradient design with glassmorphism effects
- 📋 **Recent Data Table**: Shows the latest exchange rates
- 📁 **Direct Downloads**: Links to CSV files
- 🔄 **Auto-updates**: Data refreshes when the CSV files are updated

## Files

- `index.html` - Main HTML page
- `styles.css` - CSS styles and responsive design
- `script.js` - JavaScript for charts and data loading

## Data Source

The website automatically loads data from:
```
https://raw.githubusercontent.com/kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset/refs/heads/main/data/Dollar_Toman_Price_Dataset.csv
```

## Local Development

To test locally:
1. Serve the files using a local web server (due to CORS restrictions)
2. For example: `python -m http.server 8000`
3. Open `http://localhost:8000` in your browser

## GitHub Pages Setup

1. Go to your repository settings
2. Scroll to "Pages" section
3. Set source to "Deploy from a branch"
4. Select "main" branch and "/docs" folder
5. Save the settings

Your website will be available at:
`https://kooroshkz.github.io/Dollar-Rial-Toman-Live-Price-Dataset/`
