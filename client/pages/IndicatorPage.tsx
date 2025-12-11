"use client"
import { useState, useEffect } from "react"
import { Loader2, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { MainLayout } from "@/components/MainLayout"
import { listIndicators, createIndicator, deleteIndicator, updateIndicator, listThematicAreas, type Indicator, type ThematicArea } from "@/lib/supabase-api"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 10

export default function IndicatorManagementPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [editingItem, setEditingItem] = useState<Indicator | null>(null)
  const [editForm, setEditForm] = useState({
    sector: "water" as "water" | "waste",
    thematic_area: "",
    indicator_text: "",
    description: "",
    weight: 10,
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newIndicator, setNewIndicator] = useState({
    sector: "water" as "water" | "waste",
    thematic_area: "",
    indicator_text: "",
    description: "",
    weight: 10,
  })

  const { data: indicators, isLoading, isError, error } = useQuery<Indicator[]>({
    queryKey: ["indicators"],
    queryFn: listIndicators,
  })

  // Fetch thematic areas from database
  const { data: thematicAreas, isLoading: loadingThematicAreas } = useQuery<ThematicArea[]>({
    queryKey: ["thematicAreas"],
    queryFn: listThematicAreas,
  })

  // Get thematic areas filtered by sector for Add dialog
  const getThematicAreasForSector = (sector: "water" | "waste") => {
    return (thematicAreas || [])
      .filter(area => area.sector === sector)
      .map(area => area.name)
      .sort()
  }

  // Get thematic areas for the currently selected sector in Add dialog
  const availableThematicAreasForAdd = getThematicAreasForSector(newIndicator.sector)

  // Get thematic areas for the currently selected sector in Edit dialog
  const availableThematicAreasForEdit = getThematicAreasForSector(editForm.sector)

  // Update newIndicator thematic_area when sector changes or thematic areas load
  useEffect(() => {
    const available = getThematicAreasForSector(newIndicator.sector)
    if (available.length > 0) {
      // If current selection is not in available list, or empty, select first available
      if (!available.includes(newIndicator.thematic_area) || !newIndicator.thematic_area) {
        setNewIndicator(prev => ({ ...prev, thematic_area: available[0] }))
      }
    } else {
      // No thematic areas available for this sector
      setNewIndicator(prev => ({ ...prev, thematic_area: "" }))
    }
  }, [newIndicator.sector, thematicAreas])

  // Update editForm thematic_area when sector changes
  useEffect(() => {
    const available = getThematicAreasForSector(editForm.sector)
    if (available.length > 0) {
      // If current selection is not in available list, select first available
      if (!available.includes(editForm.thematic_area)) {
        setEditForm(prev => ({ ...prev, thematic_area: available[0] }))
      }
    } else {
      // No thematic areas available for this sector
      setEditForm(prev => ({ ...prev, thematic_area: "" }))
    }
  }, [editForm.sector, thematicAreas])

  const createMutation = useMutation({
    mutationFn: (payload: {
      sector: "water" | "waste";
      thematic_area: string;
      indicator_text: string;
      weight?: number;
    }) => createIndicator(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicators"] })
      toast({ title: "Success", description: "Indicator added successfully!" })
      setShowAddDialog(false)
      // Reset to first available thematic area for water sector
      const waterAreas = getThematicAreasForSector("water")
      setNewIndicator({
        sector: "water",
        thematic_area: waterAreas[0] || "",
        indicator_text: "",
        description: "",
        weight: 10,
      })
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to add indicator",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: Partial<Indicator> }) =>
      updateIndicator(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicators"] })
      toast({ title: "Success", description: "Indicator updated successfully!" })
      setEditingItem(null)
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to update indicator",
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteIndicator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicators"] })
      toast({ title: "Success", description: "Indicator deleted successfully!" })
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to delete indicator",
        variant: "destructive",
      })
    },
  })

  const handleEditClick = (indicator: Indicator) => {
    setEditingItem(indicator)
    setEditForm({
      sector: indicator.sector,
      thematic_area: indicator.thematic_area,
      indicator_text: indicator.indicator_text,
      description: indicator.description || "",
      weight: indicator.weight || 10,
    })
  }

  const handleSaveEdit = () => {
    if (!editForm.indicator_text.trim()) {
      toast({ title: "Error", description: "Indicator text is required", variant: "destructive" })
      return
    }
    if (!editingItem) return
    updateMutation.mutate({
      id: editingItem.id,
      data: {
        sector: editForm.sector,
        thematic_area: editForm.thematic_area,
        indicator_text: editForm.indicator_text.trim(),
        description: editForm.description.trim() || null,
        weight: editForm.weight,
      },
    })
  }

  const handleAdd = () => {
    if (!newIndicator.indicator_text.trim()) {
      toast({ title: "Error", description: "Indicator text is required", variant: "destructive" })
      return
    }
    createMutation.mutate({
      sector: newIndicator.sector,
      thematic_area: newIndicator.thematic_area,
      indicator_text: newIndicator.indicator_text.trim(),
      description: newIndicator.description.trim() || undefined,
      weight: newIndicator.weight,
    })
  }

  const handleDelete = (id: number) => {
    if (!confirm("Delete this indicator permanently?")) return
    deleteMutation.mutate(id)
  }

  // Format sector name for display
  const formatSector = (sector: string) => {
    return sector.charAt(0).toUpperCase() + sector.slice(1)
  }

  // Pagination logic
  const totalItems = indicators?.length || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedIndicators = indicators?.slice(startIndex, endIndex) || []

  // Reset to page 1 when indicators change or when current page is invalid
  useEffect(() => {
    if (indicators && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [indicators, currentPage, totalPages])

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("ellipsis")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Indicators</h2>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-green-600 text-white rounded-lg sm:rounded-xl hover:bg-green-700 transition-all font-medium shadow-lg text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            Add New
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left py-4 px-4 lg:py-5 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">SECTOR</th>
                  <th className="text-left py-4 px-4 lg:py-5 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">THEMATIC AREA</th>
                  <th className="text-left py-4 px-4 lg:py-5 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">INDICATOR</th>
                  <th className="text-left py-4 px-4 lg:py-5 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">SCORE</th>
                  <th className="text-left py-4 px-4 lg:py-5 lg:px-6 font-semibold text-foreground text-xs sm:text-sm uppercase tracking-wider">OPERATION</th>
                </tr>
              </thead>
              <tbody>
                {isError && (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center text-destructive">
                      Error: {(error as Error)?.message}
                    </td>
                  </tr>
                )}
                {indicators && indicators.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center text-muted-foreground">
                      No indicators found. Click "Add New" to create one.
                    </td>
                  </tr>
                )}
                {paginatedIndicators.map((indicator) => (
                  <tr key={indicator.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 lg:py-5 lg:px-6 text-foreground text-sm whitespace-nowrap">{formatSector(indicator.sector)}</td>
                    <td className="py-4 px-4 lg:py-5 lg:px-6 text-foreground text-sm max-w-[150px] lg:max-w-[200px]">
                      <div className="truncate" title={indicator.thematic_area}>
                        {indicator.thematic_area}
                      </div>
                    </td>
                    <td className="py-4 px-4 lg:py-5 lg:px-6 text-foreground text-sm max-w-[300px] lg:max-w-[400px] xl:max-w-[500px]">
                      <div className="truncate" title={indicator.indicator_text}>
                        {indicator.indicator_text}
                      </div>
                    </td>
                    <td className="py-4 px-4 lg:py-5 lg:px-6 text-foreground text-sm whitespace-nowrap">{indicator.weight || 10}</td>
                    <td className="py-4 px-4 lg:py-5 lg:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <button
                          onClick={() => handleEditClick(indicator)}
                          className="text-primary hover:text-primary/80 font-medium underline transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(indicator.id)}
                          className="text-destructive hover:text-destructive/80 font-medium underline transition text-sm"
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

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {isError && (
            <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
              <p className="text-center text-destructive">
                Error: {(error as Error)?.message}
              </p>
            </div>
          )}
          {indicators && indicators.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
              <p className="text-center text-muted-foreground">
                No indicators found. Click "Add New" to create one.
              </p>
            </div>
          )}
          {paginatedIndicators.map((indicator) => (
            <div
              key={indicator.id}
              className="bg-white rounded-2xl shadow-lg border border-border p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {formatSector(indicator.sector)}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Score: {indicator.weight || 10}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1 truncate" title={indicator.thematic_area}>
                    {indicator.thematic_area}
                  </p>
                  <p className="text-sm font-medium text-foreground line-clamp-3" title={indicator.indicator_text}>
                    {indicator.indicator_text}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-border">
                <button
                  onClick={() => handleEditClick(indicator)}
                  className="text-primary hover:text-primary/80 font-medium underline transition text-sm flex items-center gap-1"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(indicator.id)}
                  className="text-destructive hover:text-destructive/80 font-medium underline transition text-sm flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} indicators
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                </PaginationItem>
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <button
                        onClick={() => setCurrentPage(page as number)}
                        className={`inline-flex items-center justify-center min-w-[2.5rem] h-9 px-3 text-sm font-medium rounded-md border ${
                          currentPage === page
                            ? "border-input bg-background text-foreground"
                            : "border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Add New Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Indicators</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sector <span className="text-destructive">*</span>
                </label>
                <select
                  value={newIndicator.sector}
                  onChange={(e) =>
                    setNewIndicator({ ...newIndicator, sector: e.target.value as "water" | "waste" })
                  }
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="water">Water</option>
                  <option value="waste">Waste</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Thematic Area <span className="text-destructive">*</span>
                </label>
                <select
                  value={newIndicator.thematic_area}
                  onChange={(e) =>
                    setNewIndicator({ ...newIndicator, thematic_area: e.target.value })
                  }
                  disabled={loadingThematicAreas || availableThematicAreasForAdd.length === 0}
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingThematicAreas ? (
                    <option>Loading thematic areas...</option>
                  ) : availableThematicAreasForAdd.length === 0 ? (
                    <option>No thematic areas available for {newIndicator.sector} sector</option>
                  ) : (
                    <>
                      <option value="">Select thematic area</option>
                      {availableThematicAreasForAdd.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Indicator <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newIndicator.indicator_text}
                  onChange={(e) =>
                    setNewIndicator({ ...newIndicator, indicator_text: e.target.value })
                  }
                  placeholder="Value"
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={newIndicator.description}
                  onChange={(e) =>
                    setNewIndicator({ ...newIndicator, description: e.target.value })
                  }
                  placeholder="Value"
                  rows={4}
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Score
                </label>
                <input
                  type="number"
                  value={newIndicator.weight}
                  onChange={(e) =>
                    setNewIndicator({ ...newIndicator, weight: parseInt(e.target.value) || 10 })
                  }
                  placeholder="Value"
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(false)} 
                disabled={createMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAdd} 
                disabled={createMutation.isPending || !newIndicator.indicator_text.trim()}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                {createMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Indicator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sector <span className="text-destructive">*</span>
                </label>
                <select
                  value={editForm.sector}
                  onChange={(e) =>
                    setEditForm({ ...editForm, sector: e.target.value as "water" | "waste" })
                  }
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="water">Water</option>
                  <option value="waste">Waste</option>
                </select>
              </div>
                          <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Thematic Area <span className="text-destructive">*</span>
                </label>
                <select
                  value={editForm.thematic_area}
                  onChange={(e) =>
                    setEditForm({ ...editForm, thematic_area: e.target.value })
                  }
                  disabled={loadingThematicAreas || availableThematicAreasForEdit.length === 0}
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingThematicAreas ? (
                    <option>Loading thematic areas...</option>
                  ) : availableThematicAreasForEdit.length === 0 ? (
                    <option>No thematic areas available for {editForm.sector} sector</option>
                  ) : (
                    <>
                      <option value="">Select thematic area</option>
                      {availableThematicAreasForEdit.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                    </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Indicator <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.indicator_text}
                  onChange={(e) =>
                    setEditForm({ ...editForm, indicator_text: e.target.value })
                  }
                  placeholder="Value"
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
          </div>
          <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Value"
                  rows={4}
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                />
            </div>
                          <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Score
                </label>
                <input
                  type="number"
                  value={editForm.weight}
                  onChange={(e) =>
                    setEditForm({ ...editForm, weight: parseInt(e.target.value) || 10 })
                  }
                  placeholder="Value"
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                  </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setEditingItem(null)} 
                disabled={updateMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit} 
                disabled={updateMutation.isPending || !editForm.indicator_text.trim()}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
