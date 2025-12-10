"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { getCountyRankingsByThematicArea } from "@/lib/supabase-api"
import { ThematicAreaRankings } from "./ThematicAreaRankings"

export default function Governance() {
    const [rankings, setRankings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await getCountyRankingsByThematicArea("Governance & Policy Framework")
                setRankings(data)
            } catch (err) {
                console.error("Error fetching governance rankings:", err)
                setError(err.message || "Failed to load rankings")
            } finally {
                setLoading(false)
            }
        }
        fetchRankings()
    }, [])
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
                            <ThematicAreaRankings 
                                thematicAreaName="Governance & Policy Framework"
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
