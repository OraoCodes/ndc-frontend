import { MainLayout } from "@/components/MainLayout";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CountyRecord {
  id: string;
  county: string;
  created: string;
  createdBy: string;
  year: number;
  status: "Published" | "Draft";
}

const initialCounties: CountyRecord[] = [
  {
    id: "1",
    county: "Nairobi",
    created: "Nov 15, 2025",
    createdBy: "Jane Doe",
    year: 2024,
    status: "Published",
  },
  {
    id: "2",
    county: "Mombasa",
    created: "Nov 15, 2025",
    createdBy: "Jane Doe",
    year: 2024,
    status: "Published",
  },
  {
    id: "3",
    county: "Nairobi",
    created: "Nov 15, 2025",
    createdBy: "Jane Doe",
    year: 2024,
    status: "Published",
  },
  {
    id: "4",
    county: "Mombasa",
    created: "Nov 15, 2025",
    createdBy: "Jane Doe",
    year: 2024,
    status: "Published",
  },
  {
    id: "5",
    county: "Nairobi",
    created: "Nov 15, 2025",
    createdBy: "Jane Doe",
    year: 2024,
    status: "Published",
  },
  {
    id: "6",
    county: "Mombasa",
    created: "Nov 15, 2025",
    createdBy: "Jane Doe",
    year: 2024,
    status: "Published",
  },
  {
    id: "7",
    county: "Nairobi",
    created: "Nov 15, 2025",
    createdBy: "Jane Doe",
    year: 2024,
    status: "Draft",
  },
  {
    id: "8",
    county: "Mombasa",
    created: "Nov 15, 2025",
    createdBy: "Jane Doe",
    year: 2024,
    status: "Draft",
  },
];

export default function CountiesList() {
  const navigate = useNavigate();
  const [counties] = useState<CountyRecord[]>(initialCounties);

  const getStatusColor = (status: string) => {
    return status === "Published"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Counties</h2>
          <button
            onClick={() => navigate("/county-data")}
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
                    County
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Year
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Operation
                  </th>
                </tr>
              </thead>
              <tbody>
                {counties.map((county, index) => (
                  <tr
                    key={county.id}
                    className={cn(
                      "border-b border-border hover:bg-background/50 transition-colors",
                      index === counties.length - 1 && "border-b-0"
                    )}
                  >
                    <td className="py-4 px-6 text-foreground text-sm font-medium">
                      {county.county}
                    </td>
                    <td className="py-4 px-6 text-foreground text-sm">
                      {county.created}
                    </td>
                    <td className="py-4 px-6 text-foreground text-sm">
                      {county.createdBy}
                    </td>
                    <td className="py-4 px-6 text-foreground text-sm">
                      {county.year}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={cn(
                          "inline-block px-3 py-1 rounded text-xs font-medium",
                          getStatusColor(county.status)
                        )}
                      >
                        {county.status}
                      </span>
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
