"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getCountyRankingsByThematicArea } from "@/lib/supabase-api"
import { Loader2 } from "lucide-react"

interface RankingData {
    rank: number
    county: string
    water: number
    wasteMgt: number
    avgScore: number
    performance: string
}

const performanceColors = {
    Outstanding: "bg-green-600",
    Satisfactory: "bg-emerald-600",
    Good: "bg-yellow-400 text-black",
    Average: "bg-orange-500",
    Poor: "bg-red-500",
}

// Mobile card view
const CardView = ({ data }: { data: RankingData[] }) => (
    <div className="md:hidden space-y-4">
        {data.map((row) => (
            <div key={row.rank} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{row.rank}. {row.county}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${performanceColors[row.performance as keyof typeof performanceColors]}`}>
                        {row.performance}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Water:</span> <span>{row.water}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Waste Mgt:</span> <span>{row.wasteMgt}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Avg Score:</span> <span className="font-semibold">{row.avgScore}</span></div>
                </div>
            </div>
        ))}
    </div>
)

interface ThematicAreaRankingsProps {
    thematicAreaName: string
    loading?: boolean
    data?: RankingData[]
    error?: string | null
}

export function ThematicAreaRankings({ thematicAreaName, loading, data, error }: ThematicAreaRankingsProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500">
                <p>Error loading rankings: {error}</p>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No performance data available for {thematicAreaName} yet.</p>
                <p className="text-sm mt-2">Check back later for updates.</p>
            </div>
        )
    }

    return (
        <>
            {/* Mobile Card View */}
            <CardView data={data} />
            
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block bg-white rounded-lg border border-border overflow-hidden">
                <div className="">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr className="border-b">
                                <th className="px-4 py-3 text-left font-semibold">Rank</th>
                                <th className="px-4 py-3 text-left font-semibold">County</th>
                                <th className="px-4 py-3 text-center font-semibold">Water</th>
                                <th className="px-4 py-3 text-center font-semibold">Waste Mgt</th>
                                <th className="px-4 py-3 text-center font-semibold">Avg Score</th>
                                <th className="px-4 py-3 text-center font-semibold">Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row) => (
                                <tr key={row.rank} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium">{row.rank}</td>
                                    <td className="px-4 py-3">
                                        <Link 
                                            to={`/county/${row.county.toLowerCase().replace(/\s+/g, "-")}`}
                                            className="text-primary hover:underline font-medium"
                                        >
                                            {row.county}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-center">{row.water}</td>
                                    <td className="px-4 py-3 text-center">{row.wasteMgt}</td>
                                    <td className="px-4 py-3 text-center font-bold">{row.avgScore}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
                                            row.performance === "Outstanding" ? "bg-green-600" :
                                            row.performance === "Satisfactory" ? "bg-emerald-600" :
                                            row.performance === "Good" ? "bg-yellow-400 text-black" :
                                            row.performance === "Average" ? "bg-orange-500" :
                                            "bg-red-500"
                                        }`}>
                                            {row.performance}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}




