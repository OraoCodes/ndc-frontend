import { MainLayout } from "@/components/MainLayout";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AddThematicArea() {
  const [sector, setSector] = useState("");
  const [thematicArea, setThematicArea] = useState("");

  const handleSave = () => {
    if (sector && thematicArea) {
      // Trigger mutation
      mutation.mutate({ name: thematicArea, description: sector });
    }
  };

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      api.createThematicArea(payload),
    onSuccess: () => {
      // Invalidate thematic areas list so it refetches
      queryClient.invalidateQueries({ queryKey: ["thematicAreas"] });
      toast({ title: "Saved", description: "Thematic area created successfully." });
      setSector("");
      setThematicArea("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message ?? "Failed to create" });
    },
  });

  return (
    <MainLayout>
      <div className="max-w-md">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Add New Thematic Area
        </h2>

        <div className="bg-white rounded-lg p-6 border border-border space-y-6">
          {/* Sector Dropdown */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sector
            </label>
            <div className="relative">
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-4 py-2 pr-10 bg-white border border-input rounded-lg text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                <option value="Water">Water</option>
                <option value="Waste">Waste</option>
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>

          {/* Thematic Area Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Thematic Area
            </label>
            <input
              type="text"
              value={thematicArea}
              onChange={(e) => setThematicArea(e.target.value)}
              placeholder="Enter thematic area"
              className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-sidebar text-sidebar-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
