// Configuration
const DATA_URL = 'https://raw.githubusercontent.com/kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset/refs/heads/main/data/Dollar_Rial_Price_Dataset.csv';

// Global variables
let chart;
let candlestickSeries;
let lineSeries;
let areaSeries;
let currentSeriesType = 'candlestick';
let allData = [];
let indicatorCharts = {
    rsi: null,
    stochastic: null,
    momentum: null,
    macd: null
};
let indicators = {
    rsi: null,
    stochastic: {
        main: null,
        slow: null
    },
    momentum: null,
    macd: {
        main: null,
        signal: null
    },
    ichimoku: {
        tenkanSen: null,
        kijunSen: null,
        senkouSpanA: null,
        senkouSpanB: null,
        chikouSpan: null
    },
    ema: {
        ema12: null,
        ema26: null,
        ema50: null
    }
};
let activeIndicators = new Set();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting initialization...');
    
    try {
        console.log('Checking TradingView library...');
        if (typeof LightweightCharts === 'undefined') {
            throw new Error('LightweightCharts library not loaded');
        }
        console.log('✅ TradingView library loaded');
        
        console.log('Initializing chart...');
        initializeChart();
        console.log('✅ Chart initialized');
        
        console.log('Loading data...');
        loadData();
        console.log('✅ Data loading started');
        
        console.log('Setting up event listeners...');
        setupEventListeners();
        console.log('✅ Event listeners set up');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError(error.message);
    }
});

// Initialize the chart
function initializeChart() {
    try {
        console.log('Getting chart container...');
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) {
            throw new Error('Chart container not found');
        }
        console.log('✅ Chart container found');
        
        console.log('Creating chart...');
        chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: 500, // Back to normal height since indicators are separate
            layout: {
                background: { type: 'solid', color: '#0d1117' },
                textColor: '#c9d1d9',
            },
            grid: {
                vertLines: { color: '#21262d' },
                horzLines: { color: '#21262d' },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: '#30363d',
                textColor: '#8b949e',
            },
            timeScale: {
                borderColor: '#30363d',
                textColor: '#8b949e',
                timeVisible: true,
                secondsVisible: false,
            },
        });
        console.log('✅ Chart created');

        console.log('Adding series...');
        // Create all series types (initially hidden)
        candlestickSeries = chart.addCandlestickSeries({
            upColor: '#238636',
            downColor: '#f85149',
            borderVisible: false,
            wickUpColor: '#238636',
            wickDownColor: '#f85149',
        });

        lineSeries = chart.addLineSeries({
            color: '#58a6ff',
            lineWidth: 2,
        });

        areaSeries = chart.addAreaSeries({
            topColor: 'rgba(88, 166, 255, 0.56)',
            bottomColor: 'rgba(88, 166, 255, 0.04)',
            lineColor: '#58a6ff',
            lineWidth: 2,
        });
        
        // Initially hide non-candlestick series
        lineSeries.applyOptions({ visible: false });
        areaSeries.applyOptions({ visible: false });
        console.log('✅ All series added');

        // Handle resize
        window.addEventListener('resize', () => {
            chart.applyOptions({ width: chartContainer.clientWidth });
            
            // Resize indicator charts
            Object.entries(indicatorCharts).forEach(([key, indicatorChart]) => {
                if (indicatorChart) {
                    const container = document.getElementById(key + 'Chart');
                    if (container) {
                        indicatorChart.applyOptions({ width: container.clientWidth });
                    }
                }
            });
        });
        console.log('✅ Resize handler added');
        
    } catch (error) {
        console.error('❌ Chart initialization error:', error);
        showError('Failed to initialize chart: ' + error.message);
    }
}

// Sample data for local preview (matches actual Rial dataset columns)
const SAMPLE_DATA = [
    { gdate: '2025/09/06', pdate: '1404/06/15', open: 1012100, low: 1011700, high: 1034100, close: 1029800 },
    { gdate: '2025/09/04', pdate: '1404/06/13', open: 1023900, low: 1014300, high: 1024200, close: 1014400 },
    { gdate: '2025/09/03', pdate: '1404/06/12', open: 1032700, low: 1023800, high: 1032700, close: 1025700 },
    { gdate: '2025/09/02', pdate: '1404/06/11', open: 1055700, low: 1031300, high: 1056700, close: 1032000 },
    { gdate: '2025/08/31', pdate: '1404/06/09', open: 1024900, low: 1024300, high: 1049200, close: 1048300 }
];

