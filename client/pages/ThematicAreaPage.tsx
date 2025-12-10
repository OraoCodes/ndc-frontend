"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { listThematicAreas, listIndicators, getCountySummaryPerformance, type ThematicArea, type Indicator } from "@/lib/supabase-api"
import { Loader2 } from "lucide-react"

export default function ThematicAreaPage() {
    const { thematicAreaSlug } = useParams<{ thematicAreaSlug: string }>()
    const [thematicArea, setThematicArea] = useState<ThematicArea | null>(null)
    const [indicators, setIndicators] = useState<Indicator[]>([])
    const [countyData, setCountyData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"water" | "waste">("water")

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                
                // Get all thematic areas
                const areas = await listThematicAreas()
                
                // Find thematic area by slug (convert slug back to name)
                const areaNameMap: Record<string, string> = {
                    'governance-and-policy-framework': 'Governance & Policy Framework',
                    'governance': 'Governance & Policy Framework',
                    'mrv': 'MRV',
                    'mitigation-actions': 'Mitigation Actions',
                    'mitigation': 'Mitigation Actions',
                    'adaptation-and-resilience': 'Adaptation & Resilience',
                    'adaptation': 'Adaptation & Resilience',
                    'climate-finance-and-investment': 'Climate Finance & Investment',
                    'finance-and-resource-mobilization': 'Climate Finance & Investment',
                    'finance-and-technology-transfer': 'Climate Finance & Investment',
                }
                
                const areaName = areaNameMap[thematicAreaSlug || ''] || 
                    areas.find(a => {
                        const slug = a.name.toLowerCase()
                            .replace(/&/g, 'and')
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-+|-+$/g, '')
                        return slug === thematicAreaSlug
                    })?.name
                
                if (areaName) {
                    const found = areas.find(a => a.name === areaName)
                    if (found) {
                        setThematicArea(found)
                        
                        // Get indicators for this thematic area
                        const allIndicators = await listIndicators()
                        const filtered = allIndicators.filter(
                            ind => ind.thematic_area === areaName && ind.sector === activeTab
                        )
                        setIndicators(filtered)
                        
                        // Get county performance data
                        const performance = await getCountySummaryPerformance(activeTab)
                        setCountyData(performance || [])
                    }
                }
            } catch (error: any) {
                console.error('Error fetching thematic area data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (thematicAreaSlug) {
            fetchData()
        }
    }, [thematicAreaSlug, activeTab])

    if (loading) {
        return (
            <main>
                <Header currentPage="home" />
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
                <Footer />
            </main>
        )
    }

    if (!thematicArea) {
        return (
            <main>
                <Header currentPage="home" />
                <HeroBanner
                    title="Thematic Area Not Found"
                    description="The requested thematic area could not be found."
                />
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 text-center">
                    <Link to="/" className="text-blue-600 hover:underline">
                        Return to Home
                    </Link>
                </div>
                <Footer />
            </main>
        )
    }

    const performanceColors = {
        Outstanding: "bg-green-600",
        Satisfactory: "bg-emerald-600",
        Good: "bg-yellow-400 text-black",
        Average: "bg-orange-500",
        Poor: "bg-red-500",
    }

    const rankedData = countyData
        .map((item: any) => ({
            name: item.name || item.county || "Unknown",
            score: Number(item.score ?? 0),
        }))
        .filter((item: any) => typeof item.name === "string" && item.score > 0)
        .sort((a: any, b: any) => b.score - a.score)
        .map((item: any, index: number) => ({
            ...item,
            rank: index + 1
        }))
        .slice(0, 10)

    return (
        <main>
            <Header currentPage="home" />
            
            <HeroBanner
                title={thematicArea.name}
                description={thematicArea.description || "Explore county performance in this thematic area"}
            />

            <section className="py-12 md:py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setActiveTab("water")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
                                activeTab === "water"
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                        >
                            Water Management
                        </button>
                        <button
                            onClick={() => setActiveTab("waste")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
                                activeTab === "waste"
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                        >
                            Waste Management
                        </button>
                    </div>

                    <h2 className="text-3xl font-bold mb-6">County Performance: {thematicArea.name}</h2>

                    {indicators.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">Indicators ({indicators.length})</h3>
                            <div className="bg-white rounded-lg shadow p-6">
                                <ul className="space-y-2">
                                    {indicators.map((ind) => (
                                        <li key={ind.id} className="text-gray-700">
                                            • {ind.indicator_text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {rankedData.length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold">Rank</th>
                                            <th className="px-6 py-4 text-left font-semibold">County</th>
                                            <th className="px-6 py-4 text-center font-semibold">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rankedData.map((row: any) => {
                                            const perf = row.score >= 75 ? "Outstanding" :
                                                         row.score >= 60 ? "Satisfactory" :
                                                         row.score >= 45 ? "Good" : "Average"
                                            return (
                                                <tr key={row.name} className="border-b hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4 font-semibold">#{row.rank}</td>
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            to={`/county/${row.name.toLowerCase().replace(/\s+/g, "-")}`}
                                                            className="text-blue-600 hover:underline font-medium"
                                                        >
                                                            {row.name}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold">
                                                        {row.score.toFixed(1)}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No performance data available for {thematicArea.name} in {activeTab} sector
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    )
}

