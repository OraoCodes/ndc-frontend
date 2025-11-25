"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { KenyaMap } from "@/components/kenya-map"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { api, ThematicArea, CountySummaryPerformance } from "@/lib/api" // Import ThematicArea and CountySummaryPerformance interface

// Placeholder for publications data type, adjust as needed
interface Publication {
    id: number;
    title: string;
    date: string;
    summary: string;
}

// 

// Local type for table display (with rank + performance)
interface RankedCounty extends CountySummaryPerformance {
    rank: number
}


export default function Home() {
    const [activeTab, setActiveTab] = useState("water")
    const [thematicAreas, setThematicAreas] = useState<ThematicArea[]>([])
    const [publications, setPublications] = useState<Publication[]>([])
    const [waterSummaryData, setWaterSummaryData] = useState<CountySummaryPerformance[]>([])
    const [wasteSummaryData, setWasteSummaryData] = useState<CountySummaryPerformance[]>([])

    const [loadingThematicAreas, setLoadingThematicAreas] = useState(true)
    const [loadingPublications, setLoadingPublications] = useState(true)
    const [loadingSummaryData, setLoadingSummaryData] = useState(true)

    const [errorThematicAreas, setErrorThematicAreas] = useState<string | null>(null)
    const [errorPublications, setErrorPublications] = useState<string | null>(null)
    const [errorSummaryData, setErrorSummaryData] = useState<string | null>(null)

    useEffect(() => {
        const fetchThematicAreas = async () => {
            try {
                const data = await api.listThematicAreas();
                setThematicAreas(data);
            } catch (error: any) {
                setErrorThematicAreas(error.message || "Failed to fetch thematic areas");
            } finally {
                setLoadingThematicAreas(false);
            }
        };

        const fetchPublications = async () => {
            try {
                const data = await api.listPublications();
                setPublications(data);
            } catch (error: any) {
                setErrorPublications(error.message || "Failed to fetch publications");
            } finally {
                setLoadingPublications(false);
            }
        };

        const fetchSummaryData = async () => {
            try {
                const [waterData, wasteData] = await Promise.all([
                    api.getCountySummaryPerformance("water"),
                    api.getCountySummaryPerformance("waste")
                ])
                setWaterSummaryData(waterData)
                setWasteSummaryData(wasteData)
            } catch (error: any) {
                setErrorSummaryData(error.message || "Failed to load county performance")
            } finally {
                setLoadingSummaryData(false)
            }
        }

        fetchThematicAreas();
        fetchPublications();
        fetchSummaryData();
    }, []);

    const rawData = activeTab === "water" ? waterSummaryData : wasteSummaryData;

    const rankedData: RankedCounty[] = rawData
        .map((item, index) => ({ ...item, rank: index + 1 }))
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({ ...item, rank: index + 1 }))

    const getPerformanceBadge = (score: number) => {
        if (score >= 90) return { text: "Outstanding", color: "bg-green-600" }
        if (score >= 75) return { text: "Satisfactory", color: "bg-emerald-600" }
        if (score >= 60) return { text: "Good", color: "bg-yellow-500 text-black" }
        return { text: "Needs Improvement", color: "bg-orange-500 text-black" }
    }

    return (
        <main>
            <Header currentPage="home" />

            <HeroBanner
                title="NDC tracking tool for water and waste management in Kenya"
                description="Track Kenya county performance in climate action across water and waste sectors"
            />

            <section className="py-12 md:py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Map */}
                        <div className="flex flex-col items-center justify-center">
                            {/* <KenyaMap /> */}
                            <img src="/image 9.svg" alt="Background" />
                        </div>

                        {/* Content */}
                        <div>
                            <div className="flex gap-3 mb-6">
                                <button
                                    onClick={() => setActiveTab("water")}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${activeTab === "water"
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                        }`}
                                >
                                    Water Management
                                </button>
                                <button
                                    onClick={() => setActiveTab("waste")}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${activeTab === "waste"
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                        }`}
                                >
                                    Waste Management
                                </button>
                            </div>

                            <h2 className="text-3xl font-bold mb-6">Summary Index Score per County</h2>

                            {loadingSummaryData ? (
                                <div>Loading summary data...</div>
                            ) : errorSummaryData ? (
                                <div className="text-red-500">{errorSummaryData}</div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b">
                                                <tr>
                                                    <th className="px-6 py-4 text-left font-semibold">Rank</th>
                                                    <th className="px-6 py-4 text-left font-semibold">County</th>
                                                    <th className="px-6 py-4 text-center font-semibold">Index Score</th>
                                                    <th className="px-6 py-4 text-center font-semibold">Performance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rankedData
                                                    .map((item, index) => ({ ...item, rank: index + 1 })) // Add rank
                                                    .sort((a, b) => b.score - a.score) // Sort by score descending
                                                    .map((row) => {
                                                        const perf = getPerformanceBadge(row.score)
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
                                                                <td className="px-6 py-4 text-center font-bold">{row.score.toFixed(1)}</td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <Badge className={`rounded-full px-4 py-1.5 text-white font-medium ${perf.color}`}>
                                                                        {perf.text}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}


                            <div className="mt-6">
                                <Link
                                    to={activeTab === "water" ? "/water-management" : "/waste-management"}
                                >
                                    <Button variant="link" className="text-blue-600 hover:text-blue-800 font-semibold">
                                        View More →
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Thematic Areas & Publications */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-16">
                    {/* Thematic Areas */}
                    <div>
                        <h2 className="text-4xl font-bold mb-10">Thematic Areas</h2>
                        {loadingThematicAreas ? (
                            <div>Loading thematic areas...</div>
                        ) : errorThematicAreas ? (
                            <div className="text-red-500">{errorThematicAreas}</div>
                        ) : (
                            <div className="space-y-6">
                                {thematicAreas.map((area) => (
                                    <Link
                                        key={area.id}
                                        to={`/thematic-areas/${area.id}`} // Assuming a thematic area detail page exists
                                        className="block group"
                                    >
                                        <div className="flex items-center justify-between px-8 py-6 bg-white border border-gray-200 rounded-2xl 
                                          hover:border-gray-300 hover:shadow-lg transition-all duration-300 
                                          cursor-pointer"
                                        >
                                            <span className="text-lg font-medium text-gray-800 pr-4">
                                                {area.name}
                                            </span>
                                            <span className="text-2xl text-gray-400 group-hover:text-blue-600 
                                             group-hover:translate-x-3 transition-all duration-300">
                                                →
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Publications */}
                    <div>
                        <h2 className="text-4xl font-bold mb-10">Publications</h2>
                        {loadingPublications ? (
                            <div>Loading publications...</div>
                        ) : errorPublications ? (
                            <div className="text-red-500">{errorPublications}</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {publications.slice(0, 3).map((publication) => ( // Display top 3 publications
                                    <div key={publication.id} className="bg-slate-900 text-white p-8 rounded-2xl text-center">
                                        <div className="w-20 h-20 mx-auto mb-6 bg-gray-700 rounded-xl border-2 border-dashed border-gray-600" />
                                        <p className="text-sm uppercase text-slate-400 mb-2">{publication.summary || "Document"}</p>
                                        <h4 className="font-bold text-lg mb-3">
                                            {publication.title}
                                        </h4>
                                        <p className="text-sm text-slate-400 mb-4">{new Date(publication.date).toLocaleDateString()}</p>
                                        <Link to={`/publications/${publication.id}`} className="text-blue-400 hover:underline font-medium">
                                            Read Report →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}

