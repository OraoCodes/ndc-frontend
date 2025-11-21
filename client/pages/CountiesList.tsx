import { MainLayout } from "@/components/MainLayout";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type County } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CountiesList() {
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery<County[]>({
    queryKey: ["counties"],
    queryFn: api.listCounties,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteCounty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      toast({ title: "Deleted", description: "County deleted." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message ?? "Failed to delete county" });
    },
  });

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
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">County</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Population</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Thematic Area ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Operation</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="py-6 px-6 text-center text-muted-foreground">Loading...</td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={4} className="py-6 px-6 text-center text-destructive">Error: {(error as Error)?.message}</td>
                  </tr>
                )}
                {data?.map((county, index) => (
                  <tr key={county.id} className={(index === (data?.length ?? 0) - 1 ? "border-b-0" : "border-b border-border") + " hover:bg-background/50 transition-colors"}>
                    <td className="py-4 px-6 text-foreground text-sm font-medium">{county.name}</td>
                    <td className="py-4 px-6 text-foreground text-sm">{county.population ?? '-'}</td>
                    <td className="py-4 px-6 text-foreground text-sm">{county.thematic_area_id ?? '-'}</td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => navigate("/county-data", { state: { countyId: county.id } })}
                          className="text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete county "${county.name}"?`)) {
                              deleteMutation.mutate(Number(county.id));
                            }
                          }}
                          className="text-destructive hover:text-destructive/80 transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data && data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 px-6 text-center text-muted-foreground">No counties found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
