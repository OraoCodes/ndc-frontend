import { MainLayout } from "@/components/MainLayout";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ThematicAreaRow {
  id: string;
  sector: "Water" | "Waste";
  thematicArea: string;
  indicators: number;
}

const thematicAreasData: ThematicAreaRow[] = [
  { id: "1", sector: "Water", thematicArea: "Governance & Institutional Arrangements", indicators: 5 },
  { id: "2", sector: "Water", thematicArea: "MRV (Monitoring, Reporting & Verification)", indicators: 5 },
  { id: "3", sector: "Water", thematicArea: "Mitigation", indicators: 5 },
  { id: "4", sector: "Water", thematicArea: "Adaptation & Resilience", indicators: 5 },
  { id: "5", sector: "Water", thematicArea: "Finance & Resource Mobilization", indicators: 5 },
  { id: "6", sector: "Waste", thematicArea: "Governance & Institutional Arrangements", indicators: 5 },
  { id: "7", sector: "Waste", thematicArea: "MRV (Monitoring, Reporting & Verification)", indicators: 5 },
  { id: "8", sector: "Waste", thematicArea: "Mitigation", indicators: 5 },
  { id: "9", sector: "Waste", thematicArea: "Adaptation & Resilience", indicators: 5 },
  { id: "10", sector: "Waste", thematicArea: "Finance & Resource Mobilization", indicators: 5 },
];

export default function ThematicAreas() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Thematic Areas</h2>
          </div>
          <button
            onClick={() => navigate("/thematic-areas/add")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            <Plus size={18} />
            Add New
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Sector
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Thematic Area
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Indicators
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Operation
                  </th>
                </tr>
              </thead>
              <tbody>
                {thematicAreasData.map((row, index) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-border hover:bg-background/50 transition-colors",
                      index === thematicAreasData.length - 1 && "border-b-0"
                    )}
                  >
                    <td className="py-4 px-6 text-foreground text-sm font-medium">
                      {row.sector}
                    </td>
                    <td className="py-4 px-6 text-foreground text-sm">
                      {row.thematicArea}
                    </td>
                    <td className="py-4 px-6 text-foreground text-sm">
                      {row.indicators}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex items-center gap-4">
                        <button className="text-primary hover:text-primary/80 transition-colors font-medium">
                          Edit
                        </button>
                        <button className="text-destructive hover:text-destructive/80 transition-colors font-medium">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
