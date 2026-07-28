import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { getCategoryRevenueSeries } from "../../api/seller";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../../components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "../../components/ui/chart";
import { Skeleton } from "../../components/ui/Feedback";
import { cn } from "../../lib/cn";

const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" }
] as const;

const compactVnd = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1
});

const fullVnd = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

function formatDay(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function CategoryRevenueChart() {
  const [days, setDays] = useState<number>(30);

  const seriesQuery = useQuery({
    queryKey: ["seller", "category-revenue", days],
    queryFn: () => getCategoryRevenueSeries(days)
  });

  const series = seriesQuery.data;

  const chartConfig: ChartConfig = Object.fromEntries(
    (series?.categories ?? []).map((category, index) => [
      category.key,
      { label: category.nameVi, color: `var(--chart-${(index % 5) + 1})` }
    ])
  );

  const total = (series?.rows ?? []).reduce((sum, row) => {
    for (const category of series?.categories ?? []) sum += Number(row[category.key] ?? 0);
    return sum;
  }, 0);

  const hasData = !!series?.categories.length && total > 0;

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-wrap items-start gap-3 border-b border-hairline !py-5">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-[16px] font-semibold text-text">Revenue by category</CardTitle>
          <CardDescription className="text-[13px] text-text-muted">
            {hasData
              ? `${fullVnd.format(total)} across ${series.categories.length} categories`
              : "Cancelled orders are excluded"}
          </CardDescription>
        </div>

        <CardAction className="self-center">
          <div className="flex rounded-pill bg-ceramic p-0.5" role="group" aria-label="Time range">
            {RANGES.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => setDays(range.value)}
                aria-pressed={days === range.value}
                className={cn(
                  "rounded-pill px-3 py-1.5 text-[13px] font-semibold transition-colors duration-[120ms]",
                  days === range.value
                    ? "bg-surface text-action shadow-sm"
                    : "text-text-muted hover:text-text"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 py-5 sm:px-6">
        {seriesQuery.isPending ? (
          <Skeleton className="h-[260px] w-full rounded-card" />
        ) : seriesQuery.isError ? (
          <p className="flex h-[260px] items-center justify-center text-[14px] text-danger">
            {seriesQuery.error.message}
          </p>
        ) : !hasData ? (
          <p className="flex h-[260px] items-center justify-center text-[14px] text-text-muted">
            No revenue in this period yet.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <AreaChart data={series.rows} margin={{ left: 4, right: 8, top: 4 }}>
              <defs>
                {series.categories.map((category, index) => (
                  <linearGradient
                    key={category.key}
                    id={`fill-${category.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={`var(--chart-${(index % 5) + 1})`}
                      stopOpacity={0.75}
                    />
                    <stop
                      offset="95%"
                      stopColor={`var(--chart-${(index % 5) + 1})`}
                      stopOpacity={0.08}
                    />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid vertical={false} strokeOpacity={0.5} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                tickFormatter={formatDay}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickMargin={4}
                tickFormatter={(value: number) => compactVnd.format(value)}
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatDay(String(value))}
                    formatter={(value, name) => {
                      const key = String(name);
                      return (
                        <>
                          <span className="text-text-muted">{chartConfig[key]?.label ?? key}</span>
                          <span className="ml-auto font-medium text-text tabular-nums">
                            {fullVnd.format(Number(value))}
                          </span>
                        </>
                      );
                    }}
                    indicator="dot"
                  />
                }
              />

              {series.categories.map((category, index) => (
                <Area
                  key={category.key}
                  dataKey={category.key}
                  type="natural"
                  stackId="revenue"
                  fill={`url(#fill-${category.key})`}
                  stroke={`var(--chart-${(index % 5) + 1})`}
                  strokeWidth={2}
                />
              ))}

              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
