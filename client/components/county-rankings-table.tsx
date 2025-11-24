"use client"

import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CountyData {
    rank: number
    county: string
    water?: number
    wasteMgt?: number
    avgScore: number
    performance: "Outstanding" | "Satisfactory" | "Good" | "Average" | "Poor"
    governance?: number
    mrv?: number
    mitigation?: number
    adaptation?: number
    finance?: number
    indexScore?: number
}

interface CountyRankingsTableProps {
    title: string
    data: CountyData[]
    showDetailedColumns?: boolean
    type?: "basic" | "detailed"
}

const performanceColors = {
    Outstanding: "bg-green-500 text-white",
    Satisfactory: "bg-emerald-600 text-white",
    Good: "bg-yellow-400 text-black",
    Average: "bg-orange-500 text-white",
    Poor: "bg-red-500 text-white",
}

export function CountyRankingsTable({
    title,
    data,
    showDetailedColumns = false,
    type = "basic",
}: CountyRankingsTableProps) {
    return (
        <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-lg text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">Complete performance and indicators</p>
                </div>
                <Select defaultValue="2025">
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2025">Year 2025</SelectItem>
                        <SelectItem value="2024">Year 2024</SelectItem>
                        <SelectItem value="2023">Year 2023</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-slate-50">
                            <th className="px-4 py-3 text-left font-semibold">Rank</th>
                            <th className="px-4 py-3 text-left font-semibold">County</th>
                            {type === "basic" && (
                                <>
                                    <th className="px-4 py-3 text-center font-semibold">Water</th>
                                    <th className="px-4 py-3 text-center font-semibold">Waste Mgt</th>
                                    <th className="px-4 py-3 text-center font-semibold">Avg Score</th>
                                </>
                            )}
                            {type === "detailed" && (
                                <>
                                    <th className="px-4 py-3 text-center font-semibold">Governance</th>
                                    <th className="px-4 py-3 text-center font-semibold">MRV</th>
                                    <th className="px-4 py-3 text-center font-semibold">Mitigation</th>
                                    <th className="px-4 py-3 text-center font-semibold">Adaptation</th>
                                    <th className="px-4 py-3 text-center font-semibold">Finance & Tech</th>
                                    <th className="px-4 py-3 text-center font-semibold">Index Score</th>
                                </>
                            )}
                            <th className="px-4 py-3 text-center font-semibold">Performance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={idx} className="border-b border-border hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-semibold text-foreground">{row.rank}</td>
                                <td className="px-4 py-3">
                                    <a href="#" className="underline text-primary hover:text-primary/80">
                                        {row.county}
                                    </a>
                                </td>
                                {type === "basic" && (
                                    <>
                                        <td className="px-4 py-3 text-center">{row.water}</td>
                                        <td className="px-4 py-3 text-center">{row.wasteMgt}</td>
                                        <td className="px-4 py-3 text-center font-semibold">{row.avgScore}</td>
                                    </>
                                )}
                                {type === "detailed" && (
                                    <>
                                        <td className="px-4 py-3 text-center">{row.governance}</td>
                                        <td className="px-4 py-3 text-center">{row.mrv}</td>
                                        <td className="px-4 py-3 text-center">{row.mitigation}</td>
                                        <td className="px-4 py-3 text-center">{row.adaptation}</td>
                                        <td className="px-4 py-3 text-center">{row.finance}</td>
                                        <td className="px-4 py-3 text-center font-semibold">{row.indexScore}</td>
                                    </>
                                )}
                                <td className="px-4 py-3 text-center">
                                    <Badge className={`${performanceColors[row.performance]} rounded-full px-3`}>{row.performance}</Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
