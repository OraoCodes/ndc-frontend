import { MainLayout } from "@/components/MainLayout";
import { ChevronDown, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api, type ThematicArea } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";

// Define your real indicators (you can expand these)
const WATER_INDICATORS = [
  { id: "w1", thematicArea: "Governance", indicator: "Climate change coordination unit established", weight: 5 },
  { id: "w2", thematicArea: "Governance", indicator: "County climate change act enacted", weight: 5 },
  { id: "w3", thematicArea: "MRV", indicator: "Water sector GHG inventory completed", weight: 4 },
  { id: "w4", thematicArea: "Mitigation", indicator: "Water efficiency programs implemented", weight: 6 },
  { id: "w5", thematicArea: "Adaptation", indicator: "Drought early warning system operational", weight: 6 },
  { id: "w6", thematicArea: "Finance", indicator: "Climate budget tagging system in place", weight: 4 },
];

const WASTE_INDICATORS = [
  { id: "s1", thematicArea: "Governance", indicator: "County waste management policy adopted", weight: 5 },
  { id: "s2", thematicArea: "Governance", indicator: "Waste collection by-laws enforced", weight: 5 },
  { id: "s3", thematicArea: "MRV", indicator: "Waste sector GHG emissions tracked", weight: 4 },
  { id: "s4", thematicArea: "Mitigation", indicator: "Landfill gas capture project active", weight: 7 },
  { id: "s5", thematicArea: "Adaptation", indicator: "Circular economy initiatives launched", weight: 5 },
  { id: "s6", thematicArea: "Finance", indicator: "Waste revenue used for climate projects", weight: 4 },
];

