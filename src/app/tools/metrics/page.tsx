"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Sparkles, Plus, FileText, Search, Trash2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import MetricsTable from "./MetricsTable"
import MetricFormDialog from "./MetricFormDialog"
import { Criticality, Metric, MetricType } from "@/types"
import { useErrorContext } from "@/hooks/useErrorContext"
import ErrorDisplay from "@/components/common/ErrorDisplay"

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const errorContext = useErrorContext()

  const initialFormState = {
    name: "",
    description: "",
    type: "Binary Qualitative" as MetricType,
    successCriteria: "",
    criticality: "Medium" as Criticality,
    agentIds: [] as string[]
  }

  const [formData, setFormData] = useState(initialFormState)
  const [editingMetric, setEditingMetric] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    await errorContext.withErrorHandling(async () => {
      const res = await fetch('/api/tools/metrics')
      if (!res.ok) throw new Error('Failed to fetch metrics')
      const data = await res.json()
      setMetrics(data.data)
    });
  }

  // Filter metrics based on search query and active tab
  const filteredMetrics = metrics.filter((metric) => {
    const matchesSearch =
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.description?.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && metric.criticality?.toLowerCase() === activeTab.toLowerCase()
  })

  const toggleRowSelection = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredMetrics.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredMetrics.map((metric) => metric.id))
    }
  }

  const handleDeleteMetrics = async () => {
    await errorContext.withErrorHandling(async () => {
      for (const id of selectedRows) {
        await fetch(`/api/tools/metrics/${id}`, { 
          method: 'DELETE' 
        })
      }
      
      await fetchMetrics()
      setSelectedRows([])
    });
  }

  const handleDeleteSingleMetric = async (id: string) => {
    await errorContext.withErrorHandling(async () => {
      await fetch(`/api/tools/metrics/${id}`, {
        method: 'DELETE'
      })
      await fetchMetrics()
    });
  }

  const handleEditMetric = async (id: string) => {
    await errorContext.withErrorHandling(async () => {
      const res = await fetch(`/api/tools/metrics/${id}`)
      if (!res.ok) throw new Error('Failed to fetch metric details')
      
      const result = await res.json()
      const metricToEdit = result.data;
      setFormData({
        name: metricToEdit.name,
        description: metricToEdit.description || "",
        type: metricToEdit.type,
        successCriteria: metricToEdit.successCriteria || "",
        criticality: metricToEdit.criticality || "Medium",
        agentIds: metricToEdit.agentIds || []
      })
      setEditingMetric(id)
      setIsModalOpen(true)
    });
  }

  const handleSaveMetric = async () => {
    await errorContext.withErrorHandling(async () => {
      if (editingMetric) {
        await fetch(`/api/tools/metrics/${editingMetric}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        await fetch('/api/tools/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }
      
      await fetchMetrics()
      
      setFormData(initialFormState)
      setEditingMetric(null)
      setIsModalOpen(false)
    });
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Metrics</h1>
              <p className="text-muted-foreground mt-1">Manage and track your quality assurance metrics</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2 h-9" disabled={true}>
                <Sparkles size={16} className="text-primary" />
                <span>Generate - Coming Soon </span>
              </Button>
              <Button
                className="gap-2 h-9"
                onClick={() => {
                  setFormData(initialFormState)
                  setEditingMetric(null)
                  setIsModalOpen(true)
                }}
              >
                <Plus size={16} />
                <span>Create Metric</span>
              </Button>
            </div>
          </div>

          {/* Display any errors */}
          {errorContext.error && (
            <ErrorDisplay 
              error={errorContext.error} 
              onDismiss={errorContext.clearError}
              className="mb-4"
            />
          )}

          {/* Table + Search + Tabs */}
          <div className="grid gap-4">
            <Card>
              <CardHeader className="p-4 pb-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Search */}
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search metrics..."
                      className="pl-8 h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Tabs + Bulk Delete */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Tabs
                      defaultValue="all"
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full sm:w-auto"
                    >
                      <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="high">High</TabsTrigger>
                        <TabsTrigger value="medium">Medium</TabsTrigger>
                        <TabsTrigger value="low">Low</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {selectedRows.length > 0 && (
                      <Button variant="destructive" size="sm" onClick={handleDeleteMetrics} className="h-9">
                        <Trash2 size={16} className="mr-1" />
                        Delete ({selectedRows.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
              {errorContext.isLoading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
                {/* Metrics Table */}
                {!errorContext.isLoading && (
                  <MetricsTable
                    metrics={filteredMetrics}
                    selectedRows={selectedRows}
                    toggleRowSelection={toggleRowSelection}
                    toggleSelectAll={toggleSelectAll}
                    handleEditMetric={handleEditMetric}
                    handleDeleteSingleMetric={handleDeleteSingleMetric}
                  />
                )}
              </CardContent>
            </Card>
          </div>
      </main>

      {/* Dialog for Creating/Editing a Metric */}
      <MetricFormDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveMetric}
        onCancel={() => {
          setFormData(initialFormState)
          setEditingMetric(null)
          setIsModalOpen(false)
        }}
        editingMetric={editingMetric}
      />
    </div>
  )
}