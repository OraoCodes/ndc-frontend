"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { KenyaMap } from "@/components/kenya-map"
import { CountyWasteTable } from "@/components/county-waste-table"
import { RegionalAnalysisChart } from "@/components/regional-analysis-chart"

const wasteData = [
    {
        rank: 1,
        county: "Nairobi",
        governance: 15,
        mrv: 12,
        mitigation: 11,
        adaptation: 10,
        finance: 15,
        indexScore: 85,
        performance: "Outstanding",
    },
    {
        rank: 2,
        county: "Mombasa",
        governance: 15,
        mrv: 12,
        mitigation: 11,
        adaptation: 10,
        finance: 15,
        indexScore: 82,
        performance: "Outstanding",
    },
    {
        rank: 3,
        county: "Nairobi",
        governance: 15,
        mrv: 12,
        mitigation: 11,
        adaptation: 10,
        finance: 15,
        indexScore: 78,
        performance: "Satisfactory",
    },
    {
        rank: 4,
        county: "Mombasa",
        governance: 15,
        mrv: 12,
        mitigation: 11,
        adaptation: 10,
        finance: 15,
        indexScore: 72,
        performance: "Satisfactory",
    },
    {
        rank: 5,
        county: "Nairobi",
        governance: 15,
        mrv: 12,
        mitigation: 11,
        adaptation: 10,
        finance: 15,
        indexScore: 68,
        performance: "Good",
    },
    {
        rank: 6,
        county: "Mombasa",
        governance: 15,
        mrv: 12,
        mitigation: 11,
        adaptation: 10,
        finance: 15,
        indexScore: 65,
        performance: "Good",
    },
    {
        rank: 7,
        county: "Nairobi",
        governance: 15,
        mrv: 12,
        mitigation: 11,
        adaptation: 10,
        finance: 15,
        indexScore: 45,
        performance: "Average",
    },
    {
        rank: 8,
        county: "Mombasa",
        governance: 15,
        mrv: 12,
        mitigation: 11,
        adaptation: 10,
        finance: 15,
        indexScore: 21,
        performance: "Poor",
    },
]

export default function WasteManagement() {
    return (
        <main>
            <Header currentPage="waste" />

            <HeroBanner
                title="Waste Management"
                description="This component examines the institutional structures, legal frameworks, policy coherence, and stakeholder engagement mechanisms that underpin climate action. It is weighted at 30%, recognizing its foundational role in enabling effective implementation and coordination across all other components."
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
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-6">Summary County Rankings - Waste Management</h2>
                                <p className="text-sm text-muted-foreground mb-6">Complete performance and indicators</p>
                            </div>

                            <RegionalAnalysisChart title="Regional Analysis" type="waste" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-12 md:py-16 bg-background">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <CountyWasteTable title="Index Score per County" data={wasteData} type="detailed" />
                </div>
            </section>

            <Footer />
        </main>
    )
}