// Load and process data
async function loadData() {
    try {
        console.log('Starting data load...');
        console.log('Fetching data from:', DATA_URL);
        
        // Try to fetch real data first
        const response = await fetch(DATA_URL, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'text/csv,text/plain,*/*'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('CSV data loaded, length:', csvText.length);
        
        allData = parseCSV(csvText);
        console.log('Parsed data points:', allData.length);
        
        if (allData.length === 0) {
            throw new Error('No data parsed from CSV');
        }
        
    } catch (error) {
        console.error('Error loading real data:', error);
        console.log('Using sample data for local preview...');
        
        // Use sample data as fallback
        allData = SAMPLE_DATA;
        console.log('Sample data loaded:', allData.length, 'records');
        
        // Show a message to user
        showDataSourceMessage('Using sample data for local preview. Real data will load automatically when deployed to GitHub Pages.');
    }
    
    console.log('Updating statistics...');
    updateStatistics(allData);
    
    console.log('Updating data table...');
    updateRecentDataTable(allData.slice(-10)); // Show last 10 records
    
    console.log('Updating chart...');
    updateChart(allData);
    
    console.log('Hiding loading indicator...');
    hideLoading();
    
    console.log('Making data globally accessible...');
    window.allData = allData;
    
    console.log('✅ Data loading complete');
}

// Show data source message
function showDataSourceMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #58a6ff;
        color: #0d1117;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(88, 166, 255, 0.3);
        z-index: 1000;
        max-width: 300px;
        font-size: 14px;
        line-height: 1.4;
        border: 1px solid #30363d;
    `;
    messageDiv.innerHTML = `
        <strong>Local Preview:</strong><br>
        ${message}
        <button onclick="this.parentElement.remove()" style="
            background: rgba(13, 17, 23, 0.2);
            border: none;
            color: #0d1117;
            float: right;
            cursor: pointer;
            font-size: 16px;
            margin-top: -5px;
            border-radius: 3px;
            width: 25px;
            height: 25px;
        ">×</button>
    `;
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 15 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 15000);
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const header = lines[0].split(',').map(col => col.replace(/"/g, ''));
    // Expected: Open Price,Low Price,High Price,Close Price,Change Amount,Change Percent,Gregorian Date,Persian Date
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 8) {
            const [open, low, high, close, changeAmount, changePercent, gdate, pdate] = values;
            // Convert date for chart (YYYY/MM/DD to YYYY-MM-DD)
            const dateParts = gdate.split('/');
            if (dateParts.length === 3) {
                const chartDate = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
                data.push({
                    gdate: gdate,
                    pdate: pdate,
                    time: chartDate,
                    open: parseInt(open, 10),
                    low: parseInt(low, 10),
                    high: parseInt(high, 10),
                    close: parseInt(close, 10),
                    value: parseInt(close, 10),
                    changeAmount: changeAmount,
                    changePercent: changePercent
                });
            }
        }
    }
    return data.sort((a, b) => new Date(a.time) - new Date(b.time));
}

// Parse a single CSV line (handling quoted values)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// Update statistics
function updateStatistics(data) {
    if (data.length === 0) return;
    const totalRecords = data.length;
    const lastRecord = data[data.length - 1];
    const currentPrice = formatNumber(lastRecord.close);
    const lastUpdate = lastRecord.gdate;
    document.getElementById('totalRecords').textContent = formatNumber(totalRecords);
    document.getElementById('lastUpdate').textContent = lastUpdate;
    document.getElementById('currentPrice').textContent = currentPrice;
}

// Update recent data table
function updateRecentDataTable(recentData) {
    const tbody = document.getElementById('recentDataBody');
    tbody.innerHTML = '';
    // Reverse to show newest first
    recentData.reverse().forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${record.gdate}</strong></td>
            <td>${record.pdate}</td>
            <td>${formatNumber(record.open)}</td>
            <td>${formatNumber(record.low)}</td>
            <td>${formatNumber(record.high)}</td>
            <td><strong>${formatNumber(record.close)}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

// Update chart with data
function updateChart(data) {
    if (data.length === 0) return;

    console.log('Preparing chart data...');
    // Prepare data for different series types
    const candlestickData = data.map(item => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
    }));

    const lineData = data.map(item => ({
        time: item.time,
        value: item.close,
    }));

    console.log('Setting data to series...');
    console.log('Sample candlestick data:', candlestickData.slice(0, 2));
    console.log('Sample line data:', lineData.slice(0, 2));

    // Set data for all series
    candlestickSeries.setData(candlestickData);
    lineSeries.setData(lineData);
    areaSeries.setData(lineData);

    console.log('Fitting content...');
    // Fit content to show all data
    chart.timeScale().fitContent();
    console.log('✅ Chart updated successfully');
    
    // Trigger technical analysis update
    console.log('Triggering technical analysis update...');
    if (window.technicalAnalysis) {
        console.log('Technical analysis found, setting data...');
        window.technicalAnalysis.setData(data);
    } else {
        console.log('Technical analysis not ready, will retry...');
        setTimeout(() => {
            if (window.technicalAnalysis) {
                console.log('Technical analysis ready on retry, setting data...');
                window.technicalAnalysis.setData(data);
            }
        }, 1000);
    }
    
    // Update technical analysis if available
    if (window.technicalAnalysis) {
        window.technicalAnalysis.setData(data);
    }
}

// Setup event listeners
function setupEventListeners() {
    const chartButtons = document.querySelectorAll('.chart-btn');
    
    chartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const seriesType = button.getAttribute('data-type');
            switchChartType(seriesType);
            
            // Update button states
            chartButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    setupIndicatorEventListeners();
}

// Setup indicator event listeners
function setupIndicatorEventListeners() {
    const indicatorButtons = document.querySelectorAll('.indicator-btn');
    
    indicatorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const indicatorType = button.getAttribute('data-indicator');
            toggleIndicator(indicatorType, button);
        });
    });
}

// Switch chart type
function switchChartType(type) {
    // Hide all series first
    candlestickSeries.applyOptions({ visible: false });
    lineSeries.applyOptions({ visible: false });
    areaSeries.applyOptions({ visible: false });

    // Show the selected series
    switch (type) {
        case 'candlestick':
            candlestickSeries.applyOptions({ visible: true });
            break;
        case 'line':
            lineSeries.applyOptions({ visible: true });
            break;
        case 'area':
            areaSeries.applyOptions({ visible: true });
            break;
    }

    currentSeriesType = type;
}

// Toggle technical indicator
function toggleIndicator(indicatorType, button) {
    if (activeIndicators.has(indicatorType)) {
        // Remove indicator
        removeIndicator(indicatorType);
        activeIndicators.delete(indicatorType);
        button.classList.remove('active');
    } else {
        // Add indicator
        addIndicator(indicatorType);
        activeIndicators.add(indicatorType);
        button.classList.add('active');
    }
}

// Add technical indicator to chart
function addIndicator(indicatorType) {
    if (!allData || allData.length === 0) return;
    
    switch (indicatorType) {
        case 'rsi':
            addRSI();
            break;
        case 'stochastic':
            addStochastic();
            break;
        case 'momentum':
            addMomentum();
            break;
        case 'macd':
            addMACD();
            break;
        case 'ichimoku':
            addIchimoku();
            break;
        case 'ema':
            addEMA();
            break;
    }
}

// Remove technical indicator from chart
function removeIndicator(indicatorType) {
    switch (indicatorType) {
        case 'rsi':
            if (indicatorCharts.rsi) {
                indicatorCharts.rsi.remove();
                indicatorCharts.rsi = null;
            }
            document.getElementById('rsiWindow').style.display = 'none';
            indicators.rsi = null;
            break;
            
        case 'stochastic':
            if (indicatorCharts.stochastic) {
                indicatorCharts.stochastic.remove();
                indicatorCharts.stochastic = null;
            }
            document.getElementById('stochasticWindow').style.display = 'none';
            indicators.stochastic = { main: null, slow: null };
            break;
            
        case 'momentum':
            if (indicatorCharts.momentum) {
                indicatorCharts.momentum.remove();
                indicatorCharts.momentum = null;
            }
            document.getElementById('momentumWindow').style.display = 'none';
            indicators.momentum = null;
            break;
            
        case 'macd':
            if (indicatorCharts.macd) {
                indicatorCharts.macd.remove();
                indicatorCharts.macd = null;
            }
            document.getElementById('macdWindow').style.display = 'none';
            indicators.macd = { main: null, signal: null };
            break;
            
        case 'ichimoku':
            // Remove all Ichimoku components from main chart
            Object.values(indicators.ichimoku).forEach(series => {
                if (series) {
                    chart.removeSeries(series);
                }
            });
            indicators.ichimoku = {
                tenkanSen: null,
                kijunSen: null,
                senkouSpanA: null,
                senkouSpanB: null,
                chikouSpan: null
            };
            break;
            
        case 'ema':
            // Remove all EMA lines from main chart
            Object.values(indicators.ema).forEach(series => {
                if (series) {
                    chart.removeSeries(series);
                }
            });
            indicators.ema = {
                ema12: null,
                ema26: null,
                ema50: null
            };
            break;
    }
}

// Create indicator chart with common settings
function createIndicatorChart(containerId, title) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    return LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: 120,
        layout: {
            background: { type: 'solid', color: '#0d1117' },
            textColor: '#c9d1d9',
        },
        grid: {
            vertLines: { color: '#21262d' },
            horzLines: { color: '#21262d' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: '#30363d',
            textColor: '#8b949e',
            scaleMargins: {
                top: 0.1,
                bottom: 0.1,
            },
        },
        timeScale: {
            borderColor: '#30363d',
            textColor: '#8b949e',
            timeVisible: false,
            secondsVisible: false,
        },
        handleScroll: {
            vertTouchDrag: false,
        },
        handleScale: {
            axisPressedMouseMove: false,
            mouseWheel: false,
            pinch: false,
        },
    });
}

// Add RSI indicator in separate window
function addRSI() {
    const rsiData = calculateRSI(allData, 14);
    
    // Show RSI window
    document.getElementById('rsiWindow').style.display = 'block';
    
    // Create RSI chart
    indicatorCharts.rsi = createIndicatorChart('rsiChart', 'RSI');
    
    // Add RSI line
    indicators.rsi = indicatorCharts.rsi.addLineSeries({
        color: '#ff6b6b',
        lineWidth: 2,
        priceFormat: {
            type: 'price',
            precision: 2,
        },
    });
    
    // Add overbought line (70)
    const rsiOverbought = indicatorCharts.rsi.addLineSeries({
        color: 'rgba(255, 107, 107, 0.4)',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
    });
    
    // Add oversold line (30)
    const rsiOversold = indicatorCharts.rsi.addLineSeries({
        color: 'rgba(255, 107, 107, 0.4)',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
    });
    
    // Add middle line (50)
    const rsiMiddle = indicatorCharts.rsi.addLineSeries({
        color: 'rgba(255, 107, 107, 0.2)',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dotted,
        lastValueVisible: false,
        priceLineVisible: false,
    });
    
    // Create reference line data
    const overboughtData = rsiData.map(point => ({ time: point.time, value: 70 }));
    const oversoldData = rsiData.map(point => ({ time: point.time, value: 30 }));
    const middleData = rsiData.map(point => ({ time: point.time, value: 50 }));
    
    rsiOverbought.setData(overboughtData);
    rsiOversold.setData(oversoldData);
    rsiMiddle.setData(middleData);
    indicators.rsi.setData(rsiData);
    
    // Sync timeScale with main chart
    indicatorCharts.rsi.timeScale().subscribeVisibleTimeRangeChange(() => {
        const timeRange = indicatorCharts.rsi.timeScale().getVisibleRange();
        if (timeRange) {
            chart.timeScale().setVisibleRange(timeRange);
        }
    });
    
    // Update current value
    if (rsiData.length > 0) {
        const lastValue = rsiData[rsiData.length - 1].value;
        document.getElementById('rsiValue').textContent = lastValue.toFixed(2);
    }
}

// Add Stochastic indicator in separate window
function addStochastic() {
    const stochasticData = calculateStochastic(allData, 14, 3);
    const stochasticSlowData = calculateStochasticSlow(allData, 14, 3, 3);
    
    // Show Stochastic window
    document.getElementById('stochasticWindow').style.display = 'block';
    
    // Create Stochastic chart
    indicatorCharts.stochastic = createIndicatorChart('stochasticChart', 'Stochastic');
    
    // Add %K line (fast)
    indicators.stochastic.main = indicatorCharts.stochastic.addLineSeries({
        color: '#4ecdc4',
        lineWidth: 2,
        title: '%K',
        priceFormat: {
            type: 'price',
            precision: 2,
        },
    });
    
    // Add %D line (slow)
    indicators.stochastic.slow = indicatorCharts.stochastic.addLineSeries({
        color: '#ffe66d',
        lineWidth: 1,
        title: '%D',
        priceFormat: {
            type: 'price',
            precision: 2,
        },
    });
    
    // Add overbought/oversold lines
    const stochOverbought = indicatorCharts.stochastic.addLineSeries({
        color: 'rgba(78, 205, 196, 0.4)',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
    });
    
    const stochOversold = indicatorCharts.stochastic.addLineSeries({
        color: 'rgba(78, 205, 196, 0.4)',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
    });
    
    const overboughtData = stochasticData.map(point => ({ time: point.time, value: 80 }));
    const oversoldData = stochasticData.map(point => ({ time: point.time, value: 20 }));
    
    stochOverbought.setData(overboughtData);
    stochOversold.setData(oversoldData);
    indicators.stochastic.main.setData(stochasticData);
    indicators.stochastic.slow.setData(stochasticSlowData);
    
    // Sync with main chart
    indicatorCharts.stochastic.timeScale().subscribeVisibleTimeRangeChange(() => {
        const timeRange = indicatorCharts.stochastic.timeScale().getVisibleRange();
        if (timeRange) {
            chart.timeScale().setVisibleRange(timeRange);
        }
    });
    
    // Update current value
    if (stochasticData.length > 0) {
        const lastValue = stochasticData[stochasticData.length - 1].value;
        document.getElementById('stochasticValue').textContent = lastValue.toFixed(2);
    }
}

// Add Momentum indicator in separate window
function addMomentum() {
    const momentumData = calculateMomentum(allData, 10);
    
    // Show Momentum window
    document.getElementById('momentumWindow').style.display = 'block';
    
    // Create Momentum chart
    indicatorCharts.momentum = createIndicatorChart('momentumChart', 'Momentum');
    
    // Add Momentum line
    indicators.momentum = indicatorCharts.momentum.addLineSeries({
        color: '#ffe66d',
        lineWidth: 2,
        priceFormat: {
            type: 'price',
            precision: 2,
        },
    });
    
    // Add zero line
    const momentumZero = indicatorCharts.momentum.addLineSeries({
        color: 'rgba(255, 230, 109, 0.4)',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
    });
    
    const zeroData = momentumData.map(point => ({ time: point.time, value: 0 }));
    momentumZero.setData(zeroData);
    indicators.momentum.setData(momentumData);
    
    // Sync with main chart
    indicatorCharts.momentum.timeScale().subscribeVisibleTimeRangeChange(() => {
        const timeRange = indicatorCharts.momentum.timeScale().getVisibleRange();
        if (timeRange) {
            chart.timeScale().setVisibleRange(timeRange);
        }
    });
    
    // Update current value
    if (momentumData.length > 0) {
        const lastValue = momentumData[momentumData.length - 1].value;
        document.getElementById('momentumValue').textContent = lastValue.toFixed(2) + '%';
    }
}

// Add MACD indicator in separate window
function addMACD() {
    const macdData = calculateMACD(allData, 12, 26, 9);
    
    // Show MACD window
    document.getElementById('macdWindow').style.display = 'block';
    
    // Create MACD chart
    indicatorCharts.macd = createIndicatorChart('macdChart', 'MACD');
    
    // Add MACD line
    indicators.macd.main = indicatorCharts.macd.addLineSeries({
        color: '#a8e6cf',
        lineWidth: 2,
        title: 'MACD',
        priceFormat: {
            type: 'price',
            precision: 4,
        },
    });
    
    // Add Signal line
    indicators.macd.signal = indicatorCharts.macd.addLineSeries({
        color: '#ff8a80',
        lineWidth: 1,
        title: 'Signal',
        priceFormat: {
            type: 'price',
            precision: 4,
        },
    });
    
    // Add zero line
    const macdZero = indicatorCharts.macd.addLineSeries({
        color: 'rgba(168, 230, 207, 0.4)',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
    });
    
    const zeroData = macdData.macd.map(point => ({ time: point.time, value: 0 }));
    macdZero.setData(zeroData);
    indicators.macd.main.setData(macdData.macd);
    indicators.macd.signal.setData(macdData.signal);
    
    // Sync with main chart
    indicatorCharts.macd.timeScale().subscribeVisibleTimeRangeChange(() => {
        const timeRange = indicatorCharts.macd.timeScale().getVisibleRange();
        if (timeRange) {
            chart.timeScale().setVisibleRange(timeRange);
        }
    });
    
    // Update current value
    if (macdData.macd.length > 0) {
        const lastValue = macdData.macd[macdData.macd.length - 1].value;
        document.getElementById('macdValue').textContent = lastValue.toFixed(4);
    }
}

// Add Complete Ichimoku Cloud
function addIchimoku() {
    const ichimokuData = calculateIchimoku(allData);
    
    // Tenkan-sen (Conversion Line) - 9 period
    indicators.ichimoku.tenkanSen = chart.addLineSeries({
        color: '#ff8a80',
        lineWidth: 1,
        title: 'Tenkan-sen',
    });
    
    // Kijun-sen (Base Line) - 26 period
    indicators.ichimoku.kijunSen = chart.addLineSeries({
        color: '#81c784',
        lineWidth: 1,
        title: 'Kijun-sen',
    });
    
    // Senkou Span A (Leading Span A)
    indicators.ichimoku.senkouSpanA = chart.addLineSeries({
        color: 'rgba(102, 187, 106, 0.3)',
        lineWidth: 1,
        title: 'Senkou Span A',
    });
    
    // Senkou Span B (Leading Span B)
    indicators.ichimoku.senkouSpanB = chart.addLineSeries({
        color: 'rgba(239, 83, 80, 0.3)',
        lineWidth: 1,
        title: 'Senkou Span B',
    });
    
    // Chikou Span (Lagging Span)
    indicators.ichimoku.chikouSpan = chart.addLineSeries({
        color: '#bb86fc',
        lineWidth: 1,
        title: 'Chikou Span',
    });
    
    // Set data for all Ichimoku lines
    indicators.ichimoku.tenkanSen.setData(ichimokuData.tenkanSen);
    indicators.ichimoku.kijunSen.setData(ichimokuData.kijunSen);
    indicators.ichimoku.senkouSpanA.setData(ichimokuData.senkouSpanA);
    indicators.ichimoku.senkouSpanB.setData(ichimokuData.senkouSpanB);
    indicators.ichimoku.chikouSpan.setData(ichimokuData.chikouSpan);
}

// Add EMA indicator (best setup: 12, 26, 50) - Overlay on main chart
function addEMA() {
    const ema12 = calculateEMA(allData, 12);
    const ema26 = calculateEMA(allData, 26);
    const ema50 = calculateEMA(allData, 50);
    
    // EMA 12 (fastest) - bright color
    indicators.ema.ema12 = chart.addLineSeries({
        color: '#bb86fc',
        lineWidth: 2,
        title: 'EMA 12',
    });
    
    // EMA 26 (medium) - medium color
    indicators.ema.ema26 = chart.addLineSeries({
        color: '#cf6679',
        lineWidth: 1.5,
        title: 'EMA 26',
    });
    
    // EMA 50 (slowest) - subtle color
    indicators.ema.ema50 = chart.addLineSeries({
        color: '#03dac6',
        lineWidth: 1,
        title: 'EMA 50',
    });
    
    indicators.ema.ema12.setData(ema12);
    indicators.ema.ema26.setData(ema26);
    indicators.ema.ema50.setData(ema50);
}

// Technical Analysis Calculation Functions

// Calculate RSI
function calculateRSI(data, period = 14) {
    const rsi = [];
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        
        if (i <= period) {
            if (change > 0) gains += change;
            else losses += Math.abs(change);
            
            if (i === period) {
                const avgGain = gains / period;
                const avgLoss = losses / period;
                const rs = avgGain / avgLoss;
                const rsiValue = 100 - (100 / (1 + rs));
                
                rsi.push({
                    time: data[i].time,
                    value: rsiValue
                });
            }
        } else {
            const prevAvgGain = gains / period;
            const prevAvgLoss = losses / period;
            
            const currentGain = change > 0 ? change : 0;
            const currentLoss = change < 0 ? Math.abs(change) : 0;
            
            const avgGain = ((prevAvgGain * (period - 1)) + currentGain) / period;
            const avgLoss = ((prevAvgLoss * (period - 1)) + currentLoss) / period;
            
            const rs = avgGain / avgLoss;
            const rsiValue = 100 - (100 / (1 + rs));
            
            rsi.push({
                time: data[i].time,
                value: rsiValue
            });
            
            gains = avgGain * period;
            losses = avgLoss * period;
        }
    }
    
    return rsi;
}

// Calculate Stochastic
function calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
    const stochastic = [];
    
    for (let i = kPeriod - 1; i < data.length; i++) {
        const slice = data.slice(i - kPeriod + 1, i + 1);
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        const close = data[i].close;
        
        const k = ((close - low) / (high - low)) * 100;
        
        stochastic.push({
            time: data[i].time,
            value: k
        });
    }
    
    return stochastic;
}

// Calculate Momentum
function calculateMomentum(data, period = 10) {
    const momentum = [];
    
    for (let i = period; i < data.length; i++) {
        const currentPrice = data[i].close;
        const pastPrice = data[i - period].close;
        const momentumValue = ((currentPrice - pastPrice) / pastPrice) * 100;
        
        momentum.push({
            time: data[i].time,
            value: momentumValue
        });
    }
    
    return momentum;
}

// Calculate MACD with Signal Line
function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const emaFast = calculateEMA(data, fastPeriod);
    const emaSlow = calculateEMA(data, slowPeriod);
    const macd = [];
    
    // Calculate MACD line (fast EMA - slow EMA)
    const startIndex = slowPeriod - 1;
    for (let i = startIndex; i < data.length; i++) {
        const fastValue = emaFast[i - startIndex].value;
        const slowValue = emaSlow[i - startIndex].value;
        
        macd.push({
            time: data[i].time,
            value: fastValue - slowValue
        });
    }
    
    // Calculate Signal line (EMA of MACD)
    const signal = calculateEMAFromValues(macd, signalPeriod);
    
    return { macd, signal };
}

// Calculate Stochastic with Slow %D
function calculateStochasticSlow(data, kPeriod = 14, dPeriod = 3, slowDPeriod = 3) {
    const stochastic = [];
    const kValues = [];
    
    // First calculate %K values
    for (let i = kPeriod - 1; i < data.length; i++) {
        const slice = data.slice(i - kPeriod + 1, i + 1);
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        const close = data[i].close;
        
        const k = ((close - low) / (high - low)) * 100;
        kValues.push({ time: data[i].time, value: k });
    }
    
    // Calculate %D (slow)
    for (let i = dPeriod - 1; i < kValues.length; i++) {
        const slice = kValues.slice(i - dPeriod + 1, i + 1);
        const avgK = slice.reduce((sum, item) => sum + item.value, 0) / dPeriod;
        
        stochastic.push({
            time: kValues[i].time,
            value: avgK
        });
    }
    
    return stochastic;
}

// Calculate MACD with Signal Line
function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const emaFast = calculateEMA(data, fastPeriod);
    const emaSlow = calculateEMA(data, slowPeriod);
    const macd = [];
    
    // Calculate MACD line (fast EMA - slow EMA)
    const startIndex = slowPeriod - 1;
    for (let i = startIndex; i < data.length; i++) {
        const fastValue = emaFast[i - startIndex].value;
        const slowValue = emaSlow[i - startIndex].value;
        
        macd.push({
            time: data[i].time,
            value: fastValue - slowValue
        });
    }
    
    // Calculate Signal line (EMA of MACD)
    const signal = calculateEMAFromValues(macd, signalPeriod);
    
    return { macd, signal };
}

// Calculate EMA from existing values (for MACD signal)
function calculateEMAFromValues(data, period) {
    const ema = [];
    const multiplier = 2 / (period + 1);
    let emaValue = data[0].value;
    
    ema.push({
        time: data[0].time,
        value: emaValue
    });
    
    for (let i = 1; i < data.length; i++) {
        emaValue = (data[i].value * multiplier) + (emaValue * (1 - multiplier));
        ema.push({
            time: data[i].time,
            value: emaValue
        });
    }
    
    return ema;
}

// Calculate Complete Ichimoku Cloud
function calculateIchimoku(data) {
    const tenkanSen = [];
    const kijunSen = [];
    const senkouSpanA = [];
    const senkouSpanB = [];
    const chikouSpan = [];
    
    // Tenkan-sen (Conversion Line) - 9 period
    for (let i = 8; i < data.length; i++) {
        const slice = data.slice(i - 8, i + 1);
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        const value = (high + low) / 2;
        
        tenkanSen.push({
            time: data[i].time,
            value: value
        });
    }
    
    // Kijun-sen (Base Line) - 26 period
    for (let i = 25; i < data.length; i++) {
        const slice = data.slice(i - 25, i + 1);
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        const value = (high + low) / 2;
        
        kijunSen.push({
            time: data[i].time,
            value: value
        });
    }
    
    // Senkou Span A (Leading Span A) - (Tenkan + Kijun) / 2, shifted 26 periods forward
    const startIndex = 25; // Start from where we have both Tenkan and Kijun
    for (let i = startIndex; i < data.length - 26; i++) {
        const tenkanValue = tenkanSen[i - 8] ? tenkanSen[i - 8].value : 0;
        const kijunValue = kijunSen[i - 25] ? kijunSen[i - 25].value : 0;
        const value = (tenkanValue + kijunValue) / 2;
        
        if (i + 26 < data.length) {
            senkouSpanA.push({
                time: data[i + 26].time,
                value: value
            });
        }
    }
    
    // Senkou Span B (Leading Span B) - 52 period high-low average, shifted 26 periods forward
    for (let i = 51; i < data.length - 26; i++) {
        const slice = data.slice(i - 51, i + 1);
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        const value = (high + low) / 2;
        
        if (i + 26 < data.length) {
            senkouSpanB.push({
                time: data[i + 26].time,
                value: value
            });
        }
    }
    
    // Chikou Span (Lagging Span) - Current close shifted 26 periods back
    for (let i = 26; i < data.length; i++) {
        chikouSpan.push({
            time: data[i - 26].time,
            value: data[i].close
        });
    }
    
    return { tenkanSen, kijunSen, senkouSpanA, senkouSpanB, chikouSpan };
}

// Calculate EMA
function calculateEMA(data, period) {
    const ema = [];
    const multiplier = 2 / (period + 1);
    let emaValue = data[0].close; // Start with first close price
    
    ema.push({
        time: data[0].time,
        value: emaValue
    });
    
    for (let i = 1; i < data.length; i++) {
        emaValue = (data[i].close * multiplier) + (emaValue * (1 - multiplier));
        ema.push({
            time: data[i].time,
            value: emaValue
        });
    }
    
    return ema;
}

// Hide loading indicator
function hideLoading() {
    const loadingElement = document.getElementById('chartLoading');
    if (loadingElement) {
        loadingElement.classList.add('hidden');
    }
}

// Show error message
function showError(message) {
    const loadingElement = document.getElementById('chartLoading');
    if (loadingElement) {
        loadingElement.innerHTML = `
            <div style="color: #e74c3c; text-align: center;">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Update table
    const tbody = document.getElementById('recentDataBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading" style="color: #e74c3c;">Failed to load data</td></tr>';

    // Update stats
    document.getElementById('totalRecords').textContent = 'Error';
    document.getElementById('lastUpdate').textContent = 'Error';
    document.getElementById('currentPrice').textContent = 'Error';
}

// Format number with thousands separator
function formatNumber(num) {
    if (typeof num === 'number') {
        return num.toLocaleString();
    }
    return num;
}

// Refresh data (can be called manually)
function refreshData() {
    document.getElementById('chartLoading').classList.remove('hidden');
    loadData();
}

// Export functions for external use
window.DollarRialChart = {
    refresh: refreshData,
    switchChart: switchChartType,
    getData: () => allData
};