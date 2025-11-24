"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { KenyaMap } from "@/components/kenya-map"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

const waterManagementData = [
    { rank: 1, county: "Nairobi", indexScore: 85, performance: "Outstanding" },
    { rank: 2, county: "Mombasa", indexScore: 82, performance: "Outstanding" },
    { rank: 3, county: "Kiambu", indexScore: 78, performance: "Satisfactory" },
    { rank: 4, county: "Kisumu", indexScore: 72, performance: "Satisfactory" },
    { rank: 5, county: "Nakuru", indexScore: 68, performance: "Good" },
    { rank: 6, county: "Machakos", indexScore: 65, performance: "Good" },
    { rank: 7, county: "Kajiado", indexScore: 45, performance: "Average" },
]

const wasteManagementData = [
    { rank: 1, county: "Nairobi", indexScore: 88, performance: "Outstanding" },
    { rank: 2, county: "Mombasa", indexScore: 84, performance: "Outstanding" },
    { rank: 3, county: "Kisumu", indexScore: 76, performance: "Satisfactory" },
    { rank: 4, county: "Nakuru", indexScore: 70, performance: "Satisfactory" },
    { rank: 5, county: "Kiambu", indexScore: 66, performance: "Good" },
    { rank: 6, county: "Uasin Gishu", indexScore: 62, performance: "Good" },
    { rank: 7, county: "Kakamega", indexScore: 48, performance: "Average" },
]

export default function Home() {
    // Fixed: Removed TypeScript syntax → works in plain JS
    const [activeTab, setActiveTab] = useState("water") // ← This is the fix

    const summaryData = activeTab === "water" ? waterManagementData : wasteManagementData

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
                                            {summaryData.map((row) => (
                                                <tr key={row.rank} className="border-b hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4 font-semibold">{row.rank}</td>
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            to={`/county/${row.county.toLowerCase().replace(/\s+/g, "-")}`}
                                                            className="text-blue-600 hover:underline font-medium"
                                                        >
                                                            {row.county}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold">{row.indexScore}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Badge
                                                            className={`rounded-full px-4 py-1.5 text-white font-medium ${row.performance === "Outstanding"
                                                                ? "bg-green-600"
                                                                : row.performance === "Satisfactory"
                                                                    ? "bg-emerald-600"
                                                                    : row.performance === "Good"
                                                                        ? "bg-yellow-500 text-black"
                                                                        : "bg-orange-500 text-black"
                                                                }`}
                                                        >
                                                            {row.performance}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

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

            {/* Thematic Areas & Publications – unchanged, just cleaned up a bit */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-16">
                    {/* Thematic Areas */}
                    <div>
                        <h2 className="text-4xl font-bold mb-10">Thematic Areas</h2>
                        <div className="space-y-6">
                            {[
                                { title: "Governance", path: "/governance" },
                                { title: "Measurement, Reporting, and Verification (MRV)", path: "/mrv" },
                                { title: "Mitigation", path: "/mitigation" },
                                { title: "Adaptation", path: "/adaptation" },
                                { title: "Finance & Technology Transfer", path: "/finance-technology-transfer" },
                            ].map((area) => (
                                <Link
                                    key={area.title}
                                    to={area.path}
                                    className="block group"
                                >
                                    <div className="flex items-center justify-between px-8 py-6 bg-white border border-gray-200 rounded-2xl 
                              hover:border-gray-300 hover:shadow-lg transition-all duration-300 
                              cursor-pointer"
                                    >
                                        <span className="text-lg font-medium text-gray-800 pr-4">
                                            {area.title}
                                        </span>
                                        <span className="text-2xl text-gray-400 group-hover:text-blue-600 
                                 group-hover:translate-x-3 transition-all duration-300">
                                            →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Publications */}
                    <div>
                        <h2 className="text-4xl font-bold mb-10">Publications</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-slate-900 text-white p-8 rounded-2xl text-center">
                                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-700 rounded-xl border-2 border-dashed border-gray-600" />
                                    <p className="text-sm uppercase text-slate-400 mb-2">User Manual</p>
                                    <h4 className="font-bold text-lg mb-3">
                                        The Nationally Determined Contributions Tracking Tool
                                    </h4>
                                    <p className="text-sm text-slate-400 mb-4">Nov 12 2025</p>
                                    <a href="#" className="text-blue-400 hover:underline font-medium">
                                        Read Report →
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
