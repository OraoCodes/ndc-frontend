"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { KenyaMap } from "@/components/kenya-map"

const governanceData = [
    { rank: 1, county: "Nairobi", water: 15, wasteMgt: 11, avgScore: 21, performance: "Outstanding" },
    { rank: 2, county: "Mombasa", water: 15, wasteMgt: 11, avgScore: 21, performance: "Outstanding" },
    { rank: 3, county: "Nairobi", water: 15, wasteMgt: 11, avgScore: 21, performance: "Satisfactory" },
    { rank: 4, county: "Mombasa", water: 15, wasteMgt: 11, avgScore: 21, performance: "Satisfactory" },
    { rank: 5, county: "Nairobi", water: 15, wasteMgt: 11, avgScore: 21, performance: "Good" },
    { rank: 6, county: "Mombasa", water: 15, wasteMgt: 11, avgScore: 21, performance: "Good" },
    { rank: 7, county: "Nairobi", water: 15, wasteMgt: 11, avgScore: 21, performance: "Average" },
]

export default function Governance() {
    return (
        <main>
            <Header currentPage="governance" />

            <HeroBanner
                title="Governance"
                description="Assesses legal frameworks, institutional capacity, coordination mechanisms, and policy alignment with climate goals. Shows if systems are in place to deliver climate action."
            />

            <section className="py-12 md:py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Map */}
                        <div className="flex flex-col items-center justify-center">
                            <img src="/image 9.svg" alt="Background" />
                        </div>

                        {/* Content */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6">County Rankings</h2>
                            <p className="text-sm text-muted-foreground mb-6">Complete performance and indicators</p>

                            <div className="bg-white rounded-lg border border-border p-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="px-3 py-2 text-left font-semibold">Rank</th>
                                                <th className="px-3 py-2 text-left font-semibold">County</th>
                                                <th className="px-3 py-2 text-center font-semibold">Water</th>
                                                <th className="px-3 py-2 text-center font-semibold">Waste Mgt</th>
                                                <th className="px-3 py-2 text-center font-semibold">Avg Score</th>
                                                <th className="px-3 py-2 text-center font-semibold">Performance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {governanceData.slice(0, 4).map((row, idx) => (
                                                <tr key={idx} className="border-b border-border hover:bg-slate-50">
                                                    <td className="px-3 py-2">{row.rank}</td>
                                                    <td className="px-3 py-2">
                                                        <a href="#" className="underline text-primary">
                                                            {row.county}
                                                        </a>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">{row.water}</td>
                                                    <td className="px-3 py-2 text-center">{row.wasteMgt}</td>
                                                    <td className="px-3 py-2 text-center font-semibold">{row.avgScore}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span
                                                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold text-white ${row.performance === "Outstanding" ? "bg-green-500" : "bg-emerald-600"
                                                                }`}
                                                        >
                                                            {row.performance}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
