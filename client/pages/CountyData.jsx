import { MainLayout } from "@/components/MainLayout";
import { CheckCircle, AlertCircle, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getCounty, createCounty, updateCounty, saveCountyPerformance, getCountyPerformanceByCountyId } from "@/lib/supabase-api";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";

// Real NDC Index Pillars & Weights
const PILLARS = {
  Governance: { weight: 30, color: "blue" },
  MRV: { weight: 20, color: "purple" },
  Mitigation: { weight: 20, color: "emerald" },
  Adaptation: { weight: 15, color: "orange" },
  Finance: { weight: 15, color: "pink" },
};

// Real indicators from your document
const INDICATORS = [
  // Governance (30%)
  { id: "g1", pillar: "Governance", label: "Relevant sector policy aligned with NDCs exists", type: "yesno", weight: 6 },
  { id: "g2", pillar: "Governance", label: "% of staff trained in climate-related planning", type: "percent", weight: 5 },
  { id: "g3", pillar: "Governance", label: "Climate targets in county performance contracts", type: "yesno", weight: 5 },
  { id: "g4", pillar: "Governance", label: "Climate goals in County Integrated Development Plan (CIDP)", type: "yesno", weight: 6 },
  { id: "g5", pillar: "Governance", label: "Stakeholder participation mechanism established", type: "yesno", weight: 5 },
  { id: "g6", pillar: "Governance", label: "Coordination mechanism established (committees, MoUs)", type: "yesno", weight: 3 },

  // MRV (20%)
  { id: "m1", pillar: "MRV", label: "MRV system for NDC tracking exists", type: "yesno", weight: 5 },
  { id: "m2", pillar: "MRV", label: "Frequency of data updates", type: "select", options: ["Never", "Annually", "Quarterly", "Monthly"], scores: [0, 3, 4, 5], weight: 4 },
  { id: "m3", pillar: "MRV", label: "% of indicators with available data", type: "percent", weight: 4 },
  { id: "m4", pillar: "MRV", label: "Sector emission inventories available", type: "yesno", weight: 3 },
  { id: "m5", pillar: "MRV", label: "County submits reports to national MRV system", type: "yesno", weight: 3 },
  { id: "m6", pillar: "MRV", label: "Verification mechanism in place", type: "yesno", weight: 1 },

  // Mitigation (20%)
  { id: "mit1", pillar: "Mitigation", label: "GHG emission reduction target exists", type: "yesno", weight: 4 },
  { id: "mit2", pillar: "Mitigation", label: "Annual GHG reduction achieved (%)", type: "percent", weight: 5 },
  { id: "mit3", pillar: "Mitigation", label: "Renewable energy share in sector (%)", type: "percent", weight: 3 },
  { id: "mit4", pillar: "Mitigation", label: "Waste diverted from landfill (%)", type: "percent", weight: 4 },
  { id: "mit5", pillar: "Mitigation", label: "Methane capture systems in use", type: "yesno", weight: 3 },
  { id: "mit6", pillar: "Mitigation", label: "Circular economy initiatives adopted", type: "yesno", weight: 1 },

  // Adaptation (15%)
  { id: "a1", pillar: "Adaptation", label: "Climate risk assessment conducted", type: "yesno", weight: 4 },
  { id: "a2", pillar: "Adaptation", label: "% population with resilient infrastructure", type: "percent", weight: 4 },
  { id: "a3", pillar: "Adaptation", label: "Early warning systems operational (count)", type: "number", weight: 3 },
  { id: "a4", pillar: "Adaptation", label: "Ecosystem restoration area (hectares)", type: "number", weight: 2 },
  { id: "a5", pillar: "Adaptation", label: "Drought/flood response protocols in place", type: "yesno", weight: 2 },

  // Finance (15%)
  { id: "f1", pillar: "Finance", label: "Climate budget line exists", type: "yesno", weight: 4 },
  { id: "f2", pillar: "Finance", label: "Climate budget allocation (% of total)", type: "percent", weight: 4 },
  { id: "f3", pillar: "Finance", label: "Climate finance mobilized (KES millions)", type: "number", weight: 3 },
  { id: "f4", pillar: "Finance", label: "Access to international climate finance", type: "yesno", weight: 3 },
  { id: "f5", pillar: "Finance", label: "Private sector participation in climate action", type: "yesno", weight: 2 },
];

