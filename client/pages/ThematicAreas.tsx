import { MainLayout } from "@/components/MainLayout";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listThematicAreas, deleteThematicArea, updateThematicArea, createThematicArea, type ThematicArea } from "@/lib/supabase-api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ThematicAreas() {
  const [editingItem, setEditingItem] = useState<ThematicArea | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    sector: "water" as "water" | "waste",
    weight_percentage: 0,
  });
  const [newForm, setNewForm] = useState({
    name: "",
    description: "",
    sector: "" as "" | "water" | "waste",
    weight_percentage: 0,
  });

  const { data, isLoading, isError, error } = useQuery<ThematicArea[]>({
    queryKey: ["thematicAreas"],
    queryFn: listThematicAreas,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      description?: string;
      sector?: 'water' | 'waste';
      weight_percentage?: number;
    }) => createThematicArea(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thematicAreas"] });
      toast({ title: "Success", description: "Thematic area created successfully." });
      setShowAddDialog(false);
      setNewForm({
        name: "",
        description: "",
        sector: "",
        weight_percentage: 0,
      });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message ?? "Failed to create thematic area", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteThematicArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thematicAreas"] });
      toast({ title: "Deleted", description: "Thematic area deleted." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message ?? "Failed to delete" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { 
      id: number; 
      name: string; 
      description?: string;
      sector?: 'water' | 'waste';
      weight_percentage?: number;
    }) =>
      updateThematicArea(payload.id, { 
        name: payload.name, 
        description: payload.description,
        sector: payload.sector,
        weight_percentage: payload.weight_percentage,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thematicAreas"] });
      toast({ title: "Success", description: "Thematic area updated successfully." });
      setEditingItem(null);
      setEditForm({
        name: "",
        description: "",
        sector: "water",
        weight_percentage: 0,
      });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message ?? "Failed to update thematic area", variant: "destructive" });
    },
  });

  const handleEditClick = (item: ThematicArea) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description || "",
      sector: item.sector || "water",
      weight_percentage: item.weight_percentage || 0,
    });
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    if (!editingItem) return;
    updateMutation.mutate({
      id: editingItem.id,
      name: editForm.name.trim(),
      description: editForm.description.trim() || undefined,
      sector: editForm.sector,
      weight_percentage: editForm.weight_percentage || undefined,
    });
  };

  const handleAdd = () => {
    if (!newForm.sector) {
      toast({ title: "Error", description: "Please select a sector", variant: "destructive" });
      return;
    }
    if (!newForm.name.trim()) {
      toast({ title: "Error", description: "Thematic area name is required", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      name: newForm.name.trim(),
      description: newForm.description.trim() || undefined,
      sector: newForm.sector,
      weight_percentage: newForm.weight_percentage || undefined,
    });
  };

  // Group thematic areas by sector
  const waterAreas = data?.filter(area => area.sector === 'water') || [];
  const wasteAreas = data?.filter(area => area.sector === 'waste') || [];

  return (
    <MainLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Thematic Areas</h2>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium shadow-lg text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            Add New
          </button>
        </div>

        {/* WATER MANAGEMENT Section */}
        <div className="space-y-4">
          <div className="bg-sidebar text-sidebar-foreground py-3 sm:py-4 px-4 sm:px-6 rounded-t-lg">
            <h3 className="text-base sm:text-lg font-bold uppercase">WATER MANAGEMENT</h3>
          </div>
          <div className="bg-white rounded-b-lg border border-border overflow-hidden">
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {isLoading && (
                <div className="py-6 px-4 text-center text-muted-foreground">Loading...</div>
              )}
              {isError && (
                <div className="py-6 px-4 text-center text-destructive">Error: {(error as Error)?.message}</div>
              )}
              {waterAreas.length === 0 && !isLoading && (
                <div className="py-6 px-4 text-center text-muted-foreground">No thematic areas found for Water Management.</div>
              )}
              {waterAreas.map((area) => (
                <div key={area.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="text-foreground font-semibold text-sm flex-1 pr-2">{area.name}</h4>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => handleEditClick(area)}
                        className="text-primary hover:text-primary/80 font-medium text-xs underline transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete thematic area "${area.name}"?`)) {
                            deleteMutation.mutate(area.id);
                          }
                        }}
                        className="text-destructive hover:text-destructive/80 font-medium text-xs underline transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="ml-2 text-foreground font-medium">{area.weight_percentage || 0}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Indicators:</span>
                      <span className="ml-2 text-foreground font-medium">{area.indicator_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">THEMATIC AREA</th>
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">WEIGHT %</th>
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">NO OF INDICATORS</th>
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">OPERATION</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={4} className="py-6 px-4 lg:px-6 text-center text-muted-foreground">Loading...</td>
                    </tr>
                  )}
                  {isError && (
                    <tr>
                      <td colSpan={4} className="py-6 px-4 lg:px-6 text-center text-destructive">Error: {(error as Error)?.message}</td>
                    </tr>
                  )}
                  {waterAreas.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={4} className="py-6 px-4 lg:px-6 text-center text-muted-foreground">No thematic areas found for Water Management.</td>
                    </tr>
                  )}
                  {waterAreas.map((area) => (
                    <tr key={area.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 lg:px-6 text-foreground text-sm font-medium">{area.name}</td>
                      <td className="py-4 px-4 lg:px-6 text-foreground text-sm">{area.weight_percentage || 0}</td>
                      <td className="py-4 px-4 lg:px-6 text-foreground text-sm">{area.indicator_count || 0}</td>
                      <td className="py-4 px-4 lg:px-6 text-sm">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <button
                            onClick={() => handleEditClick(area)}
                            className="text-primary hover:text-primary/80 font-medium underline transition text-xs sm:text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete thematic area "${area.name}"?`)) {
                                deleteMutation.mutate(area.id);
                              }
                            }}
                            className="text-destructive hover:text-destructive/80 font-medium underline transition text-xs sm:text-sm"
                          >
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

        {/* WASTE MANAGEMENT Section */}
        <div className="space-y-4">
          <div className="bg-sidebar text-sidebar-foreground py-3 sm:py-4 px-4 sm:px-6 rounded-t-lg">
            <h3 className="text-base sm:text-lg font-bold uppercase">WASTE MANAGEMENT</h3>
          </div>
          <div className="bg-white rounded-b-lg border border-border overflow-hidden">
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {wasteAreas.length === 0 && !isLoading && (
                <div className="py-6 px-4 text-center text-muted-foreground">No thematic areas found for Waste Management.</div>
              )}
              {wasteAreas.map((area) => (
                <div key={area.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="text-foreground font-semibold text-sm flex-1 pr-2">{area.name}</h4>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => handleEditClick(area)}
                        className="text-primary hover:text-primary/80 font-medium text-xs underline transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete thematic area "${area.name}"?`)) {
                            deleteMutation.mutate(area.id);
                          }
                        }}
                        className="text-destructive hover:text-destructive/80 font-medium text-xs underline transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="ml-2 text-foreground font-medium">{area.weight_percentage || 0}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Indicators:</span>
                      <span className="ml-2 text-foreground font-medium">{area.indicator_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">THEMATIC AREA</th>
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">WEIGHT %</th>
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">NO OF INDICATORS</th>
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">OPERATION</th>
                  </tr>
                </thead>
                <tbody>
                  {wasteAreas.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={4} className="py-6 px-4 lg:px-6 text-center text-muted-foreground">No thematic areas found for Waste Management.</td>
                    </tr>
                  )}
                  {wasteAreas.map((area) => (
                    <tr key={area.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 lg:px-6 text-foreground text-sm font-medium">{area.name}</td>
                      <td className="py-4 px-4 lg:px-6 text-foreground text-sm">{area.weight_percentage || 0}</td>
                      <td className="py-4 px-4 lg:px-6 text-foreground text-sm">{area.indicator_count || 0}</td>
                      <td className="py-4 px-4 lg:px-6 text-sm">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <button
                            onClick={() => handleEditClick(area)}
                            className="text-primary hover:text-primary/80 font-medium underline transition text-xs sm:text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete thematic area "${area.name}"?`)) {
                                deleteMutation.mutate(area.id);
                              }
                            }}
                            className="text-destructive hover:text-destructive/80 font-medium underline transition text-xs sm:text-sm"
                          >
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

        {/* Add New Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Thematic Area</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sector <span className="text-destructive">*</span>
                </label>
                <select
                  value={newForm.sector}
                  onChange={(e) => setNewForm({ ...newForm, sector: e.target.value as "" | "water" | "waste" })}
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select</option>
                  <option value="water">Water</option>
                  <option value="waste">Waste</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Thematic Area <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="Enter thematic area"
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="Enter Thematic Area Description"
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Weight
                </label>
                <input
                  type="number"
                  value={newForm.weight_percentage}
                  onChange={(e) => setNewForm({ ...newForm, weight_percentage: parseFloat(e.target.value) || 0 })}
                  placeholder="Add % weight"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setNewForm({
                    name: "",
                    description: "",
                    sector: "",
                    weight_percentage: 0,
                  });
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={createMutation.isPending || !newForm.name.trim() || !newForm.sector}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Thematic Area</DialogTitle>
              <DialogDescription>
                Update the thematic area details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter thematic area name"
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sector <span className="text-destructive">*</span>
                </label>
                <select
                  value={editForm.sector}
                  onChange={(e) => setEditForm({ ...editForm, sector: e.target.value as "water" | "waste" })}
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="water">Water</option>
                  <option value="waste">Waste</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Weight Percentage
                </label>
                <input
                  type="number"
                  value={editForm.weight_percentage}
                  onChange={(e) => setEditForm({ ...editForm, weight_percentage: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter weight percentage"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Enter description (optional)"
                  rows={3}
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
                  setEditForm({
                    name: "",
                    description: "",
                    sector: "water",
                    weight_percentage: 0,
                  });
                }}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending || !editForm.name.trim()}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
