"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { passRateChartConfig, registrationsChartConfig } from "@/constants/admin";
import type { CoursePassRate, MonthlyRegistrations } from "@/types/admin";

interface DashboardChartsProps {
  registrations: MonthlyRegistrations[];
  passRates: CoursePassRate[];
}

export function DashboardCharts({ registrations, passRates }: DashboardChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>New enrollments per month, last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={registrationsChartConfig} className="h-64 w-full">
            <BarChart data={registrations} accessibilityLayer>
              <CartesianGrid vertical={false}/>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8}/>
              <YAxis tickLine={false} axisLine={false} width={32}/>
              <ChartTooltip content={<ChartTooltipContent/>}/>
              <Bar dataKey="registrations" fill="var(--color-registrations)" radius={6}/>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pass rate by course</CardTitle>
          <CardDescription>Share of submitted exams that passed, last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {passRates.length === 0 ? (
            <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">No exams submitted in the last 12 months.</p>
          ) : (
            <ChartContainer config={passRateChartConfig} className="h-64 w-full">
              <BarChart data={passRates} layout="vertical" accessibilityLayer margin={{ left: 8 }}>
                <CartesianGrid horizontal={false}/>
                <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} unit="%"/>
                <YAxis type="category" dataKey="course" tickLine={false} axisLine={false} width={88}/>
                <ChartTooltip content={<ChartTooltipContent/>}/>
                <Bar dataKey="passRate" unit="%" fill="var(--color-passRate)" radius={6}/>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
