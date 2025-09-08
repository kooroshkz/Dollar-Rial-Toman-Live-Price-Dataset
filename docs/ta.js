// Technical Analysis Module
// Implements Moving Average, RSI, and MACD indicators with speedometer visualizations

class TechnicalAnalysis {
    constructor() {
        this.currentTimeframe = 'week';
        this.indicators = {
            ma: { value: 0, signal: 'neutral' },
            rsi: { value: 50, signal: 'neutral' },
            macd: { value: 0, signal: 'neutral' }
        };
        this.oscillators = {};
        this.movingAverages = {};
        this.data = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSpeedometers();
    }

    setupEventListeners() {
        // Timeframe buttons
        const timeframeButtons = document.querySelectorAll('.timeframe-btn');
        timeframeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                timeframeButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTimeframe = e.target.getAttribute('data-timeframe');
                this.updateAnalysis();
            });
        });
    }

    // Test with sample data to verify calculations
    testCalculations() {
        console.log('Testing technical analysis calculations...');
        
        const testData = [
            { time: '2024-01-01', open: 100, high: 105, low: 95, close: 102 },
            { time: '2024-01-02', open: 102, high: 108, low: 100, close: 106 },
            { time: '2024-01-03', open: 106, high: 110, low: 104, close: 108 },
            { time: '2024-01-04', open: 108, high: 112, low: 106, close: 110 },
            { time: '2024-01-05', open: 110, high: 115, low: 108, close: 113 },
            { time: '2024-01-06', open: 113, high: 118, low: 111, close: 116 },
            { time: '2024-01-07', open: 116, high: 120, low: 114, close: 118 },
            { time: '2024-01-08', open: 118, high: 122, low: 116, close: 120 },
            { time: '2024-01-09', open: 120, high: 125, low: 118, close: 123 },
            { time: '2024-01-10', open: 123, high: 128, low: 121, close: 125 },
            { time: '2024-01-11', open: 125, high: 130, low: 123, close: 127 },
            { time: '2024-01-12', open: 127, high: 132, low: 125, close: 130 },
            { time: '2024-01-13', open: 130, high: 135, low: 128, close: 132 },
            { time: '2024-01-14', open: 132, high: 137, low: 130, close: 135 },
            { time: '2024-01-15', open: 135, high: 140, low: 133, close: 138 }
        ];
        
        console.log('Test data created:', testData.length, 'points');
        
        // Test RSI calculation
        const rsi = this.calculateRSI(testData);
        console.log('Test RSI:', rsi);
        
        // Test MA calculation
        const ma = this.calculateMovingAverage(testData, 10);
        console.log('Test MA:', ma);
        
        // Test MACD calculation
        const macd = this.calculateMACD(testData);
        console.log('Test MACD:', macd);
        
        return {
            rsi: rsi,
            ma: ma,
            macd: macd
        };
    }

    setData(data) {
        this.data = data;
        console.log('Setting data for technical analysis:', {
            length: data.length,
            sample: data.slice(0, 2),
            hasRequiredFields: data.length > 0 && data[0].close && data[0].high && data[0].low
        });
        this.updateAnalysis();
    }

    updateAnalysis() {
        if (this.data.length === 0) {
            console.log('No data available for technical analysis');
            return;
        }

        const periodData = this.getDataForTimeframe();
        if (periodData.length < 2) {
            console.log('Not enough data for analysis, need at least 2 data points');
            return;
        }

        console.log(`Analyzing ${periodData.length} data points for ${this.currentTimeframe} timeframe`);
        console.log('Sample data:', periodData.slice(0, 3));
        
        // Validate data structure
        const firstItem = periodData[0];
        if (!firstItem.close || !firstItem.high || !firstItem.low) {
            console.error('Invalid data structure:', firstItem);
            return;
        }

        // Calculate indicators
        try {
            this.calculateMovingAverage(periodData);
            this.calculateRSI(periodData);
            this.calculateMACD(periodData);
            
            // Calculate all oscillators and moving averages
            this.calculateAllOscillators(periodData);
            this.calculateAllMovingAverages(periodData);

            console.log('Indicators calculated:', {
                ma: this.indicators.ma,
                rsi: this.indicators.rsi,
                macd: this.indicators.macd
            });
            
            console.log('Sample oscillators:', Object.entries(this.oscillators).slice(0, 3));
            console.log('Sample moving averages:', Object.entries(this.movingAverages).slice(0, 3));

            // Update visualizations
            this.updateSpeedometers();
            this.updateIndicatorsSummary();
            this.updateOverallSignal();
        } catch (error) {
            console.error('Error in technical analysis calculation:', error);
        }
    }

    getDataForTimeframe() {
        if (this.data.length === 0) return [];
        
        // For simplicity, use recent data points based on timeframe
        let dataPoints;
        switch (this.currentTimeframe) {
            case 'day':
                dataPoints = Math.min(7, this.data.length); // Last week for daily analysis
                break;
            case 'week':
                dataPoints = Math.min(30, this.data.length); // Last 30 days for weekly analysis
                break;
            case 'month':
                dataPoints = Math.min(90, this.data.length); // Last 90 days for monthly analysis
                break;
            default:
                dataPoints = Math.min(30, this.data.length);
        }
        
        const result = this.data.slice(-dataPoints);
        console.log(`Getting ${dataPoints} data points for ${this.currentTimeframe} timeframe`);
        return result;
    }

    calculateMovingAverage(data) {
        if (data.length === 0) return;

        const prices = data.map(item => item.close);
        let period;
        
        // Determine period based on timeframe
        switch (this.currentTimeframe) {
            case 'day':
                period = Math.min(5, Math.max(3, Math.floor(data.length / 2)));
                break;
            case 'week':
                period = Math.min(10, Math.max(5, Math.floor(data.length / 2)));
                break;
            case 'month':
                period = Math.min(20, Math.max(10, Math.floor(data.length / 2)));
                break;
            default:
                period = Math.min(10, Math.max(5, Math.floor(data.length / 2)));
        }
        
        if (prices.length < period) {
            this.indicators.ma.value = prices[prices.length - 1];
            this.indicators.ma.signal = 'neutral';
            console.log('MA: Not enough data for period', period);
            return;
        }

        // Calculate Simple Moving Average
        const ma = prices.slice(-period).reduce((sum, price) => sum + price, 0) / period;
        const currentPrice = prices[prices.length - 1];
        
        this.indicators.ma.value = ma;
        
        // Simplified but effective signal logic
        const deviation = ((currentPrice - ma) / ma) * 100;
        
        console.log('MA calculation:', { currentPrice, ma, deviation, period });
        
        if (deviation > 0.5) {
            this.indicators.ma.signal = 'buy'; // Price above MA
        } else if (deviation < -0.5) {
            this.indicators.ma.signal = 'sell'; // Price below MA
        } else {
            this.indicators.ma.signal = 'neutral'; // Close to MA
        }
        
        console.log('MA result:', { value: this.indicators.ma.value, signal: this.indicators.ma.signal });
    }

    calculateRSI(data) {
        if (data.length < 15) {
            // Not enough data for proper RSI calculation
            this.indicators.rsi.value = 50;
            this.indicators.rsi.signal = 'neutral';
            console.log('RSI: Not enough data, using default values');
            return;
        }

        const prices = data.map(item => item.close);
        const period = 14;
        
        let gains = [];
        let losses = [];

        // Calculate price changes
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }

        // Calculate average gains and losses over the period
        const recentGains = gains.slice(-period);
        const recentLosses = losses.slice(-period);
        
        const avgGain = recentGains.reduce((sum, gain) => sum + gain, 0) / period;
        const avgLoss = recentLosses.reduce((sum, loss) => sum + loss, 0) / period;

        console.log('RSI calculation:', { avgGain, avgLoss, recentGains: recentGains.slice(-3), recentLosses: recentLosses.slice(-3) });

        if (avgLoss === 0) {
            this.indicators.rsi.value = 100;
        } else {
            const rs = avgGain / avgLoss;
            this.indicators.rsi.value = 100 - (100 / (1 + rs));
        }

        // Ensure RSI is within bounds
        this.indicators.rsi.value = Math.max(0, Math.min(100, this.indicators.rsi.value));

        // RSI signals with standard thresholds
        if (this.indicators.rsi.value >= 70) {
            this.indicators.rsi.signal = 'sell'; // Overbought
        } else if (this.indicators.rsi.value <= 30) {
            this.indicators.rsi.signal = 'buy'; // Oversold
        } else {
            this.indicators.rsi.signal = 'neutral'; // Normal range
        }
        
        console.log('RSI result:', { value: this.indicators.rsi.value, signal: this.indicators.rsi.signal });
    }

    calculateMACD(data) {
        if (data.length < 26) {
            this.indicators.macd.value = 0;
            this.indicators.macd.signal = 'neutral';
            console.log('MACD: Not enough data, need at least 26 points');
            return;
        }

        const prices = data.map(item => item.close);
        
        // Calculate EMAs
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        
        const macdLine = ema12 - ema26;
        this.indicators.macd.value = macdLine;

        console.log('MACD calculation:', { ema12, ema26, macdLine });

        // Simple but effective signal logic
        if (macdLine > 1000) { // Adjust threshold based on price scale
            this.indicators.macd.signal = 'buy';
        } else if (macdLine < -1000) {
            this.indicators.macd.signal = 'sell';
        } else {
            this.indicators.macd.signal = 'neutral';
        }
        
        console.log('MACD result:', { value: this.indicators.macd.value, signal: this.indicators.macd.signal });
    }

    calculateEMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1];
        
        const multiplier = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
        
        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
        }
        
        return ema;
    }

    // Calculate all oscillators
    calculateAllOscillators(data) {
        const prices = data.map(item => item.close);
        const highs = data.map(item => item.high);
        const lows = data.map(item => item.low);
        
        this.oscillators = {
            'Relative Strength Index (14)': this.calculateRSIIndicator(prices, 14),
            'Stochastic %K (14, 3, 3)': this.calculateStochastic(highs, lows, prices, 14, 3),
            'Commodity Channel Index (20)': this.calculateCCI(highs, lows, prices, 20),
            'Average Directional Index (14)': this.calculateADX(highs, lows, prices, 14),
            'Awesome Oscillator': this.calculateAwesomeOscillator(highs, lows),
            'Momentum (10)': this.calculateMomentum(prices, 10),
            'MACD Level (12, 26)': this.calculateMACDLevel(prices, 12, 26),
            'Stochastic RSI Fast (3, 3, 14, 14)': this.calculateStochRSI(prices, 14),
            'Williams Percent Range (14)': this.calculateWilliamsR(highs, lows, prices, 14),
            'Bull Bear Power': this.calculateBullBearPower(highs, lows, prices),
            'Ultimate Oscillator (7, 14, 28)': this.calculateUltimateOscillator(highs, lows, prices)
        };
    }

    // Calculate all moving averages
    calculateAllMovingAverages(data) {
        const prices = data.map(item => item.close);
        
        this.movingAverages = {
            'Exponential Moving Average (10)': this.calculateEMASignal(prices, 10),
            'Simple Moving Average (10)': this.calculateSMASignal(prices, 10),
            'Exponential Moving Average (20)': this.calculateEMASignal(prices, 20),
            'Simple Moving Average (20)': this.calculateSMASignal(prices, 20),
            'Exponential Moving Average (30)': this.calculateEMASignal(prices, 30),
            'Simple Moving Average (30)': this.calculateSMASignal(prices, 30),
            'Exponential Moving Average (50)': this.calculateEMASignal(prices, 50),
            'Simple Moving Average (50)': this.calculateSMASignal(prices, 50),
            'Exponential Moving Average (100)': this.calculateEMASignal(prices, 100),
            'Simple Moving Average (100)': this.calculateSMASignal(prices, 100),
            'Exponential Moving Average (200)': this.calculateEMASignal(prices, 200),
            'Simple Moving Average (200)': this.calculateSMASignal(prices, 200),
            'Ichimoku Base Line (9, 26, 52, 26)': this.calculateIchimoku(data),
            'Volume Weighted Moving Average (20)': this.calculateVWMA(data, 20),
            'Hull Moving Average (9)': this.calculateHMA(prices, 9)
        };
    }

    // Individual oscillator calculations
    calculateRSIIndicator(prices, period) {
        if (prices.length < period + 1) return { value: 50, signal: 'neutral' };
        
        let gains = [], losses = [];
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
        const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;
        
        const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
        
        let signal = 'neutral';
        if (rsi >= 70) signal = 'sell';
        else if (rsi <= 30) signal = 'buy';
        
        return { value: rsi.toFixed(1), signal };
    }

    calculateStochastic(highs, lows, closes, period, smooth) {
        if (highs.length < period) return { value: 50, signal: 'neutral' };
        
        const recentHighs = highs.slice(-period);
        const recentLows = lows.slice(-period);
        const currentClose = closes[closes.length - 1];
        
        const highestHigh = Math.max(...recentHighs);
        const lowestLow = Math.min(...recentLows);
        
        if (highestHigh === lowestLow) return { value: 50, signal: 'neutral' };
        
        const stochK = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
        
        let signal = 'neutral';
        if (stochK >= 80) signal = 'sell';
        else if (stochK <= 20) signal = 'buy';
        
        return { value: stochK.toFixed(1), signal };
    }

    calculateMomentum(prices, period) {
        if (prices.length < period + 1) return { value: 0, signal: 'neutral' };
        
        const momentum = prices[prices.length - 1] - prices[prices.length - 1 - period];
        const percentMomentum = (momentum / prices[prices.length - 1 - period]) * 100;
        
        let signal = 'neutral';
        if (percentMomentum > 1) signal = 'buy';
        else if (percentMomentum < -1) signal = 'sell';
        
        return { value: percentMomentum.toFixed(1), signal };
    }

    calculateCCI(highs, lows, closes, period) {
        if (highs.length < period) return { value: 0, signal: 'neutral' };
        
        const typicalPrices = [];
        for (let i = 0; i < closes.length; i++) {
            typicalPrices.push((highs[i] + lows[i] + closes[i]) / 3);
        }
        
        const recentTP = typicalPrices.slice(-period);
        const sma = recentTP.reduce((sum, tp) => sum + tp, 0) / period;
        const meanDeviation = recentTP.reduce((sum, tp) => sum + Math.abs(tp - sma), 0) / period;
        
        const cci = (typicalPrices[typicalPrices.length - 1] - sma) / (0.015 * meanDeviation);
        
        let signal = 'neutral';
        if (cci > 100) signal = 'sell';
        else if (cci < -100) signal = 'buy';
        
        return { value: cci.toFixed(1), signal };
    }

    calculateADX(highs, lows, closes, period) {
        if (highs.length < period + 1) return { value: 25, signal: 'neutral' };
        
        // Simplified ADX calculation
        let trSum = 0, dmPlusSum = 0, dmMinusSum = 0;
        
        for (let i = 1; i < Math.min(period + 1, highs.length); i++) {
            const tr = Math.max(
                highs[i] - lows[i],
                Math.abs(highs[i] - closes[i - 1]),
                Math.abs(lows[i] - closes[i - 1])
            );
            trSum += tr;
            
            const dmPlus = highs[i] - highs[i - 1] > lows[i - 1] - lows[i] ? Math.max(highs[i] - highs[i - 1], 0) : 0;
            const dmMinus = lows[i - 1] - lows[i] > highs[i] - highs[i - 1] ? Math.max(lows[i - 1] - lows[i], 0) : 0;
            
            dmPlusSum += dmPlus;
            dmMinusSum += dmMinus;
        }
        
        const adx = Math.abs((dmPlusSum - dmMinusSum) / (dmPlusSum + dmMinusSum)) * 100;
        
        let signal = 'neutral';
        if (adx > 25 && dmPlusSum > dmMinusSum) signal = 'buy';
        else if (adx > 25 && dmMinusSum > dmPlusSum) signal = 'sell';
        
        return { value: adx.toFixed(1), signal };
    }

    calculateAwesomeOscillator(highs, lows) {
        const medianPrices = highs.map((high, i) => (high + lows[i]) / 2);
        
        if (medianPrices.length < 34) return { value: 0, signal: 'neutral' };
        
        const sma5 = medianPrices.slice(-5).reduce((sum, price) => sum + price, 0) / 5;
        const sma34 = medianPrices.slice(-34).reduce((sum, price) => sum + price, 0) / 34;
        
        const ao = sma5 - sma34;
        
        let signal = 'neutral';
        if (ao > 0) signal = 'buy';
        else if (ao < 0) signal = 'sell';
        
        return { value: ao.toFixed(1), signal };
    }

    calculateMomentum(prices, period) {
        if (prices.length < period + 1) return { value: 0, signal: 'neutral' };
        
        const momentum = prices[prices.length - 1] - prices[prices.length - 1 - period];
        
        let signal = 'neutral';
        if (momentum > 0) signal = 'buy';
        else if (momentum < 0) signal = 'sell';
        
        return { value: momentum.toFixed(1), signal };
    }

    calculateMACDLevel(prices, fast, slow) {
        if (prices.length < slow) return { value: 0, signal: 'neutral' };
        
        const emaFast = this.calculateEMA(prices, fast);
        const emaSlow = this.calculateEMA(prices, slow);
        const macd = emaFast - emaSlow;
        
        // Scale the threshold based on the price level
        const priceLevel = prices[prices.length - 1];
        const threshold = priceLevel * 0.005; // 0.5% of current price
        
        let signal = 'neutral';
        if (macd > threshold) signal = 'buy';
        else if (macd < -threshold) signal = 'sell';
        
        return { value: macd.toFixed(1), signal };
    }

    calculateAwesomeOscillator(highs, lows) {
        const medianPrices = highs.map((high, i) => (high + lows[i]) / 2);
        
        if (medianPrices.length < 34) return { value: 0, signal: 'neutral' };
        
        const sma5 = medianPrices.slice(-5).reduce((sum, price) => sum + price, 0) / 5;
        const sma34 = medianPrices.slice(-34).reduce((sum, price) => sum + price, 0) / 34;
        
        const ao = sma5 - sma34;
        
        // Scale threshold based on price level
        const priceLevel = medianPrices[medianPrices.length - 1];
        const threshold = priceLevel * 0.002; // 0.2% of current price
        
        let signal = 'neutral';
        if (ao > threshold) signal = 'buy';
        else if (ao < -threshold) signal = 'sell';
        
        return { value: ao.toFixed(1), signal };
    }

    calculateStochRSI(prices, period) {
        if (prices.length < period + 1) return { value: 50, signal: 'neutral' };
        
        // Calculate RSI first
        const rsiValues = [];
        for (let i = period; i < prices.length; i++) {
            const subset = prices.slice(i - period, i + 1);
            let gains = 0, losses = 0;
            for (let j = 1; j < subset.length; j++) {
                const change = subset[j] - subset[j - 1];
                if (change > 0) gains += change;
                else losses -= change;
            }
            const avgGain = gains / period;
            const avgLoss = losses / period;
            const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
            rsiValues.push(rsi);
        }
        
        if (rsiValues.length < 14) return { value: 50, signal: 'neutral' };
        
        const recentRSI = rsiValues.slice(-14);
        const minRSI = Math.min(...recentRSI);
        const maxRSI = Math.max(...recentRSI);
        const currentRSI = rsiValues[rsiValues.length - 1];
        
        const stochRSI = ((currentRSI - minRSI) / (maxRSI - minRSI)) * 100;
        
        let signal = 'neutral';
        if (stochRSI >= 80) signal = 'sell';
        else if (stochRSI <= 20) signal = 'buy';
        
        return { value: stochRSI.toFixed(1), signal };
    }

    calculateWilliamsR(highs, lows, closes, period) {
        if (highs.length < period) return { value: -50, signal: 'neutral' };
        
        const recentHighs = highs.slice(-period);
        const recentLows = lows.slice(-period);
        const currentClose = closes[closes.length - 1];
        
        const highestHigh = Math.max(...recentHighs);
        const lowestLow = Math.min(...recentLows);
        
        const williamsR = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
        
        let signal = 'neutral';
        if (williamsR <= -80) signal = 'buy';
        else if (williamsR >= -20) signal = 'sell';
        
        return { value: williamsR.toFixed(1), signal };
    }

    calculateBullBearPower(highs, lows, closes) {
        if (closes.length < 13) return { value: 0, signal: 'neutral' };
        
        const ema13 = this.calculateEMA(closes, 13);
        const bullPower = highs[highs.length - 1] - ema13;
        const bearPower = lows[lows.length - 1] - ema13;
        
        const power = bullPower + bearPower;
        
        let signal = 'neutral';
        if (power > 0) signal = 'buy';
        else if (power < 0) signal = 'sell';
        
        return { value: power.toFixed(1), signal };
    }

    calculateUltimateOscillator(highs, lows, closes) {
        if (closes.length < 28) return { value: 50, signal: 'neutral' };
        
        // Simplified Ultimate Oscillator
        const periods = [7, 14, 28];
        let totalBP = 0, totalTR = 0;
        
        for (let period of periods) {
            let bp = 0, tr = 0;
            for (let i = Math.max(1, closes.length - period); i < closes.length; i++) {
                const currentClose = closes[i];
                const prevClose = closes[i - 1];
                const currentHigh = highs[i];
                const currentLow = lows[i];
                
                bp += currentClose - Math.min(currentLow, prevClose);
                tr += Math.max(currentHigh, prevClose) - Math.min(currentLow, prevClose);
            }
            totalBP += bp / period;
            totalTR += tr / period;
        }
        
        const uo = (totalBP / totalTR) * 100;
        
        let signal = 'neutral';
        if (uo >= 70) signal = 'sell';
        else if (uo <= 30) signal = 'buy';
        
        return { value: uo.toFixed(1), signal };
    }

    // Moving Average calculations
    calculateSMASignal(prices, period) {
        if (prices.length < period) return { value: prices[prices.length - 1].toFixed(1), signal: 'neutral' };
        
        const sma = prices.slice(-period).reduce((sum, price) => sum + price, 0) / period;
        const currentPrice = prices[prices.length - 1];
        
        const deviation = ((currentPrice - sma) / sma) * 100;
        
        let signal = 'neutral';
        if (deviation > 0.3) signal = 'buy';
        else if (deviation < -0.3) signal = 'sell';
        
        return { value: sma.toFixed(1), signal };
    }

    calculateEMASignal(prices, period) {
        if (prices.length < period) return { value: prices[prices.length - 1].toFixed(1), signal: 'neutral' };
        
        const ema = this.calculateEMA(prices, period);
        const currentPrice = prices[prices.length - 1];
        
        const deviation = ((currentPrice - ema) / ema) * 100;
        
        let signal = 'neutral';
        if (deviation > 0.3) signal = 'buy';
        else if (deviation < -0.3) signal = 'sell';
        
        return { value: ema.toFixed(1), signal };
    }

    calculateIchimoku(data) {
        if (data.length < 52) return { value: data[data.length - 1].close.toFixed(1), signal: 'neutral' };
        
        const highs = data.map(item => item.high);
        const lows = data.map(item => item.low);
        
        // Tenkan-sen (9-period)
        const tenkanHigh = Math.max(...highs.slice(-9));
        const tenkanLow = Math.min(...lows.slice(-9));
        const tenkan = (tenkanHigh + tenkanLow) / 2;
        
        // Kijun-sen (26-period)
        const kijunHigh = Math.max(...highs.slice(-26));
        const kijunLow = Math.min(...lows.slice(-26));
        const kijun = (kijunHigh + kijunLow) / 2;
        
        const currentPrice = data[data.length - 1].close;
        
        let signal = 'neutral';
        if (currentPrice > kijun && tenkan > kijun) signal = 'buy';
        else if (currentPrice < kijun && tenkan < kijun) signal = 'sell';
        
        return { value: kijun.toFixed(1), signal };
    }

    calculateVWMA(data, period) {
        if (data.length < period) return { value: data[data.length - 1].close.toFixed(1), signal: 'neutral' };
        
        const recentData = data.slice(-period);
        let totalPriceVolume = 0, totalVolume = 0;
        
        for (let item of recentData) {
            const volume = Math.abs(item.close - item.open); // Using price change as volume proxy
            totalPriceVolume += item.close * volume;
            totalVolume += volume;
        }
        
        const vwma = totalVolume > 0 ? totalPriceVolume / totalVolume : recentData[recentData.length - 1].close;
        const currentPrice = data[data.length - 1].close;
        
        let signal = 'neutral';
        if (currentPrice > vwma) signal = 'buy';
        else if (currentPrice < vwma) signal = 'sell';
        
        return { value: vwma.toFixed(1), signal };
    }

    calculateHMA(prices, period) {
        if (prices.length < period) return { value: prices[prices.length - 1].toFixed(1), signal: 'neutral' };
        
        // Simplified Hull Moving Average
        const wma1 = this.calculateWMA(prices, Math.floor(period / 2));
        const wma2 = this.calculateWMA(prices, period);
        const diff = 2 * wma1 - wma2;
        
        const hma = diff; // Simplified without final WMA smoothing
        const currentPrice = prices[prices.length - 1];
        
        let signal = 'neutral';
        if (currentPrice > hma) signal = 'buy';
        else if (currentPrice < hma) signal = 'sell';
        
        return { value: hma.toFixed(1), signal };
    }

    calculateWMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1];
        
        const recentPrices = prices.slice(-period);
        let weightedSum = 0, weightSum = 0;
        
        for (let i = 0; i < recentPrices.length; i++) {
            const weight = i + 1;
            weightedSum += recentPrices[i] * weight;
            weightSum += weight;
        }
        
        return weightedSum / weightSum;
    }

    initializeSpeedometers() {
        // Initialize with default neutral values
        this.drawSpeedometer('maSpeedometer', 50, 'neutral');
        this.drawSpeedometer('rsiSpeedometer', 50, 'neutral');
        this.drawSpeedometer('macdSpeedometer', 50, 'neutral');
        
        // Set default signals
        this.updateSignalDisplay('maSignal', 'neutral');
        this.updateSignalDisplay('rsiSignal', 'neutral');
        this.updateSignalDisplay('macdSignal', 'neutral');
        
        // Initialize overall signal
        const overallElement = document.getElementById('overallSignal');
        if (overallElement) {
            overallElement.className = 'signal-indicator neutral-signal';
            const signalTextElement = overallElement.querySelector('.signal-text');
            if (signalTextElement) {
                signalTextElement.textContent = 'CALCULATING...';
            }
        }
    }

    updateSpeedometers() {
        if (this.data.length === 0) return;
        
        const currentPrice = this.data[this.data.length - 1]?.close || 0;
        
        // Update MA speedometer
        let maSpeedometerValue;
        if (this.indicators.ma.signal === 'buy') {
            maSpeedometerValue = 80; // Point to buy zone
        } else if (this.indicators.ma.signal === 'sell') {
            maSpeedometerValue = 20; // Point to sell zone
        } else {
            maSpeedometerValue = 50; // Point to neutral zone
        }
        
        this.drawSpeedometer('maSpeedometer', maSpeedometerValue, this.indicators.ma.signal);
        this.updateSignalDisplay('maSignal', this.indicators.ma.signal);

        // Update RSI speedometer (RSI uses actual 0-100 value)
        const rsiValue = Math.max(0, Math.min(100, this.indicators.rsi.value));
        this.drawSpeedometer('rsiSpeedometer', rsiValue, this.indicators.rsi.signal);
        this.updateSignalDisplay('rsiSignal', this.indicators.rsi.signal);

        // Update MACD speedometer
        let macdSpeedometerValue;
        if (this.indicators.macd.signal === 'buy') {
            macdSpeedometerValue = 80; // Point to buy zone
        } else if (this.indicators.macd.signal === 'sell') {
            macdSpeedometerValue = 20; // Point to sell zone
        } else {
            macdSpeedometerValue = 50; // Point to neutral zone
        }
        
        this.drawSpeedometer('macdSpeedometer', macdSpeedometerValue, this.indicators.macd.signal);
        this.updateSignalDisplay('macdSignal', this.indicators.macd.signal);
    }

    drawSpeedometer(canvasId, value, signal) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height - 40; // More space for labels
        const radius = 70;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#21262d';
        ctx.stroke();
        
        // Draw colored sections - different zones for different indicators
        if (canvasId === 'rsiSpeedometer') {
            // RSI: 0-30 = Oversold (Buy), 30-70 = Neutral, 70-100 = Overbought (Sell)
            this.drawSpeedometerSection(ctx, centerX, centerY, radius, 0, 30, '#56d364'); // Buy zone (green) - Oversold
            this.drawSpeedometerSection(ctx, centerX, centerY, radius, 30, 70, '#f8c555'); // Neutral zone (yellow)
            this.drawSpeedometerSection(ctx, centerX, centerY, radius, 70, 100, '#f85149'); // Sell zone (red) - Overbought
        } else {
            // For MA and MACD: Traditional layout
            this.drawSpeedometerSection(ctx, centerX, centerY, radius, 0, 33, '#f85149'); // Sell zone (red)
            this.drawSpeedometerSection(ctx, centerX, centerY, radius, 33, 67, '#f8c555'); // Neutral zone (yellow)  
            this.drawSpeedometerSection(ctx, centerX, centerY, radius, 67, 100, '#56d364'); // Buy zone (green)
        }
        
        // Draw needle - use the value directly for RSI, or map signal to zone for others
        let needleValue = value;
        if (canvasId !== 'rsiSpeedometer') {
            // For MA and MACD, use signal-based positioning
            if (signal === 'sell') {
                needleValue = 16; // Point to sell zone
            } else if (signal === 'buy') {
                needleValue = 84; // Point to buy zone  
            } else {
                needleValue = 50; // Point to neutral zone
            }
        }
        
        const angle = Math.PI + (Math.PI * (needleValue / 100));
        const needleLength = radius - 10;
        
        // Needle color based on signal
        let needleColor = '#58a6ff';
        if (signal === 'buy') needleColor = '#56d364';
        else if (signal === 'sell') needleColor = '#f85149';
        else if (signal === 'neutral') needleColor = '#f8c555';
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * needleLength,
            centerY + Math.sin(angle) * needleLength
        );
        ctx.lineWidth = 4;
        ctx.strokeStyle = needleColor;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = needleColor;
        ctx.fill();
        ctx.strokeStyle = '#0d1117';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw value labels with better spacing and positioning
        ctx.fillStyle = '#8b949e';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        
        if (canvasId === 'rsiSpeedometer') {
            // Clean RSI layout - just numbers at bottom and simple zone labels
            ctx.fillText('0', centerX - radius + 20, centerY + 35);
            ctx.fillText('50', centerX, centerY + 35);
            ctx.fillText('100', centerX + radius - 20, centerY + 35);
            
            // Simple zone labels positioned cleanly below the arc
            ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
            
            // BUY zone (left)
            ctx.fillStyle = '#56d364';
            ctx.fillText('BUY', centerX - 50, centerY + 20);
            
            // NEUTRAL zone (center) 
            ctx.fillStyle = '#f8c555';
            ctx.fillText('NEUTRAL', centerX, centerY + 20);
            
            // SELL zone (right)
            ctx.fillStyle = '#f85149';
            ctx.fillText('SELL', centerX + 50, centerY + 20);
            
        } else {
            // For MA and MACD speedometers - more spaced bottom labels
            ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
            ctx.textAlign = 'center';
            
            ctx.fillStyle = '#f85149';
            ctx.fillText('SELL', centerX - 60, centerY + 35);
            
            ctx.fillStyle = '#f8c555';
            ctx.fillText('NEUTRAL', centerX, centerY + 35);
            
            ctx.fillStyle = '#56d364';
            ctx.fillText('BUY', centerX + 60, centerY + 35);
        }
    }

    drawSpeedometerSection(ctx, centerX, centerY, radius, startPercent, endPercent, color) {
        const startAngle = Math.PI + (Math.PI * (startPercent / 100));
        const endAngle = Math.PI + (Math.PI * (endPercent / 100));
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineWidth = 12;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    updateSignalDisplay(elementId, signal) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.className = `indicator-signal ${signal}`;
        element.textContent = signal.toUpperCase();
    }

    updateIndicatorsSummary() {
        this.updateOscillatorsDisplay();
        this.updateMovingAveragesDisplay();
    }

    updateOscillatorsDisplay() {
        const oscillatorsList = document.getElementById('oscillatorsList');
        const oscillatorsSignal = document.getElementById('oscillatorsSignal');
        const oscillatorsCount = document.getElementById('oscillatorsCount');
        const showMoreBtn = document.getElementById('showMoreOscillators');
        
        if (!oscillatorsList) return;
        
        // Count signals
        let buyCount = 0, sellCount = 0, neutralCount = 0;
        const oscillatorEntries = Object.entries(this.oscillators);
        
        oscillatorEntries.forEach(([name, data]) => {
            if (data.signal === 'buy') buyCount++;
            else if (data.signal === 'sell') sellCount++;
            else neutralCount++;
        });
        
        // Update summary signal
        let overallSignal = 'neutral';
        if (buyCount > sellCount && buyCount > neutralCount) overallSignal = 'buy';
        else if (sellCount > buyCount && sellCount > neutralCount) overallSignal = 'sell';
        
        oscillatorsSignal.className = `summary-signal ${overallSignal}-summary`;
        oscillatorsSignal.querySelector('.signal-text').textContent = overallSignal.toUpperCase();
        oscillatorsCount.textContent = `${buyCount} Buy, ${sellCount} Sell, ${neutralCount} Neutral`;
        
        // Create indicator items
        oscillatorsList.innerHTML = '';
        oscillatorEntries.forEach(([name, data], index) => {
            const item = document.createElement('div');
            item.className = `indicator-item ${index >= 3 ? 'hidden' : ''}`;
            item.innerHTML = `
                <span class="indicator-name">${name}</span>
                <span class="indicator-value">${data.value}</span>
                <span class="indicator-action ${data.signal}">${data.signal.toUpperCase()}</span>
            `;
            oscillatorsList.appendChild(item);
        });
        
        // Show/hide "Show More" button
        if (oscillatorEntries.length > 3) {
            showMoreBtn.style.display = 'block';
            showMoreBtn.onclick = () => this.toggleShowMore('oscillators');
        } else {
            showMoreBtn.style.display = 'none';
        }
    }

    updateMovingAveragesDisplay() {
        const maList = document.getElementById('movingAveragesList');
        const maSignal = document.getElementById('movingAveragesSignal');
        const maCount = document.getElementById('movingAveragesCount');
        const showMoreBtn = document.getElementById('showMoreMA');
        
        if (!maList) return;
        
        // Count signals
        let buyCount = 0, sellCount = 0, neutralCount = 0;
        const maEntries = Object.entries(this.movingAverages);
        
        maEntries.forEach(([name, data]) => {
            if (data.signal === 'buy') buyCount++;
            else if (data.signal === 'sell') sellCount++;
            else neutralCount++;
        });
        
        // Update summary signal
        let overallSignal = 'neutral';
        if (buyCount > sellCount && buyCount > neutralCount) overallSignal = 'buy';
        else if (sellCount > buyCount && sellCount > neutralCount) overallSignal = 'sell';
        
        maSignal.className = `summary-signal ${overallSignal}-summary`;
        maSignal.querySelector('.signal-text').textContent = overallSignal.toUpperCase();
        maCount.textContent = `${buyCount} Buy, ${sellCount} Sell, ${neutralCount} Neutral`;
        
        // Create indicator items
        maList.innerHTML = '';
        maEntries.forEach(([name, data], index) => {
            const item = document.createElement('div');
            item.className = `indicator-item ${index >= 3 ? 'hidden' : ''}`;
            item.innerHTML = `
                <span class="indicator-name">${name}</span>
                <span class="indicator-value">${data.value}</span>
                <span class="indicator-action ${data.signal}">${data.signal.toUpperCase()}</span>
            `;
            maList.appendChild(item);
        });
        
        // Show/hide "Show More" button
        if (maEntries.length > 3) {
            showMoreBtn.style.display = 'block';
            showMoreBtn.onclick = () => this.toggleShowMore('movingAverages');
        } else {
            showMoreBtn.style.display = 'none';
        }
    }

    toggleShowMore(type) {
        const prefix = type === 'oscillators' ? 'oscillators' : 'movingAverages';
        const list = document.getElementById(`${prefix === 'oscillators' ? 'oscillatorsList' : 'movingAveragesList'}`);
        const btn = document.getElementById(`${prefix === 'oscillators' ? 'showMoreOscillators' : 'showMoreMA'}`);
        
        if (!list || !btn) return;
        
        const hiddenItems = list.querySelectorAll('.indicator-item.hidden');
        const isExpanded = hiddenItems.length === 0;
        
        if (isExpanded) {
            // Collapse - hide items after index 2
            const allItems = list.querySelectorAll('.indicator-item');
            allItems.forEach((item, index) => {
                if (index >= 3) {
                    item.classList.add('hidden');
                }
            });
            btn.textContent = 'Show More';
        } else {
            // Expand - show all items
            hiddenItems.forEach(item => {
                item.classList.remove('hidden');
            });
            btn.textContent = 'Show Less';
        }
    }

    updateOverallSignal() {
        const signals = [this.indicators.ma.signal, this.indicators.rsi.signal, this.indicators.macd.signal];
        const buyCount = signals.filter(s => s === 'buy').length;
        const sellCount = signals.filter(s => s === 'sell').length;
        
        let overallSignal, signalText, strength;
        
        if (buyCount >= 2) {
            overallSignal = 'buy-signal';
            signalText = 'BUY';
            strength = (buyCount / 3) * 100;
        } else if (sellCount >= 2) {
            overallSignal = 'sell-signal';
            signalText = 'SELL';
            strength = (sellCount / 3) * 100;
        } else {
            overallSignal = 'neutral-signal';
            signalText = 'NEUTRAL';
            strength = 50;
        }
        
        const overallElement = document.getElementById('overallSignal');
        const strengthElement = document.getElementById('signalStrength');
        
        if (overallElement && strengthElement) {
            overallElement.className = `signal-indicator ${overallSignal}`;
            const signalTextElement = overallElement.querySelector('.signal-text');
            if (signalTextElement) {
                signalTextElement.textContent = signalText;
            }
            
            // Set CSS custom property for the strength animation
            strengthElement.style.setProperty('--strength-width', `${strength}%`);
            
            // Also set the width directly as a fallback
            const afterElement = strengthElement.style;
            afterElement.width = `${strength}%`;
        }
    }

    formatNumber(num) {
        if (typeof num === 'number') {
            return num.toLocaleString();
        }
        return num;
    }
}

