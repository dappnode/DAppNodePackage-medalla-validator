import React from "react";
import { useTheme } from "@material-ui/core/styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
} from "recharts";
import { Title } from "./Title";

const data = [
  ["00:00", 32],
  ["03:00", 32.1],
  ["06:00", 32.14],
  ["09:00", 32.05],
  ["12:00", 32.18],
  ["15:00", 32.2],
  ["18:00", 32.33],
  ["21:00", 32.4],
  ["24:00", undefined],
].map(([time, amount]) => ({ time, amount }));

export function Chart() {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Title>Total balance</Title>
      <ResponsiveContainer minHeight={240}>
        <LineChart
          data={data}
          margin={{ top: 16, right: 16, bottom: 0, left: 24 }}
        >
          <XAxis dataKey="time" stroke={theme.palette.text.secondary} />
          <YAxis
            stroke={theme.palette.text.secondary}
            domain={["auto", "auto"]}
          >
            <Label
              angle={270}
              position="left"
              style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
            >
              balance (ETH)
            </Label>
          </YAxis>
          <Line
            type="monotone"
            dataKey="amount"
            stroke={theme.palette.primary.main}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
}
