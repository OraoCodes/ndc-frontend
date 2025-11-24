"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartData {
    name: string
    value: number
}

interface RegionalAnalysisChartProps {
    title: string
    data: ChartData[]
    type?: "water" | "waste"
}

const waterChartData = [
    { name: "Governance", value: 20 },
    { name: "MRV", value: 8 },
    { name: "Mitigation", value: 15 },
    { name: "Adaptation", value: 20 },
    { name: "Finance & Tech", value: 20 },
]

const wasteChartData = [
    { name: "Governance", value: 12 },
    { name: "MRV", value: 18 },
    { name: "Mitigation", value: 14 },
    { name: "Adaptation", value: 16 },
    { name: "Finance & Tech", value: 10 },
]

const colorPalette = ["#2563eb", "#eab308", "#a855f7", "#16a34a", "#06b6d4"]

export function RegionalAnalysisChart({ title, type = "water" }: RegionalAnalysisChartProps) {
    const data = type === "water" ? waterChartData : wasteChartData

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fontSize: 12 }} label={{ value: "Average Score (%)", angle: -90, position: "insideLeft" }} />
                        <Tooltip
                            formatter={(value) => `${value}%`}
                            contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #d1d5db" }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
