"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { listThematicAreas, listIndicators, getCountyRankingsByThematicArea, type ThematicArea, type Indicator } from "@/lib/supabase-api"
import { ThematicAreaRankings } from "./ThematicAreaRankings"
import { Loader2 } from "lucide-react"

export default function ThematicAreaPage() {
    const { thematicAreaSlug } = useParams<{ thematicAreaSlug: string }>()
    const [thematicArea, setThematicArea] = useState<ThematicArea | null>(null)
    const [indicators, setIndicators] = useState<Indicator[]>([])
    const [rankings, setRankings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                
                // Get all thematic areas from database
                const areas = await listThematicAreas()
                
                // Dynamically find thematic area by slug - convert slug back to name
                // This works for ANY thematic area in the database, not just hardcoded ones
                const areaName = areas.find(a => {
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
                        
                        // Get indicators for this thematic area (both water and waste)
                        const allIndicators = await listIndicators()
                        const filtered = allIndicators.filter(
                            ind => ind.thematic_area === areaName
                        )
                        setIndicators(filtered)
                        
                        // Get county rankings for this thematic area
                        // This may return empty array for new thematic areas without performance data
                        try {
                            const rankingsData = await getCountyRankingsByThematicArea(areaName)
                            setRankings(rankingsData || [])
                        } catch (rankingsError: any) {
                            // If rankings fail, set empty array and continue (thematic area may not have data yet)
                            console.warn('Could not fetch rankings for thematic area:', rankingsError)
                            setRankings([])
                        }
                    }
                } else {
                    // Thematic area not found - set error state
                    setError(`Thematic area "${thematicAreaSlug}" not found`)
                }
            } catch (error: any) {
                console.error('Error fetching thematic area data:', error)
                setError(error.message || "Failed to load data")
            } finally {
                setLoading(false)
            }
        }

        if (thematicAreaSlug) {
            fetchData()
        }
    }, [thematicAreaSlug])

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


    return (
        <main>
            <Header currentPage="home" />
            
            <HeroBanner
                title={thematicArea.name}
                description={thematicArea.description || "Explore county performance in this thematic area"}
            />

            <section className="py-12 md:py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <h2 className="text-3xl font-bold mb-6">County Performance: {thematicArea.name}</h2>

                    {indicators.length > 0 ? (
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
                    ) : (
                        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <p className="text-blue-800">
                                <strong>No indicators yet.</strong> This thematic area doesn't have any indicators assigned. 
                                Add indicators through the Indicators management page.
                            </p>
                        </div>
                    )}

                    <div className="mt-8">
                        <h3 className="text-2xl font-bold mb-6">County Rankings</h3>
                        {rankings.length > 0 ? (
                            <ThematicAreaRankings 
                                thematicAreaName={thematicArea.name}
                                loading={false}
                                data={rankings}
                                error={null}
                            />
                        ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                <p className="text-yellow-800">
                                    <strong>No performance data available yet.</strong> This thematic area doesn't have county performance rankings. 
                                    Performance data will appear here once counties start reporting data for this thematic area.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}

