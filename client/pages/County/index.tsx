import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { IndicatorSection } from "@/components/indicator-section"

interface IndicatorItem {
    no: number
    indicator: string
    description: string
    score: number
}

// OFFICIAL INDICATORS — GROUPED BY THEMATIC AREA (from your document)
const WATER_INDICATORS = {
    governance: [
        "Water sector policy aligned with NDCs or county climate action plan exists",
        "Climate change coordination unit or committee established",
        "% of water department staff trained in climate-related planning",
        "Climate targets included in county performance contracts",
        "Climate goals integrated into County Integrated Development Plan (CIDP)",
        "Stakeholder participation mechanism established (public forums, workshops)",
    ],
    mrv: [
        "MRV system for water sector NDC tracking in place",
        "Frequency of data updates for water indicators",
        "% of water-related indicators with available data",
        "Water sector emission inventory completed",
        "County submits water data to national MRV system",
        "Verification mechanism for water data in place",
    ],
    mitigation: [
        "GHG emission reduction target for water sector exists",
        "Annual GHG reduction achieved in water sector (%)",
        "Renewable energy share in water supply/pumping",
        "Water efficiency or conservation programs implemented",
        "Leakage reduction or non-revenue water targets met",
        "Climate-smart water infrastructure projects active",
    ],
    adaptation: [
        "Climate risk and vulnerability assessment for water conducted",
        "% population with access to climate-resilient water infrastructure",
        "Drought early warning system operational",
        "Flood response protocols for water systems in place",
        "Ecosystem restoration (watersheds, wetlands) supported",
        "Number of water storage/reservoirs for drought resilience",
    ],
    finance: [
        "Dedicated climate budget line for water sector exists",
        "% of county budget allocated to climate-resilient water projects",
        "Amount of climate finance mobilized for water (KES)",
        "Access to international climate funds (GCF, AF, etc.)",
        "Private sector participation in water resilience projects",
        "Budget absorption rate for water-related climate funds",
    ],
}

const WASTE_INDICATORS = {
    governance: [
        "Waste management policy aligned with NDCs or county climate plan exists",
        "Waste collection and disposal by-laws enforced",
        "Climate change coordination includes waste sector",
        "Climate targets in performance contracts include waste",
        "Waste goals integrated into CIDP",
        "Public participation in waste planning established",
    ],
    mrv: [
        "MRV system for waste sector NDC tracking in place",
        "Waste generation and treatment data updated regularly",
        "% of waste indicators with available data",
        "Waste sector GHG emission inventory completed",
        "County submits waste data to national MRV system",
        "Third-party verification of waste data in place",
    ],
    mitigation: [
        "Methane reduction or GHG reduction target for waste sector exists",
        "Waste diverted from landfill through recycling/composting (%)",
        "Landfill gas capture or biogas project active",
        "Circular economy initiatives launched (e.g., reuse, upcycling)",
        "Composting or organic waste treatment facilities operational",
        "Waste-to-energy or anaerobic digestion project active",
    ],
    adaptation: [
        "Climate risk assessment includes waste infrastructure",
        "Flood-resistant waste facilities or transfer stations built",
        "Contingency plans for waste service during disasters",
        "Community-led waste resilience programs supported",
        "Illegal dumping hotspots reduced due to climate planning",
    ],
    finance: [
        "Dedicated climate budget line for waste management exists",
        "% of county budget allocated to climate-smart waste projects",
        "Revenue from waste services used for climate projects",
        "Climate finance accessed for waste (donors, PPPs, GCF)",
        "Private sector investment in waste infrastructure",
        "Cost recovery mechanism from waste services implemented",
    ],
}

