import { useEffect, useRef } from "react";
import { createChart, ColorType, AreaSeries } from "lightweight-charts";
import { TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { TV_COLORS } from "@/lib/chartColors";
import { Skeleton } from "@/components/ui/skeleton";

const PERIODS = [
  { label: "Today", value: "today" },
  { label: "1W",    value: "1w"    },
  { label: "1M",    value: "1m"    },
  { label: "3M",    value: "3m"    },
  { label: "All",   value: "all"   },
];

export const BalanceHistoryWidget = ({ data, isLoading, onPeriodChange, period = "1m" }) => {
  const containerRef = useRef(null);
  const chartRef     = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width:  containerRef.current.clientWidth,
      height: 240,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor:  TV_COLORS.text,
      },
      grid: {
        vertLines: { color: TV_COLORS.grid },
        horzLines: { color: TV_COLORS.grid },
      },
      crosshair: {
        vertLine: { color: TV_COLORS.crosshair, labelBackgroundColor: "#1e293b" },
        horzLine: { color: TV_COLORS.crosshair, labelBackgroundColor: "#1e293b" },
      },
      rightPriceScale: { borderColor: TV_COLORS.border, textColor: TV_COLORS.text },
      timeScale: {
        borderColor:    TV_COLORS.border,
        textColor:      TV_COLORS.text,
        timeVisible:    true,
        secondsVisible: false,
        fixLeftEdge:    true,
        fixRightEdge:   true,
      },
      handleScroll: true,
      handleScale:  true,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor:               TV_COLORS.neutral,
      topColor:                TV_COLORS.neutralArea,
      bottomColor:             "rgba(23,61,237,0)",
      lineWidth:               2,
      crosshairMarkerVisible:  true,
      crosshairMarkerRadius:   4,
      crosshairMarkerBorderColor:     TV_COLORS.neutral,
      crosshairMarkerBackgroundColor: TV_COLORS.neutral,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    });

    chartRef.current = { chart, series };

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current?.series || !Array.isArray(data) || !data.length) return;

    const formatted = data
      .map((pt) => ({
        time:  new Date(pt.date ?? pt.time).toISOString().split("T")[0],
        value: Number(pt.balanceAfter ?? pt.balance ?? pt.value ?? 0),
      }))
      .filter((d) => d.time)
      .sort((a, b) => (a.time > b.time ? 1 : -1));

    if (!formatted.length) return;

    chartRef.current.series.setData(formatted);
    chartRef.current.chart.timeScale().fitContent();
  }, [data]);

  if (isLoading) return <WidgetSkeleton size="large" />;

  return (
    <div className="trading-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Balance History
          </p>
        </div>
        {onPeriodChange && (
          <Tabs value={period} onValueChange={onPeriodChange}>
            <TabsList className="h-7 bg-muted/50">
              {PERIODS.map((p) => (
                <TabsTrigger key={p.value} value={p.value} className="h-5 px-2.5 text-xs">
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      {!data?.length ? (
        <div className="h-60 flex flex-col items-center justify-center text-center space-y-1">
          <p className="text-sm text-muted-foreground">No balance history yet</p>
          <p className="text-xs text-muted-foreground">
            Add transactions to see your balance grow over time
          </p>
        </div>
      ) : (
        <div ref={containerRef} style={{ width: "100%", height: 240 }} />
      )}
    </div>
  );
};
