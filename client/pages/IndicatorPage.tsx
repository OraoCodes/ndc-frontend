"use client"

import { useState, useEffect } from "react"
import { Loader2, Save, ArrowLeft } from "lucide-react"

interface County { id: number; name: string }
interface Indicator { id: number; sector: string; thematicArea: string; indicator: string; weight: number }
interface Score { indicatorId: number; score: number }

export default function CountyScoringPage() {
    const [counties, setCounties] = useState<County[]>([])
    const [indicators, setIndicators] = useState<Indicator[]>([])
    const [selectedCounty, setSelectedCounty] = useState<string>("")
    const [year] = useState("2025")
    const [scores, setScores] = useState<Record<number, number>>({})
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")

    // Load counties and indicators
    useEffect(() => {
        Promise.all([
            fetch("/api/counties").then(r => r.json()),
            fetch("/api/indicators").then(r => r.json()),
        ]).then(([c, i]) => {
            setCounties(c)
            setIndicators(i)
        })
    }, [])

    // Load existing scores when county selected
    useEffect(() => {
        if (!selectedCounty) return
        fetch(`/api/counties/${selectedCounty}/performance?year=${year}`)
            .then(r => r.json())
            .then(data => {
                const existing: Record<number, number> = {}
                    ;[...(data.waterIndicators || []), ...(data.wasteIndicators || [])].forEach((ind: any) => {
                        if (ind.id) existing[ind.id] = ind.score || 0
                    })
                setScores(existing)
            })
            .catch(() => setScores({}))
    }, [selectedCounty, year])

    const handleScoreChange = (indicatorId: number, value: string) => {
        const num = parseFloat(value) || 0
        setScores(prev => ({ ...prev, [indicatorId]: Math.max(0, Math.min(10, num)) }))
    }

    const handleSave = async () => {
        setSaving(true)
        setMessage("")

        const payload = Object.entries(scores).map(([indicatorId, score]) => ({
            indicator_id: Number(indicatorId),
            score: Number(score),
        }))

        try {
            const res = await fetch("/api/counties/scoring", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    county_id: Number(selectedCounty),
                    year: Number(year),
                    scores: payload,
                }),
            })

            if (res.ok) {
                setMessage("Scores saved successfully! Visible on public portal now.")
            } else {
                setMessage("Failed to save scores.")
            }
        } catch (err) {
            setMessage("Error saving scores.")
        } finally {
            setSaving(false)
        }
    }

    if (!selectedCounty) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-2xl mx-auto">
                    <a href="/admin/indicators" className="flex items-center gap-2 text-blue-600 mb-8">
                        <ArrowLeft className="w-5 h-5" /> Back to Indicators
                    </a>
                    <h1 className="text-4xl font-bold mb-8">Score County Performance</h1>
                    <div className="bg-white rounded-xl shadow-lg p-10">
                        <label className="block text-xl font-medium mb-6">Select County</label>
                        <select
                            onChange={(e) => setSelectedCounty(e.target.value)}
                            className="w-full px-6 py-5 text-xl border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none"
                        >
                            <option value="">Choose a county...</option>
                            {counties.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        )
    }

    const selectedCountyName = counties.find(c => c.id === Number(selectedCounty))?.name

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <a href="/admin/indicators" className="flex items-center gap-2 text-blue-600 mb-4">
                            <ArrowLeft className="w-5 h-5" /> Change County
                        </a>
                        <h1 className="text-4xl font-bold">
                            Scoring: {selectedCountyName} <span className="text-2xl text-gray-600">({year})</span>
                        </h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-70"
                    >
                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        {saving ? "Saving..." : "Save All Scores"}
                    </button>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-white font-medium ${message.includes("successfully") ? "bg-green-600" : "bg-red-600"}`}>
                        {message}
                    </div>
                )}

                <div className="space-y-8">
                    {["water", "waste"].map(sector => (
                        <div key={sector} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
                                <h2 className="text-3xl font-bold text-white capitalize">
                                    {sector} Sector
                                </h2>
                            </div>
                            <div className="p-8">
                                {indicators
                                    .filter(i => i.sector === sector)
                                    .map(ind => (
                                        <div key={ind.id} className="flex items-center gap-6 py-6 border-b border-gray-200 last:border-0">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{ind.indicator}</p>
                                                <p className="text-sm text-gray-600 mt-1">{ind.thematicArea}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={scores[ind.id] ?? ""}
                                                    onChange={(e) => handleScoreChange(ind.id, e.target.value)}
                                                    className="w-24 px-4 py-3 text-xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                                                    placeholder="0.0"
                                                />
                                                <span className="text-2xl font-bold text-gray-500">/ 10</span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}