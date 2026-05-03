// components/ChartPreview.tsx
import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, IChartApi } from 'lightweight-charts';
import axios from 'axios';

interface ChartPreviewProps {
  symbol: string;
  timeframe: string;
}

export default function ChartPreview({ symbol, timeframe }: ChartPreviewProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: 280,
      height: 120,
      layout: {
        background: { color: '#1a1f2e' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2e3d' },
        horzLines: { color: '#2a2e3d' },
      },
      timeScale: {
        visible: false,
      },
      rightPriceScale: {
        visible: false,
      },
      leftPriceScale: {
        visible: false,
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
    });

    chartRef.current = chart;

    // Add candlestick series - FIXED: Use CandlestickSeries
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Fetch historical data
    fetchChartData(symbol, timeframe).then(data => {
      candlestickSeries.setData(data);
      chart.timeScale().fitContent();
    });

    return () => {
      chart.remove();
    };
  }, [symbol, timeframe]);

  const fetchChartData = async (symbol: string, tf: string) => {
    try {
      const interval = getBinanceInterval(tf);
      
      const response = await axios.get(
        `https://api.binance.com/api/v3/klines`,
        {
          params: {
            symbol: `${symbol}USDT`,
            interval: interval,
            limit: 30,
          },
        }
      );

      const data = response.data.map((kline: any) => ({
        time: kline[0] / 1000,
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
      }));

      return data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return generateMockData();
    }
  };

  const getBinanceInterval = (timeframe: string): string => {
    const intervals: Record<string, string> = {
      '5M': '5m',
      '15M': '15m',
      '30M': '30m',
      '1H': '1h',
      '2H': '2h',
      '4H': '4h',
      '1D': '1d',
    };
    return intervals[timeframe] || '1h';
  };

  const generateMockData = () => {
    const data = [];
    let basePrice = 45000;
    for (let i = 0; i < 30; i++) {
      const change = (Math.random() - 0.5) * 200;
      basePrice += change;
      data.push({
        time: Math.floor(Date.now() / 1000) - (30 - i) * 300,
        open: basePrice - change / 2,
        high: basePrice + Math.abs(change),
        low: basePrice - Math.abs(change),
        close: basePrice,
      });
    }
    return data;
  };

  return (
    <div 
      ref={chartContainerRef} 
      className="w-[280px] h-[120px] rounded-lg overflow-hidden"
    />
  );
}