export default function CountyData() {
  const [county, setCounty] = useState("");
  const [year, setYear] = useState("2025");
  const [population, setPopulation] = useState("");
  const [sector, setSector] = useState("water");
  const [scores, setScores] = useState({});

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editingId = location.state?.countyId;

  const { data: existingCounty } = useQuery({
    queryKey: ["county", editingId],
    queryFn: () => editingId ? getCounty(editingId) : Promise.resolve(null),
    enabled: !!editingId,
  });

  // Load saved performance data when editing or when sector/year changes
  useEffect(() => {
    const loadPerformanceData = async () => {
      // Only load if we have a county ID (editing mode) and valid year/sector
      if (!editingId || !year || !sector) {
        // If not in editing mode, clear scores
        if (!editingId) {
          setScores({});
        }
        return;
      }

      try {
        const performance = await getCountyPerformanceByCountyId(
          editingId,
          Number(year),
          sector
        );

        if (performance && performance.indicators_json) {
          // Load saved indicators into scores state
          setScores(performance.indicators_json || {});
        } else {
          // No saved data for this sector/year, clear scores
          setScores({});
        }
      } catch (err) {
        console.error("Error loading performance data:", err);
        // If there's an error, just clear scores
        setScores({});
      }
    };

    loadPerformanceData();
  }, [editingId, year, sector]);

  useEffect(() => {
    if (existingCounty) {
      setCounty(existingCounty.name || "");
      setPopulation(existingCounty.population || "");
    }
  }, [existingCounty]);

  // Calculate pillar and total scores
  const calculateScores = () => {
    const pillarScores = {};
    let totalScore = 0;

    Object.keys(PILLARS).forEach((pillar) => {
      let pillarTotal = 0;
      let pillarWeight = 0;

      INDICATORS.filter(i => i.pillar === pillar).forEach(ind => {
        const val = scores[ind.id] || "";
        let score = 0;

        if (ind.type === "yesno") score = val === "yes" ? 10 : 0;
        if (ind.type === "percent") score = Math.min(parseFloat(val) || 0, 100) / 10;
        if (ind.type === "number") score = Math.min((parseFloat(val) || 0) / 100, 10);
        if (ind.type === "select") {
          const idx = ind.options?.indexOf(val) ?? -1;
          score = idx >= 0 ? (ind.scores?.[idx] || 0) : 0;
        }

        pillarTotal += score * ind.weight;
        pillarWeight += ind.weight;
      });

      const normalized = pillarWeight > 0 ? (pillarTotal / pillarWeight) * 10 : 0;
      pillarScores[pillar] = Number(normalized.toFixed(1));
      totalScore += normalized * (PILLARS[pillar].weight / 100);
    });

    return { pillarScores, totalScore: Number(totalScore.toFixed(1)) };
  };

  const { pillarScores, totalScore } = calculateScores();

  const getRating = (score) => {
    if (score < 40) return { label: "Poor", color: "text-red-600 bg-red-50" };
    if (score < 55) return { label: "Average", color: "text-yellow-600 bg-yellow-50" };
    if (score < 70) return { label: "Good", color: "text-cyan-600 bg-cyan-50" };
    if (score < 80) return { label: "Satisfactory", color: "text-blue-600 bg-blue-50" };
    return { label: "Excellent", color: "text-green-600 bg-green-50" };
  };

  const rating = getRating(totalScore);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!county || !year) {
        throw new Error("County name and year are required");
      }

      if (!county.trim()) {
        throw new Error("Please enter a county name");
      }

      let countyId = editingId;
      
      // Create or update county
      if (!editingId) {
        try {
          const res = await createCounty({ 
            name: county.trim(), 
            population: population ? parseInt(population) : undefined 
          });
          countyId = res.id;
        } catch (err) {
          // If county already exists, try to find it
          const error = err || {};
          if (error?.code === '23505' || error?.message?.includes('duplicate') || error?.message?.includes('unique')) {
            const { listCounties } = await import("@/lib/supabase-api");
            const counties = await listCounties();
            const existing = counties.find(c => c.name.toLowerCase() === county.trim().toLowerCase());
            if (existing) {
              countyId = existing.id;
              // Update population if provided
              if (population) {
                await updateCounty(existing.id, { 
                  name: existing.name, 
                  population: parseInt(population) 
                });
              }
            } else {
              throw new Error("County name already exists. Please use a different name or edit the existing county.");
            }
          } else {
            throw err;
          }
        }
      } else {
        await updateCounty(editingId, { 
          name: county.trim(), 
          population: population ? parseInt(population) : undefined 
        });
      }

      // Prepare indicators JSON
      const indicatorsJson = Object.fromEntries(
        INDICATORS.map(i => [i.id, scores[i.id] || ""])
      );

      // Save county performance for the selected sector
      try {
        await saveCountyPerformance(
          countyId,
          Number(year),
          sector,
          {
            overall_score: totalScore,
            sector_score: totalScore,
            governance: pillarScores.Governance,
            mrv: pillarScores.MRV,
            mitigation: pillarScores.Mitigation,
            adaptation: pillarScores.Adaptation,
            finance: pillarScores.Finance,
            indicators_json: indicatorsJson,
          }
        );
        
        console.log("Successfully saved performance data:", {
          countyId,
          year: Number(year),
          sector,
          totalScore,
          pillarScores
        });
      } catch (err) {
        console.error("Error saving county performance:", err);
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        throw new Error(`Failed to save performance data: ${errorMessage}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      queryClient.invalidateQueries({ queryKey: ["county"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ 
        title: "Success", 
        description: `NDC Index data saved for ${sector} sector!` 
      });
      // Small delay before navigation to ensure toast is visible
      setTimeout(() => {
        navigate("/counties-list");
      }, 1000);
    },
    onError: (err) => {
      console.error("Save mutation error:", err);
      const errorMessage = err?.message || err?.toString() || "Failed to save data. Please try again.";
      toast({ 
        title: "Error", 
        description: errorMessage,
        variant: "destructive"
      });
    },
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Water & Waste NDC Implementation Index</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Track county performance across 5 climate pillars
          </p>
        </div>

        {/* County Info */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">County *</label>
            <input
              type="text"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="e.g. Kisumu"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year *</label>
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)} 
              className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {[2025, 2024, 2023, 2022, 2021].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sector *</label>
            <select 
              value={sector} 
              onChange={(e) => {
                const value = e.target.value;
                if (value === "water" || value === "waste") {
                  setSector(value);
                }
              }} 
              className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="water">Water</option>
              <option value="waste">Waste</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Population (optional)</label>
            <input
              type="number"
              value={population}
              onChange={(e) => setPopulation(e.target.value)}
              className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="e.g. 1200000"
              min="0"
            />
          </div>
          <div className="flex items-end">
            <div className={`w-full text-center py-4 rounded-lg font-bold text-2xl ${rating.color}`}>
              {totalScore.toFixed(1)} / 100 — {rating.label}
            </div>
          </div>
        </div>

        {/* Pillars */}
        {Object.keys(PILLARS).map(pillar => {
          const { weight, color } = PILLARS[pillar];
          const score = pillarScores[pillar] || 0;

          return (
            <div key={pillar} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
              <div className={`bg-${color}-600 text-white px-6 py-4 flex justify-between items-center`}>
                <h2 className="text-xl font-bold">{pillar} ({weight}%)</h2>
                <span className="text-2xl">{score.toFixed(1)}</span>
              </div>
              <div className="p-6 space-y-5">
                {INDICATORS.filter(i => i.pillar === pillar).map(ind => (
                  <div key={ind.id} className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{ind.label}</div>
                      <div className="text-xs text-gray-500 mt-1">Weight: {ind.weight}%</div>
                    </div>

                    {ind.type === "yesno" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setScores(prev => ({ ...prev, [ind.id]: "yes" }))}
                          className={`px-4 py-2 rounded ${scores[ind.id] === "yes" ? "bg-green-600 text-white" : "bg-gray-200"}`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setScores(prev => ({ ...prev, [ind.id]: "no" }))}
                          className={`px-4 py-2 rounded ${scores[ind.id] === "no" ? "bg-red-600 text-white" : "bg-gray-200"}`}
                        >
                          No
                        </button>
                      </div>
                    )}

                    {ind.type === "percent" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={scores[ind.id] || ""}
                          onChange={(e) => setScores(prev => ({ ...prev, [ind.id]: e.target.value }))}
                          className="w-24 px-3 py-2 border rounded text-center"
                          placeholder="0-100"
                        />
                        <span>%</span>
                      </div>
                    )}

                    {ind.type === "select" && (
                      <select
                        value={scores[ind.id] || ""}
                        onChange={(e) => setScores(prev => ({ ...prev, [ind.id]: e.target.value }))}
                        className="px-4 py-2 border rounded"
                      >
                        <option value="">Select...</option>
                        {ind.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {ind.type === "number" && (
                      <input
                        type="number"
                        value={scores[ind.id] || ""}
                        onChange={(e) => setScores(prev => ({ ...prev, [ind.id]: e.target.value }))}
                        className="w-32 px-3 py-2 border rounded text-center"
                        placeholder="Enter value"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex justify-center pt-8 gap-4">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !county || !year}
            className="flex items-center gap-3 px-10 py-4 bg-blue-500 text-white text-lg rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
          >
            <Save size={20} />
            {saveMutation.isPending ? "Saving..." : `Save ${sector.charAt(0).toUpperCase() + sector.slice(1)} Sector Data`}
          </button>
          {saveMutation.isPending && (
            <div className="flex items-center text-muted-foreground">
              <span className="animate-pulse">Saving to database...</span>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );

}
