// Bismillaahirrahmaanirrahiim

import { Grid } from '@mui/material';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
} from 'recharts';

interface PairChartsProps {
  data: any[];
}

export default function PairCharts(props: PairChartsProps) {
  const { data } = props;

  const dateFormatter = (value: Date) =>
    value.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'numeric',
    });

  const pctFormatter = (value: any) => value.toLocaleString() + '%';
  const usdFormatter = (value: any) => '$' + value.toLocaleString();

  const tooltipFormatter = (value: any, name: any) => {
    if (name === 'APR') return [pctFormatter(value), name];
    if (name === 'Total Value') return [usdFormatter(value), name];

    return [value, name];
  };

  return (
    <Grid container spacing={2} sx={{ my: 2 }}>
      <Grid item md={6} xs={12} sx={{ minHeight: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={dateFormatter} />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#82ca9d"
              tickFormatter={pctFormatter}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#8884d8"
              tickFormatter={usdFormatter}
            />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={(value: Date) => value.toDateString()}
              labelStyle={{
                color: '#1976D2',
              }}
            />
            <Legend />
            <Bar
              yAxisId="right"
              dataKey="Total Value"
              barSize={20}
              fill="url(#colorUv)"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="APR"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorPv)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Grid>
      <Grid item md={6} xs={12} sx={{ minHeight: '400px' }}>
        <ResponsiveContainer width="100%" height="50%">
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={dateFormatter} />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#82ca9d"
              tickFormatter={pctFormatter}
            />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={(value: Date) => value.toDateString()}
              labelStyle={{
                color: '#1976D2',
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="APR"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorPv)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height="50%">
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={dateFormatter} />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#8884d8"
              tickFormatter={usdFormatter}
            />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={(value: Date) => value.toDateString()}
              labelStyle={{
                color: '#8884d8',
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="Total Value"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Grid>
    </Grid>
  );
}
