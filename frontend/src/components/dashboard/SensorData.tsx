import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const generateData = () => {
  const data = [];
  for (let i = 0; i < 20; i++) {
    const time = `${String(10).padStart(2, '0')}:${String(i).padStart(2, '0')}`;
    data.push({
      time,
      velocity: +(1 + Math.random() * 1.5).toFixed(1),
      proximity: +(0.5 + Math.random() * 3).toFixed(1),
      heading: +(Math.random() * 360).toFixed(0),
      cpu: +(30 + Math.random() * 40).toFixed(0),
      latency: +(5 + Math.random() * 25).toFixed(0),
    });
  }
  return data;
};

const SensorData: React.FC = () => {
  const [data, setData] = useState(generateData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newPoint = {
          time: `10:${String(prev.length).padStart(2, '0')}`,
          velocity: +(1 + Math.random() * 1.5).toFixed(1),
          proximity: +(0.5 + Math.random() * 3).toFixed(1),
          heading: +(Math.random() * 360).toFixed(0),
          cpu: +(30 + Math.random() * 40).toFixed(0),
          latency: +(5 + Math.random() * 25).toFixed(0),
        };
        return [...prev.slice(-19), newPoint];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface p-3.5 rounded-xl glow-border h-full">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={12} className="text-primary" />
        <h3 className="text-[9px] font-mono font-bold uppercase tracking-widest text-foreground">REAL_TIME SENSOR DATA</h3>
      </div>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.07)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="rgba(148, 163, 184, 0.4)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              fontFamily="Geist Mono"
            />
            <YAxis
              stroke="rgba(148, 163, 184, 0.4)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              fontFamily="Geist Mono"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#171921',
                border: '1px solid rgba(34, 211, 238, 0.2)',
                borderRadius: '8px',
                fontSize: '10px',
                fontFamily: 'Geist Mono, monospace',
              }}
              itemStyle={{ fontSize: '10px', fontFamily: 'Geist Mono, monospace' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '9px', fontFamily: 'Geist Mono, monospace' }}
              iconSize={8}
            />
            <Line type="monotone" dataKey="velocity" stroke="#22D3EE" strokeWidth={2} dot={false} name="Velocity" />
            <Line type="monotone" dataKey="proximity" stroke="#4ADE80" strokeWidth={2} dot={false} name="Proximity" />
            <Line type="monotone" dataKey="cpu" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="CPU Load" />
            <Line type="monotone" dataKey="latency" stroke="#F43F5E" strokeWidth={1.5} dot={false} name="Latency" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sensor Stats Row */}
      <div className="grid grid-cols-5 gap-1.5 mt-3">
        {[
          { label: 'VELOCITY', value: `${data[data.length - 1]?.velocity ?? 0}`, unit: 'm/s' },
          { label: 'PROXIMITY', value: `${data[data.length - 1]?.proximity ?? 0}`, unit: 'cm' },
          { label: 'HEADING', value: `${data[data.length - 1]?.heading ?? 0}`, unit: '°' },
          { label: 'CPU LOAD', value: `${data[data.length - 1]?.cpu ?? 0}`, unit: '%' },
          { label: 'LATENCY', value: `${data[data.length - 1]?.latency ?? 0}`, unit: 'ms' },
        ].map((stat) => (
          <div key={stat.label} className="bg-background rounded-lg p-1.5 text-center glow-border">
            <p className="text-[7px] font-mono text-muted-foreground uppercase">{stat.label}</p>
            <p className="text-xs font-mono font-bold text-foreground">{stat.value}<span className="text-[8px] text-muted-foreground ml-0.5">{stat.unit}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorData;