// Initialize Technical Analysis when DOM is loaded
let technicalAnalysis;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing technical analysis...');
    
    // Initialize immediately
    technicalAnalysis = new TechnicalAnalysis();
    window.technicalAnalysis = technicalAnalysis;
    
    // Add test function to window for debugging
    window.testTA = () => technicalAnalysis.testCalculations();
    
    // Wait a bit to ensure the main script has loaded data
    setTimeout(() => {
        console.log('Checking for data...');
        
        // If data is already available from the main script
        if (window.DollarRialChart && window.DollarRialChart.getData) {
            const data = window.DollarRialChart.getData();
            console.log('Found data from DollarRialChart:', data.length);
            if (data && data.length > 0) {
                technicalAnalysis.setData(data);
            }
        }
        
        // Also check if allData is available globally
        if (window.allData && window.allData.length > 0) {
            console.log('Found global allData:', window.allData.length);
            technicalAnalysis.setData(window.allData);
        }
        
        // If still no data, try again later
        if ((!window.allData || window.allData.length === 0) && 
            (!window.DollarRialChart || !window.DollarRialChart.getData || window.DollarRialChart.getData().length === 0)) {
            console.log('No data found, will retry...');
            setTimeout(() => {
                if (window.allData && window.allData.length > 0) {
                    console.log('Data found on retry:', window.allData.length);
                    technicalAnalysis.setData(window.allData);
                }
            }, 3000);
        }
    }, 1000);
});

// Export for external use
window.TechnicalAnalysis = TechnicalAnalysis;
