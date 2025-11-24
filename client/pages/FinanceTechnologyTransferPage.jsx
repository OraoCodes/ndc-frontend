// 1. MRVPage.jsx
"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"

const mrvData = [
    { rank: 1, county: "Nairobi", water: 18, wasteMgt: 16, avgScore: 34, performance: "Outstanding" },
    { rank: 2, county: "Mombasa", water: 17, wasteMgt: 15, avgScore: 32, performance: "Outstanding" },
    { rank: 3, county: "Kisumu", water: 15, wasteMgt: 14, avgScore: 29, performance: "Satisfactory" },
    { rank: 4, county: "Nakuru", water: 14, wasteMgt: 13, avgScore: 27, performance: "Satisfactory" },
]

export default function FinanceTechnologyTransfer() {
    return (
        <main>
            <Header currentPage="finance-technology-transfer" />
            <HeroBanner
                title="Finance & Technology Transfer"
                description="Assesses access to climate finance, investment in green technologies, and knowledge transfer for sustainable water and waste management solutions."
            />

            <section className="py-12 md:py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="flex items-center justify-center">
                            <img src="/image 9.svg" alt="MRV Visualization" className="w-full max-w-md" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-6">County Rankings</h2>
                            <p className="text-sm text-muted-foreground mb-6">Complete performance and indicators</p>

                            <div className="bg-white rounded-lg border border-border overflow-hidden">
                                <div className="overflow-x-auto">
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
                                            {mrvData.map((row) => (
                                                <tr key={row.rank} className="border-b hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium">{row.rank}</td>
                                                    <td className="px-4 py-3">
                                                        <a href="#" className="text-primary hover:underline font-medium">{row.county}</a>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{row.water}</td>
                                                    <td className="px-4 py-3 text-center">{row.wasteMgt}</td>
                                                    <td className="px-4 py-3 text-center font-bold">{row.avgScore}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${row.performance === "Outstanding" ? "bg-green-600" :
                                                            row.performance === "Satisfactory" ? "bg-emerald-600" :
                                                                "bg-yellow-500 text-black"
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
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}