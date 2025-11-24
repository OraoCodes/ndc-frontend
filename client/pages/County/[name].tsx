import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { IndicatorSection } from "@/components/indicator-section"

// Mock data - replace with actual data fetching
const countyData = {
    name: "Nairobi",
    description:
        "This component examines the institutional structures, legal frameworks, policy coherence, and stakeholder engagement mechanisms that underpin climate action. It is weighted at 30%, recognizing its foundational role in enabling effective implementation and coordination across all other components.",
    overallRank: 1,
    overallScore: 70.8,
    waterScore: 85,
    wasteScore: 85,
    indicators: {
        governance: 15.0,
        mrv: 12,
        mitigation: 11,
        adaptation: 10,
        finance: 15,
    },
    waterIndicators: [
        {
            no: 1,
            indicator: "Audit on climate-related costs",
            description:
                "While a climate-related function is not readily available, many have found it significant and a necessary step to better address climate change and improve the National Climate Action Plan (NCAP). We Climate Change Directorate (CCAD), the Climate Finance Steering Group (CFSG), and the National Climate Change Council (NCCC) coordinate efforts, though not always sufficiently, and they lack clear climate change-focused budgeting approaches.",
            score: 1,
        },
        {
            no: 2,
            indicator: "Number of institutional arrangements for coordinating adaptation activities",
            description:
                "Some key undertakings significant reviews and restructuring efforts to strengthen its institutional capacity. The Climate Finance Steering Group (CFSG), and the National Climate Change Council (NCCC), coordinate efforts, though not always sufficiently clear regarding coordination and operational linkages.",
            score: 1,
        },
        {
            no: 3,
            indicator: "Percentage of adaptation actions prioritized and accounted for in the coordination system",
            description:
                "Whilst that has been made significant strides and measures dedicated to climate, this component remains in an unfulfilled capacity. The significant presence of climate stress risks and a steady lack without sufficient funds results in the coordination system and operational linkages.",
            score: 1,
        },
    ],
    wasteIndicators: [
        {
            no: 1,
            indicator: "Audit on climate-related costs",
            description:
                "While a climate-related function is not readily available, many have found it significant and a necessary step to better address climate change and improve the National Climate Action Plan (NCAP).",
            score: 1,
        },
        {
            no: 2,
            indicator: "Number of institutional arrangements",
            description:
                "Some key undertakings significant reviews and restructuring efforts to strengthen its institutional capacity.",
            score: 1,
        },
        {
            no: 3,
            indicator: "Percentage of adaptation actions prioritized",
            description:
                "Whilst that has been made significant strides and measures dedicated to climate, this component remains in an unfulfilled capacity.",
            score: 1,
        },
    ],
}

export default function CountyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Banner */}
            <div
                className="bg-cover bg-center h-48 relative"
                style={{ backgroundImage: "url(/background.png)" }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                    <h1 className="text-4xl font-bold text-white mb-3">{countyData.name}</h1>
                    <p className="text-white text-sm max-w-2xl">{countyData.description}</p>
                </div>
            </div>

            {/* Year Selector & Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                <div className="mb-8">
                    <select className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white">
                        <option>2025</option>
                        <option>2024</option>
                        <option>2023</option>
                    </select>
                </div>

                {/* Score Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <div className="text-3xl font-bold text-gray-900 mb-2">{countyData.overallScore}</div>
                        <p className="text-gray-600 text-sm">Overall County Score</p>
                    </div>
                    <div className="bg-white p-4 border border-gray-200 rounded-lg flex items-center gap-2">
                        <div className="text-xl">💧</div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{countyData.waterScore}</div>
                            <p className="text-gray-600 text-xs">Water Management</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 border border-gray-200 rounded-lg flex items-center gap-2">
                        <div className="text-xl">💧</div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{countyData.wasteScore}</div>
                            <p className="text-gray-600 text-xs">Waste Management</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <div className="text-3xl font-bold text-gray-900 mb-2">{countyData.overallRank}</div>
                        <p className="text-gray-600 text-sm">Overall County Ranking</p>
                    </div>
                </div>

                {/* Indicators Overview */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Indicators Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(countyData.indicators).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-gray-900">{value}</div>
                                <p className="text-gray-600 text-xs mt-2 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Water Management Indicators */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Water Management Indicators</h2>
                    <IndicatorSection title="Governance" indicators={countyData.waterIndicators} defaultOpen={true} />
                    <IndicatorSection
                        title="Measurement, Reporting, and Verification(MRV)"
                        indicators={countyData.waterIndicators}
                    />
                    <IndicatorSection title="Mitigation" indicators={countyData.waterIndicators} />
                    <IndicatorSection title="Adaptation" indicators={countyData.waterIndicators} />
                    <IndicatorSection title="Finance & Technology Transfer" indicators={countyData.waterIndicators} />
                </div>

                {/* Waste Management Indicators */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Waste Management Indicators</h2>
                    <IndicatorSection title="Governance" indicators={countyData.wasteIndicators} />
                    <IndicatorSection
                        title="Measurement, Reporting, and Verification(MRV)"
                        indicators={countyData.wasteIndicators}
                        defaultOpen={true}
                    />
                    <IndicatorSection title="Mitigation" indicators={countyData.wasteIndicators} />
                    <IndicatorSection title="Adaptation" indicators={countyData.wasteIndicators} />
                    <IndicatorSection title="Finance & Technology Transfer" indicators={countyData.wasteIndicators} />
                </div>
            </div>

            <Footer />
        </div>
    )
}
