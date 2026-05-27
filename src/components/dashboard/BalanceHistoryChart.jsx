import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { Skeleton } from "@/components/ui/skeleton";

const formatChartData = (history) => {
  if (!Array.isArray(history)) return [];
  return history
    .map((item) => ({
      time: item.date ?? item.time,
      value: item.balance ?? item.value ?? 0,
    }))
    .filter((d) => d.time)
    .sort((a, b) => (a.time > b.time ? 1 : -1));
};

export const BalanceHistoryChart = ({ data, isLoading }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chartData = formatChartData(data);
    if (!chartData.length) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: "solid", color: "transparent" },
        textColor: "rgba(255,255,255,0.45)",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.06)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.06)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    const series = chart.addAreaSeries({
      lineColor: "#173ded",
      topColor: "rgba(23,61,237,0.25)",
      bottomColor: "rgba(23,61,237,0)",
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });

    series.setData(chartData);
    chart.timeScale().fitContent();

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-full w-full rounded-lg min-h-56" />;
  }

  if (!data?.length) {
    return (
      <div className="h-full min-h-56 flex items-center justify-center text-sm text-muted-foreground">
        No balance history yet
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full min-h-56" />;
};
