import { MainLayout } from "@/components/MainLayout";
import { Plus, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listThematicAreas, deleteThematicArea, updateThematicArea, type ThematicArea } from "@/lib/supabase-api";
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
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState<ThematicArea | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data, isLoading, isError, error } = useQuery<ThematicArea[]>({
    queryKey: ["thematicAreas"],
    queryFn: listThematicAreas,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    mutationFn: (payload: { id: number; name: string; description?: string }) =>
      updateThematicArea(payload.id, { name: payload.name, description: payload.description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thematicAreas"] });
      toast({ title: "Success", description: "Thematic area updated successfully." });
      setEditingItem(null);
      setEditName("");
      setEditDescription("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message ?? "Failed to update thematic area", variant: "destructive" });
    },
  });

  const handleEditClick = (item: ThematicArea) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDescription(item.description || "");
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    if (!editingItem) return;
    updateMutation.mutate({
      id: editingItem.id,
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });
  };

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
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Description</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Operation</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={3} className="py-6 px-6 text-center text-muted-foreground">Loading...</td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={3} className="py-6 px-6 text-center text-destructive">Error: {(error as Error)?.message}</td>
                  </tr>
                )}
                {data?.map((row) => (
                  <tr key={row.id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="py-4 px-6 text-foreground text-sm font-medium">{row.name}</td>
                    <td className="py-4 px-6 text-foreground text-sm">{row.description ?? '-'}</td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleEditClick(row)}
                          className="text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete thematic area "${row.name}"?`)) {
                              deleteMutation.mutate(row.id);
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
                    <td colSpan={3} className="py-6 px-6 text-center text-muted-foreground">No thematic areas found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Thematic Area</DialogTitle>
              <DialogDescription>
                Update the name and description of the thematic area.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter thematic area name"
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
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
                  setEditName("");
                  setEditDescription("");
                }}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending || !editName.trim()}
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
