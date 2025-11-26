import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { IndicatorSection } from "@/components/indicator-section"

// Indicator type that matches what IndicatorSection expects
interface IndicatorItem {
    no: number
    indicator: string
    description: string
    score: number
}

// Your real indicators from admin panel
const WATER_INDICATORS = [
    "Climate change coordination unit established",
    "County climate change act enacted",
    "Water sector GHG inventory completed",
    "Water efficiency programs implemented",
    "Drought early warning system operational",
    "Climate budget tagging system in place",
]

// const WASTE_INDICATORS = [
//     "County waste management policy adopted",
//     "Waste collection by-laws enforced",
//     "Waste sector GHG emissions tracked",
//     "Landfill gas capture project active",
//     "Circular economy initiatives launched",
//     "Waste revenue used for climate projects",
// ]

export default function CountyWaterPage() {
    const { countyName = "" } = useParams<{ countyName: string }>()
    const [year, setYear] = useState("2025")
    const [data, setData] = useState<{
        name: string
        description: string
        overallRank: number | string
        overallScore: string
        waterScore: string
        // wasteScore: string
        indicators: Record<string, string>
        waterIndicators: IndicatorItem[]
        // wasteIndicators: IndicatorItem[]
    } | null>(null)
    const [loading, setLoading] = useState(true)

    // Safely format indicators with number and fallback
    const buildIndicators = (items: any[] = [], fallback: string[]) => {
        return items.length > 0
            ? items.map((item: any, i: number) => ({
                no: i + 1,
                indicator: item.indicator || fallback[i] || "Unknown indicator",
                description: item.description || "No description available.",
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
                // const wasteScore = Number(json.wasteScore || 0).toFixed(1)
                const overallScore = Number(json.overallScore || 0).toFixed(1)

                setData({
                    name: json.county || countyName,
                    description:
                        "This component examines the institutional structures, legal frameworks, policy coherence, and stakeholder engagement mechanisms that underpin climate action. It is weighted at 30%, recognizing its foundational role in enabling effective implementation and coordination across all other components.",
                    overallRank: json.rank || 1,
                    overallScore,
                    waterScore,
                    // wasteScore,
                    indicators: {
                        governance: Number(json.indicators?.governance || 0).toFixed(1),
                        mrv: Number(json.indicators?.mrv || 0).toFixed(1),
                        mitigation: Number(json.indicators?.mitigation || 0).toFixed(1),
                        adaptation: Number(json.indicators?.adaptation || 0).toFixed(1),
                        finance: Number(json.indicators?.finance || 0).toFixed(1),
                    },
                    waterIndicators: buildIndicators(json.waterIndicators, WATER_INDICATORS),
                    // wasteIndicators: buildIndicators(json.wasteIndicators, WASTE_INDICATORS),
                })
            } catch (err) {
                console.error(err)
                // Fallback when API fails
                setData({
                    name: countyName,
                    description: "Performance data temporarily unavailable.",
                    overallRank: "-",
                    overallScore: "N/A",
                    waterScore: "N/A",
                    // wasteScore: "N/A",
                    indicators: { governance: "0", mrv: "0", mitigation: "0", adaptation: "0", finance: "0" },
                    waterIndicators: WATER_INDICATORS.map((ind, i) => ({
                        no: i + 1,
                        indicator: ind,
                        description: "Data not yet entered.",
                        score: 0,
                    })),
                    // wasteIndicators: WASTE_INDICATORS.map((ind, i) => ({
                    //     no: i + 1,
                    //     indicator: ind,
                    //     description: "Data not yet entered.",
                    //     score: 0,
                    // })),
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

            {/* Hero Banner - IDENTICAL */}
            <div
                className="bg-cover bg-center h-48 relative"
                style={{ backgroundImage: "url(/background.png)" }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                    <h1 className="text-4xl font-bold text-white mb-3">{data.name}</h1>
                    <p className="text-white text-sm max-w-2xl">{data.description}</p>
                </div>
            </div>

            {/* Year Selector & Content - IDENTICAL */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                <div className="mb-8">
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                    >
                        <option>2025</option>
                        <option>2024</option>
                        <option>2023</option>
                    </select>
                </div>

                {/* Score Cards Grid - IDENTICAL */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <div className="text-3xl font-bold text-gray-900 mb-2">{data.overallScore}</div>
                        <p className="text-gray-600 text-sm">Overall County Score</p>
                    </div>
                    <div className="bg-white p-4 border border-gray-200 rounded-lg flex items-center gap-2">
                        <div className="text-xl">Water</div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{data.waterScore}</div>
                            <p className="text-gray-600 text-xs">Water Management</p>
                        </div>
                    </div>
                    {/* <div className="bg-white p-4 border border-gray-200 rounded-lg flex items-center gap-2">
                        <div className="text-xl">Waste</div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{data.wasteScore}</div>
                            <p className="text-gray-600 text-xs">Waste Management</p>
                        </div>
                    </div> */}
                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <div className="text-3xl font-bold text-gray-900 mb-2">{data.overallRank}</div>
                        <p className="text-gray-600 text-sm">Overall County Ranking</p>
                    </div>
                </div>

                {/* Indicators Overview - IDENTICAL */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Indicators Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(data.indicators).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-gray-900">{value}</div>
                                <p className="text-gray-600 text-xs mt-2 capitalize">
                                    {key.replace(/([A-Z])/g, " $1")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Water Management Indicators - IDENTICAL */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Water Management Indicators</h2>
                    <IndicatorSection title="Governance" indicators={data.waterIndicators} defaultOpen={true} />
                    <IndicatorSection
                        title="Measurement, Reporting, and Verification(MRV)"
                        indicators={data.waterIndicators}
                    />
                    <IndicatorSection title="Mitigation" indicators={data.waterIndicators} />
                    <IndicatorSection title="Adaptation" indicators={data.waterIndicators} />
                    <IndicatorSection title="Finance & Technology Transfer" indicators={data.waterIndicators} />
                </div>

                {/* Waste Management Indicators - IDENTICAL */}
                {/* <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Waste Management Indicators</h2>
                    <IndicatorSection title="Governance" indicators={data.wasteIndicators} />
                    <IndicatorSection
                        title="Measurement, Reporting, and Verification(MRV)"
                        indicators={data.wasteIndicators}
                        defaultOpen={true}
                    />
                    <IndicatorSection title="Mitigation" indicators={data.wasteIndicators} />
                    <IndicatorSection title="Adaptation" indicators={data.wasteIndicators} />
                    <IndicatorSection title="Finance & Technology Transfer" indicators={data.wasteIndicators} />
                </div> */}
            </div>

            <Footer />
        </div>
    )
}