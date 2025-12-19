// client/pages/County/index.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { IndicatorSection } from "@/components/indicator-section"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { listCounties, getCountyPerformance, listIndicators, listThematicAreas, getCountySummaryPerformance } from "@/lib/supabase-api"

interface Indicator {
  id: number;
  sector: 'water' | 'waste';
  thematic_area: string;
  indicator_text: string;
  description?: string;
  weight?: number;
}

interface ThematicArea {
  id: number;
  name: string;
  sector: 'water' | 'waste';
  weight_percentage: number;
}

interface IndicatorItem {
  no: number;
  indicator: string;
  description: string;
  score: number;
}

export default function CountyPage() {
  const { countyName = "" } = useParams<{ countyName: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indicators, setIndicators] = useState<Indicator[]>([])

  // Use React Query for thematic areas to automatically refetch when they change
  const { data: thematicAreas = [] } = useQuery<ThematicArea[]>({
    queryKey: ["thematicAreas"],
    queryFn: listThematicAreas,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Calculate score for a single indicator based on response or use saved score
  const calculateIndicatorScore = (indicator: Indicator, response: string, savedScore: string | number | undefined): number => {
    // If there's a saved score, use it (editable score takes precedence)
    if (savedScore !== undefined && savedScore !== null && savedScore !== "") {
      const scoreValue = parseFloat(String(savedScore));
      if (!isNaN(scoreValue)) {
        return Math.max(0, Math.min(scoreValue, indicator.weight || 10)); // Clamp between 0 and max weight
      }
    }
    
    // Otherwise, calculate from response
    if (!response || response === "") return 0;
    
    // For now, use weight as max score and calculate based on response type
    const maxScore = indicator.weight || 10;
    
    // If response is a number (percentage or count), calculate proportional score
    if (!isNaN(parseFloat(response))) {
      const numValue = parseFloat(response);
      // For percentages, divide by 10 to get score out of 10
      if (String(response).includes('%')) {
        return Math.min((numValue / 10) * (maxScore / 10), maxScore);
      }
      // For other numbers, use a scaling factor
      return Math.min((numValue / 100) * maxScore, maxScore);
    }
    
    // For yes/no responses
    if (response.toLowerCase() === "yes" || response.toLowerCase() === "y") {
      return maxScore;
    }
    if (response.toLowerCase() === "no" || response.toLowerCase() === "n") {
      return 0;
    }
    
    return 0;
  };

  // Group indicators by sector and thematic area
  // This function now ensures ALL thematic areas from the database are included, even if they have no indicators
  const groupIndicatorsByThematicArea = (
    sectorType: 'water' | 'waste', 
    indicatorsData: Record<string, any>, 
    allIndicators: Indicator[],
    allThematicAreas: ThematicArea[]
  ) => {
    const grouped: Record<string, IndicatorItem[]> = {};
    
    // First, initialize all thematic areas for this sector with empty arrays
    // This ensures thematic areas without indicators still appear
    const sectorThematicAreas = allThematicAreas.filter(ta => ta.sector === sectorType);
    sectorThematicAreas.forEach(ta => {
      grouped[ta.name] = [];
    });
    
    // Get all indicators for this sector
    const sectorIndicators = allIndicators.filter(ind => ind.sector === sectorType);
    
    // Group indicators by thematic area
    sectorIndicators.forEach((ind) => {
      const thematicArea = ind.thematic_area || "Other";
      if (!grouped[thematicArea]) {
        grouped[thematicArea] = [];
      }
      
      // Get saved data for this indicator
      const indicatorId = ind.id.toString();
      const savedData = indicatorsData[indicatorId] || { response: "", comment: "", score: "" };
      
      // Calculate score
      const score = calculateIndicatorScore(ind, savedData.response || "", savedData.score);
      
      grouped[thematicArea].push({
        no: grouped[thematicArea].length + 1,
        indicator: ind.indicator_text,
        description: savedData.comment || ind.description || "Data not yet entered.",
        score: score,
      });
    });
    
    // Sort thematic areas alphabetically, but prioritize common NDC areas
    const thematicAreaOrder = ["Governance & Policy Framework", "MRV", "Mitigation Actions", "Adaptation & Resilience", "Climate Finance & Investment"];
    const sortedGrouped: Record<string, IndicatorItem[]> = {};
    
    // First add common NDC thematic areas in order (if they exist)
    thematicAreaOrder.forEach(areaName => {
      const matchingArea = Object.keys(grouped).find(name => 
        name.toLowerCase().includes(areaName.toLowerCase().split(' ')[0]) ||
        areaName.toLowerCase().includes(name.toLowerCase().split(' ')[0])
      );
      if (matchingArea) {
        // Reset numbering for each thematic area
        sortedGrouped[matchingArea] = grouped[matchingArea].map((item, idx) => ({
          ...item,
          no: idx + 1
        }));
      }
    });
    
    // Then add all remaining thematic areas alphabetically
    Object.keys(grouped)
      .filter(areaName => !sortedGrouped[areaName])
      .sort((a, b) => a.localeCompare(b))
      .forEach(areaName => {
        // Reset numbering for each thematic area
        sortedGrouped[areaName] = grouped[areaName].map((item, idx) => ({
          ...item,
          no: idx + 1
        }));
      });
    
    return sortedGrouped;
  };

  useEffect(() => {
    const loadCounty = async () => {
      if (!countyName) return

      const urlName = decodeURIComponent(countyName).replace(/-/g, " ").trim()

      try {
        setLoading(true)
        setError(null)

        // 1. Fetch indicators and thematic areas
        const [allIndicators, allThematicAreas] = await Promise.all([
          listIndicators(),
          listThematicAreas()
        ]);
        setIndicators(allIndicators);

        // 2. Validate county exists
        const counties = await listCounties()
        const county = counties.find((c: any) => c.name.toLowerCase() === urlName.toLowerCase())
        if (!county) throw new Error(`County "${urlName}" not found in database`)

        // 3. Fetch real performance data and rankings
        const [perf, waterRankings, wasteRankings] = await Promise.all([
          getCountyPerformance(county.name, 2025),
          getCountySummaryPerformance('water', 2025),
          getCountySummaryPerformance('waste', 2025)
        ])

        // 4. Find county's rank in each sector
        // findIndex returns -1 if not found, so we need to handle that case
        const waterRankIndex = waterRankings.findIndex((r: any) => 
          (r.name || r.county_name)?.toLowerCase() === county.name.toLowerCase()
        )
        // If county found, rank is index + 1 (1-based). If not found or only one county, default to 1
        const waterRank = waterRankIndex >= 0 ? waterRankIndex + 1 : 1

        const wasteRankIndex = wasteRankings.findIndex((r: any) => 
          (r.name || r.county_name)?.toLowerCase() === county.name.toLowerCase()
        )
        // If county found, rank is index + 1 (1-based). If not found or only one county, default to 1
        const wasteRank = wasteRankIndex >= 0 ? wasteRankIndex + 1 : 1

        // 5. Group indicators by thematic area for water and waste
        // Pass thematic areas to ensure all are included, even without indicators
        const waterGrouped = groupIndicatorsByThematicArea('water', perf.waterIndicators || {}, allIndicators, allThematicAreas);
        const wasteGrouped = groupIndicatorsByThematicArea('waste', perf.wasteIndicators || {}, allIndicators, allThematicAreas);

        setData({
          name: perf.county || county.name,
          waterScore: Number(perf.waterScore || 0).toFixed(1),
          wasteScore: Number(perf.wasteScore || 0).toFixed(1),
          waterRank: waterRank || 1,
          wasteRank: wasteRank || 1,
          indicators: {
            governance: perf.indicators?.governance || "0.0",
            mrv: perf.indicators?.mrv || "0.0",
            mitigation: perf.indicators?.mitigation || "0.0",
            adaptation: perf.indicators?.adaptation || "0.0",
            finance: perf.indicators?.finance || "0.0",
          },
          water: waterGrouped,
          waste: wasteGrouped,
        })
      } catch (err: any) {
        console.error("Load failed:", err)
        setError(err.message || "Failed to load county data")
      } finally {
        setLoading(false)
      }
    }

    loadCounty()
  }, [countyName])

  // Get thematic area scores for display in cards
  const getThematicAreaScores = (sectorType: 'water' | 'waste'): Array<{ name: string; score: number }> => {
    if (!data || !thematicAreas || !indicators) return [];
    
    // Filter thematic areas by sector
    const sectorThematicAreas = thematicAreas.filter(ta => ta.sector === sectorType);
    
    // Get grouped indicators for this sector (these are IndicatorItem[] with scores already calculated)
    const groupedIndicators = sectorType === 'water' ? data.water : data.waste;
    
    // Calculate scores for each thematic area
    return sectorThematicAreas.map(ta => {
      // Get indicator items for this thematic area (already grouped with scores)
      const indicatorItems = groupedIndicators[ta.name] || [];
      const totalScore = indicatorItems.reduce((sum: number, item: IndicatorItem) => sum + item.score, 0);
      
      // Get max score from indicator weights for this thematic area
      // Find all indicators in the full list that match this sector and thematic area
      const matchingIndicators = indicators.filter((ind: Indicator) => 
        ind.sector === sectorType && ind.thematic_area === ta.name
      );
      const maxScore = matchingIndicators.reduce((sum: number, ind: Indicator) => sum + (ind.weight || 0), 0);
      
      // Calculate raw score using MRV formula: (score/max score)*100
      let rawScore = 0;
      if (indicatorItems.length > 0 && maxScore > 0) {
        rawScore = (totalScore / maxScore) * 100;
      } else if (indicatorItems.length === 0) {
        // If no indicators exist yet, try to get from performance data as fallback
        const perfKey = ta.name.toLowerCase().includes('governance') ? 'governance' :
                        ta.name.toLowerCase().includes('mrv') ? 'mrv' :
                        ta.name.toLowerCase().includes('mitigation') ? 'mitigation' :
                        ta.name.toLowerCase().includes('adaptation') ? 'adaptation' :
                        ta.name.toLowerCase().includes('finance') ? 'finance' : null;
        if (perfKey && data.indicators) {
          rawScore = parseFloat(data.indicators[perfKey]) || 0;
        }
      }
      
      // Multiply by thematic area weight percentage (e.g., 80 × 30% = 24)
      const weightPercentage = ta.weight_percentage || 0;
      const weightedScore = rawScore * (weightPercentage / 100);
      
      return {
        name: ta.name,
        score: Math.round(weightedScore * 100) / 100 // Round to 2 decimal places
      };
    });
  };

  // Memoize thematic area scores for water and waste
  const waterThematicAreaScores = useMemo(() => getThematicAreaScores('water'), [data, thematicAreas, indicators]);
  const wasteThematicAreaScores = useMemo(() => getThematicAreaScores('waste'), [data, thematicAreas, indicators]);

  // Loading & Error States
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-700">Loading county data...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-4xl font-bold text-red-600 mb-4">County Not Found</h1>
          <p className="text-lg text-gray-700 max-w-md">{error || "No data available yet."}</p>
        </div>
      </div>
    )
  }

  // MAIN PAGE — YOUR BEAUTIFUL UI
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="county" />

      {/* Hero */}
      <div
        className="bg-cover bg-center h-64 relative flex items-center justify-center text-center px-6"
        style={{ backgroundImage: "url(/background.png)" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-white">
          <h1 className="text-5xl md:text-6xl font-bold">{data.name}</h1>
          <p className="text-xl mt-4 opacity-90">Water & Waste Management NDC Performance Index</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Score Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-24">
              <img src="/image 9.svg" alt="Kenya Map" className="w-full" />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
                <div className="text-6xl font-bold text-gray-900">{data.waterRank || 1}</div>
                <p className="text-gray-600 mt-3 text-lg">Water Sector National Rank</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
                <div className="text-6xl font-bold text-gray-900">{data.wasteRank || 1}</div>
                <p className="text-gray-600 mt-3 text-lg">Waste Management National Rank</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Water Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border">
                <div className="flex items-center gap-5 mb-6">
                  <img src="/Blur.png" alt="Water" className="w-16 h-16" />
                  <div>
                    <h3 className="text-2xl font-bold">Water Sector</h3>
                    <div className="text-5xl font-bold text-blue-700">{data.waterScore}/100</div>
                  </div>
                </div>
                <div className="w-full bg-white/70 rounded-full h-4">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${data.waterScore}%` }} />
                </div>
                <div className="mt-6 space-y-3 text-sm">
                  {waterThematicAreaScores.length > 0 ? (
                    waterThematicAreaScores.map((area) => (
                      <div key={area.name} className="flex justify-between font-medium">
                        <span>{area.name}</span>
                        <span>{area.score}/100</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-xs py-2">No thematic areas available yet.</div>
                  )}
                </div>
              </div>

              {/* Waste Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border">
                <div className="flex items-center gap-5 mb-6">
                  <img src="/Blur.png" alt="Waste" className="w-16 h-16" />
                  <div>
                    <h3 className="text-2xl font-bold">Waste Management</h3>
                    <div className="text-5xl font-bold text-green-700">{data.wasteScore}/100</div>
                  </div>
                </div>
                <div className="w-full bg-white/70 rounded-full h-4">
                  <div className="bg-green-600 h-full rounded-full transition-all duration-1000" style={{ width: `${data.wasteScore}%` }} />
                </div>
                <div className="mt-6 space-y-3 text-sm">
                  {wasteThematicAreaScores.length > 0 ? (
                    wasteThematicAreaScores.map((area) => (
                      <div key={area.name} className="flex justify-between font-medium">
                        <span>{area.name}</span>
                        <span>{area.score}/100</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-xs py-2">No thematic areas available yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Indicators */}
        <div className="mt-20 space-y-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-10">Water Management Indicators</h2>
            {Object.keys(data.water).length > 0 ? (
              Object.entries(data.water).map(([thematicAreaName, indicators]: [string, any]) => (
                <IndicatorSection 
                  key={thematicAreaName} 
                  title={thematicAreaName} 
                  indicators={indicators} 
                  defaultOpen={thematicAreaName.toLowerCase().includes('governance')}
                />
              ))
            ) : (
              <p className="text-gray-600 py-8">No indicators available for water management yet.</p>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-10">Waste Management Indicators</h2>
            {Object.keys(data.waste).length > 0 ? (
              Object.entries(data.waste).map(([thematicAreaName, indicators]: [string, any]) => (
                <IndicatorSection 
                  key={thematicAreaName} 
                  title={thematicAreaName} 
                  indicators={indicators} 
                  defaultOpen={false}
                />
              ))
            ) : (
              <p className="text-gray-600 py-8">No indicators available for waste management yet.</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
