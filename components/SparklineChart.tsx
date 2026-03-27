import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { Colors } from '../constants/theme';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
}

export default function SparklineChart({
  data,
  width = 300,
  height = 80,
  color = Colors.accent,
  filled = true,
}: SparklineChartProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 4;

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const fillPoints = `${padding},${height} ${points} ${width - padding},${height}`;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.2" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {filled && (
          <Polygon
            points={fillPoints}
            fill="url(#sparkFill)"
          />
        )}
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