export default function CountyData() {
  const [county, setCounty] = useState("");
  const [year, setYear] = useState("2025");
  const [population, setPopulation] = useState<number | "">("");
  const [thematicAreaId, setThematicAreaId] = useState<number | null>(null);

  // Scores state
  const [waterScores, setWaterScores] = useState<Record<string, string>>({});
  const [wasteScores, setWasteScores] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editingId = (location.state as any)?.countyId as number | undefined;

  // Load thematic areas
  const { data: thematicAreas } = useQuery<ThematicArea[]>({
    queryKey: ["thematicAreas"],
    queryFn: api.listThematicAreas,
  });

  // Load existing county
  const { data: existingCounty } = useQuery({
    queryKey: ["county", editingId],
    queryFn: () => (editingId ? api.getCounty(Number(editingId)) : Promise.resolve(null)),
    enabled: !!editingId,
  });

  // Load existing performance data
  const { data: existingPerformance } = useQuery({
    queryKey: ["countyPerformance", editingId, year],
    queryFn: async () => {
      if (!editingId || !year) return null;
      const res = await fetch(`/api/counties/${editingId}/performance?year=${year}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!editingId && !!year,
  });

  // Populate form when editing
  useEffect(() => {
    if (existingCounty) {
      setCounty(existingCounty.name ?? "");
      setPopulation(existingCounty.population ?? "");
      setThematicAreaId(existingCounty.thematic_area_id ?? null);
    }
  }, [existingCounty]);

  // Populate scores when performance data loads
  useEffect(() => {
    if (existingPerformance) {
      // Map water indicators
      if (existingPerformance.waterIndicators?.length > 0) {
        const scoreMap: Record<string, string> = {};
        existingPerformance.waterIndicators.forEach((ind: any, i: number) => {
          const key = WATER_INDICATORS[i]?.id || `w${i}`;
          scoreMap[key] = ind.score?.toString() || "";
        });
        setWaterScores(scoreMap);
      }

      // Map waste indicators
      if (existingPerformance.wasteIndicators?.length > 0) {
        const scoreMap: Record<string, string> = {};
        existingPerformance.wasteIndicators.forEach((ind: any, i: number) => {
          const key = WASTE_INDICATORS[i]?.id || `s${i}`;
          scoreMap[key] = ind.score?.toString() || "";
        });
        setWasteScores(scoreMap);
      }
    }
  }, [existingPerformance]);

  // Helper: calculate sector score
  const calculateSectorScore = (scores: Record<string, string>, indicators: typeof WATER_INDICATORS) => {
    let totalWeighted = 0;
    let totalWeight = 0;
    indicators.forEach(ind => {
      const score = parseFloat(scores[ind.id] || "0") || 0;
      totalWeighted += score * ind.weight;
      totalWeight += ind.weight;
    });
    return totalWeight > 0 ? (totalWeighted / totalWeight) : 0;
  };

  // Save county + performance
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!county || !year) throw new Error("County and year are required");

      // 1. Create/Update county
      let countyId = editingId;
      if (!editingId) {
        const res = await api.createCounty({ name: county, population: population || null, thematic_area_id: thematicAreaId });
        countyId = res.id;
      } else {
        await api.updateCounty(editingId, { name: county, population: population || null, thematic_area_id: thematicAreaId });
      }

      if (!countyId) throw new Error("Failed to get county ID");

      // 2. Save Water performance
      const waterScore = calculateSectorScore(waterScores, WATER_INDICATORS);
      const waterIndicators = WATER_INDICATORS.map(ind => ({
        indicator: ind.indicator,
        description: "",
        score: parseFloat(waterScores[ind.id] || "0") || 0,
      }));

      await fetch(`/api/counties/${countyId}/performance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: Number(year),
          sector: "water",
          sector_score: waterScore,
          overall_score: waterScore,
          indicators: waterIndicators,
        }),
      });

      // 3. Save Waste performance
      const wasteScore = calculateSectorScore(wasteScores, WASTE_INDICATORS);
      const wasteIndicators = WASTE_INDICATORS.map(ind => ({
        indicator: ind.indicator,
        description: "",
        score: parseFloat(wasteScores[ind.id] || "0") || 0,
      }));

      await fetch(`/api/counties/${countyId}/performance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: Number(year),
          sector: "waste",
          sector_score: wasteScore,
          overall_score: wasteScore,
          indicators: wasteIndicators,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      queryClient.invalidateQueries({ queryKey: ["countyPerformance"] });
      toast({ title: "Success", description: "County data saved successfully!" });
      navigate("/counties-list");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to save data" });
    },
  });

  return (
    <MainLayout>
      <div className="max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">
            {editingId ? "Edit" : "Add"} County Performance Data
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-8 space-y-8">
          {/* County & Year */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">County Name</label>
              <input
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Nairobi"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Population (optional)</label>
              <input
                type="number"
                value={population}
                onChange={(e) => setPopulation(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="4,397,073"
              />
            </div>
          </div>

          {/* Water Management */}
          <div className="border-t pt-8">
            <h3 className="text-xl font-bold text-blue-700 mb-6">Water Management Indicators</h3>
            <div className="space-y-4">
              {WATER_INDICATORS.map((ind) => (
                <div key={ind.id} className="flex items-center gap-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{ind.thematicArea}</div>
                    <div className="text-sm text-gray-600 mt-1">{ind.indicator}</div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={waterScores[ind.id] || ""}
                    onChange={(e) => setWaterScores(prev => ({ ...prev, [ind.id]: e.target.value }))}
                    className="w-24 px-3 py-2 border rounded-lg text-center font-semibold"
                    placeholder="0-10"
                  />
                  <span className="text-sm text-gray-500">Weight: {ind.weight}</span>
                </div>
              ))}
              <div className="text-right font-bold text-lg text-blue-700">
                Sector Score: {calculateSectorScore(waterScores, WATER_INDICATORS).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Waste Management */}
          <div className="border-t pt-8">
            <h3 className="text-xl font-bold text-green-700 mb-6">Waste Management Indicators</h3>
            <div className="space-y-4">
              {WASTE_INDICATORS.map((ind) => (
                <div key={ind.id} className="flex items-center gap-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{ind.thematicArea}</div>
                    <div className="text-sm text-gray-600 mt-1">{ind.indicator}</div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={wasteScores[ind.id] || ""}
                    onChange={(e) => setWasteScores(prev => ({ ...prev, [ind.id]: e.target.value }))}
                    className="w-24 px-3 py-2 border rounded-lg text-center font-semibold"
                    placeholder="0-10"
                  />
                  <span className="text-sm text-gray-500">Weight: {ind.weight}</span>
                </div>
              ))}
              <div className="text-right font-bold text-lg text-green-700">
                Sector Score: {calculateSectorScore(wasteScores, WASTE_INDICATORS).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !county || !year}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saveMutation.isPending ? "Saving..." : editingId ? "Update Data" : "Save County Data"}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
