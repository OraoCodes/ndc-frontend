"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { getCountyRankingsByThematicArea } from "@/lib/supabase-api"
import { ThematicAreaRankings } from "./ThematicAreaRankings"

export default function Adaptation() {
    const [rankings, setRankings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await getCountyRankingsByThematicArea("Adaptation & Resilience")
                setRankings(data)
            } catch (err) {
                console.error("Error fetching adaptation rankings:", err)
                setError(err.message || "Failed to load rankings")
            } finally {
                setLoading(false)
            }
        }
        fetchRankings()
    }, [])
    return (
        <main>
            <Header currentPage="adaptation" />

            <HeroBanner
                title="Adaptation"
                description="Evaluates preparedness for climate impacts, water stress, floods, droughts, and heatwaves. Focuses on vulnerable communities, infrastructure, and ecosystem resilience."
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
                            <ThematicAreaRankings 
                                thematicAreaName="Adaptation & Resilience"
                                loading={loading}
                                data={rankings}
                                error={error}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
