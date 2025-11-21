import { MainLayout } from "@/components/MainLayout";
import { ChevronDown, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api, type ThematicArea } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";

interface Indicator {
  thematicArea: string;
  indicator: string;
  score: string;
}

const waterIndicators: Indicator[] = [
  {
    thematicArea: "Governance",
    indicator: "Number of institutional arrangements reviewed and restructured for climate action",
    score: "",
  },
  {
    thematicArea: "Governance",
    indicator: "Number of institutional arrangements reviewed and restructured for climate action",
    score: "",
  },
  {
    thematicArea: "Governance",
    indicator: "Number of institutional arrangements reviewed and restructured for climate action",
    score: "",
  },
  {
    thematicArea: "Governance",
    indicator: "Number of institutional arrangements reviewed and restructured for climate action",
    score: "",
  },
  {
    thematicArea: "Governance",
    indicator: "Number of institutional arrangements reviewed and restructured for climate action",
    score: "",
  },
];

const wasteIndicators: Indicator[] = [
  {
    thematicArea: "Governance",
    indicator: "Number of institutional arrangements reviewed and restructured for climate action",
    score: "",
  },
  {
    thematicArea: "Governance",
    indicator: "Number of institutional arrangements reviewed and restructured for climate action",
    score: "",
  },
  {
    thematicArea: "Governance",
    indicator: "Number of institutional arrangements reviewed and restructured for climate action",
    score: "",
  },
  {
    thematicArea: "Governance",
    indicator: "Number of institutional arrangements reviewed and restructured for climate action",
    score: "",
  },
  {
    thematicArea: "Governance",
    indicator: "Number of institutional arrangements reviewed and restructured for climate action",
    score: "",
  },
];

export default function CountyData() {
  const [county, setCounty] = useState("");
  const [year, setYear] = useState("");
  const [population, setPopulation] = useState<number | "">("");
  const [thematicAreaId, setThematicAreaId] = useState<number | null>(null);

  // indicator scores kept in local state (not persisted by current backend)
  const [waterScores, setWaterScores] = useState<string[]>(() => waterIndicators.map(() => ""));
  const [wasteScores, setWasteScores] = useState<string[]>(() => wasteIndicators.map(() => ""));

  // load thematic areas for select
  const { data: thematicAreas } = useQuery<ThematicArea[]>({
    queryKey: ["thematicAreas"],
    queryFn: api.listThematicAreas,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  // detect edit mode via location state: { countyId }
  const location = useLocation();
  const editingId = (location.state as any)?.countyId as number | undefined;

  // If editing, fetch the county and populate form
  const { data: existingCounty } = useQuery({
    queryKey: ["county", editingId],
    queryFn: () => (editingId ? api.getCounty(Number(editingId)) : Promise.resolve(null as any)),
    enabled: !!editingId,
  });

  useEffect(() => {
    if (existingCounty) {
      setCounty(existingCounty.name ?? "");
      setPopulation(existingCounty.population ?? "");
      setThematicAreaId(existingCounty.thematic_area_id ?? null);
    }
  }, [existingCounty]);

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; population?: number | null; thematic_area_id?: number | null }) =>
      api.createCounty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      toast({ title: "Saved", description: "County created successfully." });
      setCounty("");
      setYear("");
      setPopulation("");
      setThematicAreaId(null);
      setWaterScores(waterIndicators.map(() => ""));
      setWasteScores(wasteIndicators.map(() => ""));
      navigate("/counties-list");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message ?? "Failed to create county" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; name: string; population?: number | null; thematic_area_id?: number | null }) =>
      api.updateCounty(payload.id, { name: payload.name, population: payload.population, thematic_area_id: payload.thematic_area_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      toast({ title: "Saved", description: "County updated successfully." });
      navigate("/counties-list");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message ?? "Failed to update county" });
    },
  });

  return (
    <MainLayout>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">County Data</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded text-xs font-medium text-green-800">
              <CheckCircle size={16} />
              A
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded text-xs font-medium text-red-800">
              <AlertCircle size={16} />
              A
            </div>
            <span className="text-xs text-muted-foreground ml-2">Last edited at 15.2025</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-border space-y-6">
          {/* County and Year Selectors */}
          <div className="grid grid-cols-2 gap-6">
            {/* County */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                County
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Select county"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Year
              </label>
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 pr-10 bg-white border border-input rounded-lg text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Year</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Population and Thematic Area */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Population</label>
              <input
                type="number"
                value={population}
                onChange={(e) => setPopulation(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Population"
                className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Thematic Area</label>
              <select
                value={thematicAreaId ?? ""}
                onChange={(e) => setThematicAreaId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 pr-10 bg-white border border-input rounded-lg text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Unassigned</option>
                {thematicAreas?.map((ta) => (
                  <option key={ta.id} value={ta.id}>{ta.name}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Water Management Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Water Management
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-background border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Thematic Area
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Indicator
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {waterIndicators.map((indicator, index) => (
                    <tr key={index} className="border-b border-border hover:bg-background/50">
                      <td className="py-3 px-4 text-foreground">
                        {indicator.thematicArea}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {indicator.indicator}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Enter score"
                          className="w-20 px-2 py-1 border border-input rounded text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Waste Management Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Waste Management
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-background border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Thematic Area
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Indicator
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {wasteIndicators.map((indicator, index) => (
                    <tr key={index} className="border-b border-border hover:bg-background/50">
                      <td className="py-3 px-4 text-foreground">
                        {indicator.thematicArea}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {indicator.indicator}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Enter score"
                          className="w-20 px-2 py-1 border border-input rounded text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={() => {
              const payload = { name: county, population: population === "" ? null : Number(population), thematic_area_id: thematicAreaId };
              if (editingId) {
                updateMutation.mutate({ id: Number(editingId), ...payload });
              } else {
                createMutation.mutate(payload);
              }
            }}
            className="w-full px-4 py-2 bg-sidebar text-sidebar-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            {createMutation.status === "pending" || updateMutation.status === "pending" ? "Saving..." : editingId ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
