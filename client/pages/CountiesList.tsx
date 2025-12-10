import { MainLayout } from "@/components/MainLayout";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCounties, deleteCounty, updateCounty, type County } from "@/lib/supabase-api";
import { useToast } from "@/hooks/use-toast";

export default function CountiesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<County[]>({
    queryKey: ["counties"],
    queryFn: async () => {
      try {
        return await listCounties();
      } catch (err: any) {
        console.error('CountiesList query error:', err);
        toast({
          title: "Error",
          description: err?.message || "Failed to load counties. Please check your connection.",
          variant: "destructive",
        });
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCounty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      toast({ title: "Success", description: "County deleted successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message ?? "Failed to delete county" });
    },
  });

  const handleStatusToggle = async (county: County) => {
    const newStatus = county.status === 'published' ? 'draft' : 'published';
    try {
      await updateCounty(county.id, { 
        name: county.name, 
        status: newStatus 
      });
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      toast({ 
        title: "Success", 
        description: `County status changed to ${newStatus}.` 
      });
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err?.message ?? "Failed to update status",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-3xl font-bold text-foreground">Counties</h2>
          <button
            onClick={() => navigate("/county-data")}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-medium shadow-lg"
          >
            <Plus size={20} />
            Add New County
          </button>
        </div>

        {/* Responsive Table / Card View */}
        <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left py-5 px-6 font-semibold text-foreground text-sm uppercase tracking-wider">COUNTY</th>
                  <th className="text-left py-5 px-6 font-semibold text-foreground text-sm uppercase tracking-wider">CREATED</th>
                  <th className="text-left py-5 px-6 font-semibold text-foreground text-sm uppercase tracking-wider">CREATED BY</th>
                  <th className="text-left py-5 px-6 font-semibold text-foreground text-sm uppercase tracking-wider">WATER MANAGEMENT</th>
                  <th className="text-left py-5 px-6 font-semibold text-foreground text-sm uppercase tracking-wider">WASTE MANAGEMENT</th>
                  <th className="text-left py-5 px-6 font-semibold text-foreground text-sm uppercase tracking-wider">STATUS</th>
                  <th className="text-left py-5 px-6 font-semibold text-foreground text-sm uppercase tracking-wider">OPERATION</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">Loading counties...</td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-destructive">Error: {(error as Error)?.message}</td>
                  </tr>
                )}
                {data?.map((county) => {
                  // Format created date
                  const createdDate = county.created_at 
                    ? new Date(county.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })
                    : '-';
                  
                  // Get creator name
                  const creatorName = county.created_by_user?.full_name || '-';
                  
                  // Get scores (round to nearest integer)
                  const waterScore = county.water_score !== null && county.water_score !== undefined
                    ? Math.round(county.water_score).toString()
                    : '-';
                  const wasteScore = county.waste_score !== null && county.waste_score !== undefined
                    ? Math.round(county.waste_score).toString()
                    : '-';
                  
                  // Status
                  const status = county.status || 'draft';
                  const isPublished = status === 'published';
                  
                  return (
                    <tr key={county.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-5 px-6 font-medium text-foreground">{county.name}</td>
                      <td className="py-5 px-6 text-foreground">{createdDate}</td>
                      <td className="py-5 px-6 text-foreground">{creatorName}</td>
                      <td className="py-5 px-6 text-foreground">{waterScore}</td>
                      <td className="py-5 px-6 text-foreground">{wasteScore}</td>
                      <td className="py-5 px-6">
                        <button
                          onClick={() => handleStatusToggle(county)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                            isPublished
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-400 text-white hover:bg-gray-500'
                          }`}
                          title={`Click to change status to ${isPublished ? 'Draft' : 'Published'}`}
                        >
                          {isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => navigate("/county-data", { state: { countyId: county.id } })}
                            className="text-primary hover:text-primary/80 font-medium underline transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${county.name}" permanently?`)) {
                                deleteMutation.mutate(Number(county.id));
                              }
                            }}
                            className="text-destructive hover:text-destructive/80 font-medium underline transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">No counties found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden">
            {isLoading && (
              <div className="p-8 text-center text-muted-foreground">Loading counties...</div>
            )}
            {isError && (
              <div className="p-8 text-center text-destructive">Error loading counties</div>
            )}
            {data?.map((county) => (
              <div
                key={county.id}
                className="border-b border-border last:border-0 p-6 hover:bg-muted/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-foreground">{county.name}</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate("/county-data", { state: { countyId: county.id } })}
                      className="text-primary hover:text-primary/80"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${county.name}"?`)) {
                          deleteMutation.mutate(Number(county.id));
                        }
                      }}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Population:</span>
                    <p className="font-medium">{county.population?.toLocaleString() || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Score:</span>
                    <p className="font-medium">{county.thematic_area_id ?? "-"}</p>
                  </div>
                </div>
              </div>
            ))}
            {data?.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No counties found.</div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