export default function CountyPage() {
    const { countyName = "" } = useParams<{ countyName: string }>()
    const [year, setYear] = useState("2025")
    const [data, setData] = useState<{
        name: string
        description: string
        overallRank: number | string
        overallScore: string
        waterScore: string
        wasteScore: string
        indicators: Record<string, string>
        water: Record<string, IndicatorItem[]>
        waste: Record<string, IndicatorItem[]>
    } | null>(null)
    const [loading, setLoading] = useState(true)

    const buildSectionIndicators = (apiData: any[] = [], fallback: string[]) => {
        return apiData.length > 0
            ? apiData.map((item: any, i: number) => ({
                no: i + 1,
                indicator: item.indicator || fallback[i] || "Not reported",
                description: item.description || "No description provided.",
                score: Number(item.score || 0),
            }))
            : fallback.map((ind, i) => ({
                no: i + 1,
                indicator: ind,
                description: "Data not yet entered.",
                score: 0,
            }))
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(
                    `/api/counties/${encodeURIComponent(countyName)}/performance?year=${year}`
                )
                const json = res.ok ? await res.json() : {}

                const waterScore = Number(json.waterScore || 0).toFixed(1)
                const wasteScore = Number(json.wasteScore || 0).toFixed(1)
                const overallScore = Number(json.overallScore || 0).toFixed(1)

                setData({
                    name: json.county || countyName,
                    description:
                        "The Water & Waste Management NDC Index tracks county-level implementation of Kenya’s climate commitments across five pillars: Governance (30%), MRV (20%), Mitigation (20%), Adaptation (15%), and Finance & Technology Transfer (15%).",
                    overallRank: json.rank || "-",
                    overallScore,
                    waterScore,
                    wasteScore,
                    indicators: {
                        governance: Number(json.indicators?.governance || 0).toFixed(1),
                        mrv: Number(json.indicators?.mrv || 0).toFixed(1),
                        mitigation: Number(json.indicators?.mitigation || 0).toFixed(1),
                        adaptation: Number(json.indicators?.adaptation || 0).toFixed(1),
                        finance: Number(json.indicators?.finance || 0).toFixed(1),
                    },
                    water: {
                        governance: buildSectionIndicators(json.waterIndicators?.governance, WATER_INDICATORS.governance),
                        mrv: buildSectionIndicators(json.waterIndicators?.mrv, WATER_INDICATORS.mrv),
                        mitigation: buildSectionIndicators(json.waterIndicators?.mitigation, WATER_INDICATORS.mitigation),
                        adaptation: buildSectionIndicators(json.waterIndicators?.adaptation, WATER_INDICATORS.adaptation),
                        finance: buildSectionIndicators(json.waterIndicators?.finance, WATER_INDICATORS.finance),
                    },
                    waste: {
                        governance: buildSectionIndicators(json.wasteIndicators?.governance, WASTE_INDICATORS.governance),
                        mrv: buildSectionIndicators(json.wasteIndicators?.mrv, WASTE_INDICATORS.mrv),
                        mitigation: buildSectionIndicators(json.wasteIndicators?.mitigation, WASTE_INDICATORS.mitigation),
                        adaptation: buildSectionIndicators(json.wasteIndicators?.adaptation, WASTE_INDICATORS.adaptation),
                        finance: buildSectionIndicators(json.wasteIndicators?.finance, WASTE_INDICATORS.finance),
                    },
                })
            } catch (err) {
                console.error("Fetch failed:", err)

                // FULLY SAFE FALLBACK — NO MORE CRASHES
                const emptySection = (arr: string[]) =>
                    arr.map((ind, i) => ({
                        no: i + 1,
                        indicator: ind,
                        description: "Data not yet entered.",
                        score: 0,
                    }))

                setData({
                    name: countyName,
                    description: "Performance data temporarily unavailable.",
                    overallRank: "-",
                    overallScore: "N/A",
                    waterScore: "N/A",
                    wasteScore: "N/A",
                    indicators: { governance: "0.0", mrv: "0.0", mitigation: "0.0", adaptation: "0.0", finance: "0.0" },
                    water: {
                        governance: emptySection(WATER_INDICATORS.governance),
                        mrv: emptySection(WATER_INDICATORS.mrv),
                        mitigation: emptySection(WATER_INDICATORS.mitigation),
                        adaptation: emptySection(WATER_INDICATORS.adaptation),
                        finance: emptySection(WATER_INDICATORS.finance),
                    },
                    waste: {
                        governance: emptySection(WASTE_INDICATORS.governance),
                        mrv: emptySection(WASTE_INDICATORS.mrv),
                        mitigation: emptySection(WASTE_INDICATORS.mitigation),
                        adaptation: emptySection(WASTE_INDICATORS.adaptation),
                        finance: emptySection(WASTE_INDICATORS.finance),
                    },
                })
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [countyName, year])

    if (loading || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-xl text-gray-600">Loading {countyName} performance data...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Banner */}
            <div className="bg-cover bg-center h-48 relative" style={{ backgroundImage: "url(/background.png)" }}>
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                    <h1 className="text-4xl font-bold text-white mb-3">{data.name}</h1>
                    <p className="text-white text-sm max-w-4xl leading-relaxed">{data.description}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                <div className="flex justify-end mb-10">
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="px-6 py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-gray-900 font-medium">
                        <option>2025</option>
                        <option>2024</option>
                        <option>2023</option>
                    </select>
                </div>

                {/* TWO COLUMN LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* LEFT: Map */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 sticky top-24">
                            <img src="/image 9.svg" alt="Kenya Map" className="w-full h-auto" />
                            <div className="mt-10 flex justify-center">
                                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-gray-600 font-medium">
                                    {["Least Developed", "Developing", "Moderate", "Good", "Most Developed"].map((label, i) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <div className={`w-10 h-3 rounded-full ${i === 0 ? "bg-red-500" : i === 1 ? "bg-orange-400" : i === 2 ? "bg-yellow-400" : i === 3 ? "bg-lime-500" : "bg-green-600"}`} />
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Scores */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Overall Score + Ranking */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                                <div className="text-5xl font-bold text-gray-900">{data.overallScore}/100</div>
                                <p className="text-gray-600 mt-3 text-base font-medium">Overall Score</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                                <div className="text-5xl font-bold text-gray-900">{data.overallRank}</div>
                                <p className="text-gray-600 mt-3 text-base font-medium">Overall County Ranking</p>
                            </div>
                        </div>

                        {/* Water & Waste Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Water */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <div className="flex items-start gap-5">
                                    <img src="/water-drop.png" alt="Water" className="w-14 h-14 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Water Sector</h3>
                                        <div className="text-4xl font-bold text-gray-900 mb-1">{data.waterScore}/100</div>
                                        <p className="text-xs text-gray-500 mb-4">{Math.round(Number(data.waterScore))}% of possible score</p>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-green-600 h-full rounded-full transition-all duration-700" style={{ width: `${data.waterScore}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4 text-sm">Indicators Overview</h4>
                                    <div className="space-y-3 text-sm">
                                        {["Governance", "MRV", "Mitigation", "Adaptation", "Finance & Technology Transfer"].map((label, i) => {
                                            const keys = ["governance", "mrv", "mitigation", "adaptation", "finance"]
                                            return (
                                                <div key={label} className="flex justify-between">
                                                    <span className="text-gray-600">{label}</span>
                                                    <span className="font-bold text-gray-900">{data.indicators[keys[i] as keyof typeof data.indicators]}/100</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Waste */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <div className="flex items-start gap-5">
                                    <img src="/waste-icon.png" alt="Waste" className="w-14 h-14 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Waste Management</h3>
                                        <div className="text-4xl font-bold text-gray-900 mb-1">{data.wasteScore}/100</div>
                                        <p className="text-xs text-gray-500 mb-4">{Math.round(Number(data.wasteScore))}% of possible score</p>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-green-600 h-full rounded-full transition-all duration-700" style={{ width: `${data.wasteScore}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4 text-sm">Indicators Overview</h4>
                                    <div className="space-y-3 text-sm">
                                        {["Governance", "MRV", "Mitigation", "Adaptation", "Finance & Technology Transfer"].map((label, i) => {
                                            const keys = ["governance", "mrv", "mitigation", "adaptation", "finance"]
                                            return (
                                                <div key={label} className="flex justify-between">
                                                    <span className="text-gray-600">{label}</span>
                                                    <span className="font-bold text-gray-900">{data.indicators[keys[i] as keyof typeof data.indicators]}/100</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DETAILED INDICATOR SECTIONS */}
                <div className="mt-16 space-y-16">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Water Management Indicators</h2>
                        <IndicatorSection title="Governance" indicators={data.water.governance} defaultOpen={true} />
                        <IndicatorSection title="Measurement, Reporting, and Verification (MRV)" indicators={data.water.mrv} />
                        <IndicatorSection title="Mitigation" indicators={data.water.mitigation} />
                        <IndicatorSection title="Adaptation & Resilience" indicators={data.water.adaptation} />
                        <IndicatorSection title="Finance & Technology Transfer" indicators={data.water.finance} />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Waste Management Indicators</h2>
                        <IndicatorSection title="Governance" indicators={data.waste.governance} />
                        <IndicatorSection title="Measurement, Reporting, and Verification (MRV)" indicators={data.waste.mrv} defaultOpen={true} />
                        <IndicatorSection title="Mitigation" indicators={data.waste.mitigation} />
                        <IndicatorSection title="Adaptation & Resilience" indicators={data.waste.adaptation} />
                        <IndicatorSection title="Finance & Technology Transfer" indicators={data.waste.finance} />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}