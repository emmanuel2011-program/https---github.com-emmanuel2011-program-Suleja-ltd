'use client';

import { useEffect, useState } from 'react';
import { SunIcon, CloudIcon } from '@heroicons/react/24/outline';

export default function WeatherSnippet() {
  const [data, setData] = useState<{ temp: number; code: number } | null>(null);

  useEffect(() => {
    // Lat/Lon for Suleja
    fetch('https://api.open-meteo.com/v1/forecast?latitude=9.1758&longitude=7.1808&current=temperature_2m,weather_code')
      .then(res => res.json())
      .then(json => {
        setData({
          temp: Math.round(json.current.temperature_2m),
          code: json.current.weather_code
        });
      });
  }, []);

  if (!data) return <div className="w-12 h-4 bg-green-100 animate-pulse rounded" />;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/40 rounded-lg border border-green-100/50">
      {data.code < 3 ? (
        <SunIcon className="h-4 w-4 text-orange-500" />
      ) : (
        <CloudIcon className="h-4 w-4 text-blue-400" />
      )}
      <span className="text-xs font-bold text-green-800">{data.temp}°C</span>
    </div>
  );
}