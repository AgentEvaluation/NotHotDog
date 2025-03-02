"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Sparkles, Plus, FileText, Search, Trash2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Metric, MetricType, Criticality } from "./types"
import MetricsTable from "./MetricsTable"
import MetricFormDialog from "./MetricFormDialog"

export default function MetricsPage() {
  // Sample data
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: "1",
      name: "First Contact Resolution",
      description: "Whether the customer issue was resolved in the first interaction",
      type: "Binary Qualitative",
      successCriteria: "Issue completely resolved without follow-up needed",
      criticality: "High",
      createdAt: "2023-11-10",
    },
    {
      id: "2",
      name: "Response Time",
      description: "Time taken to respond to customer inquiry",
      type: "Numeric",
      successCriteria: "Less than 4 hours",
      criticality: "Medium",
      createdAt: "2023-11-09",
    },
  ])

  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const initialFormState = {
    name: "",
    description: "",
    type: "Binary Qualitative" as MetricType,
    successCriteria: "",
    criticality: "Medium" as Criticality,
  }

  const [formData, setFormData] = useState(initialFormState)
  const [editingMetric, setEditingMetric] = useState<string | null>(null)

  // Filter metrics based on search query and active tab
  const filteredMetrics = metrics.filter((metric) => {
    const matchesSearch =
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.description?.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && metric.criticality?.toLowerCase() === activeTab.toLowerCase()
  })

  // Handle row selection
  const toggleRowSelection = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  // Handle select all rows
  const toggleSelectAll = () => {
    if (selectedRows.length === filteredMetrics.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredMetrics.map((metric) => metric.id))
    }
  }

  // Handle deleting multiple metrics
  const handleDeleteMetrics = () => {
    setMetrics(metrics.filter((metric) => !selectedRows.includes(metric.id)))
    setSelectedRows([])
  }

  // Handle deleting a single metric
  const handleDeleteSingleMetric = (id: string) => {
    setMetrics(metrics.filter((m) => m.id !== id))
  }

  // Handle edit metric
  const handleEditMetric = (id: string) => {
    const metricToEdit = metrics.find((m) => m.id === id)
    if (metricToEdit) {
      setFormData({
        name: metricToEdit.name,
        description: metricToEdit.description || "",
        type: metricToEdit.type,
        successCriteria: metricToEdit.successCriteria || "",
        criticality: metricToEdit.criticality || "Medium",
      })
      setEditingMetric(id)
      setIsModalOpen(true)
    }
  }

  // Handle save (create/update) metric
  const handleSaveMetric = () => {
    if (editingMetric) {
      // Update existing metric
      setMetrics((prev) =>
        prev.map((metric) =>
          metric.id === editingMetric
            ? {
                ...metric,
                ...formData,
              }
            : metric
        )
      )
    } else {
      // Create new metric
      const newMetric: Metric = {
        id: (metrics.length + 1).toString(),
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setMetrics([...metrics, newMetric])
    }

    // Reset form
    setFormData(initialFormState)
    setEditingMetric(null)
    setIsModalOpen(false)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Metrics</h1>
              <p className="text-muted-foreground mt-1">Manage and track your quality assurance metrics</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2 h-9">
                <Sparkles size={16} className="text-primary" />
                <span>Generate</span>
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
              <Button variant="outline" className="gap-2 h-9">
                <FileText size={16} />
                <span>Templates</span>
              </Button>
            </div>
          </div>

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
                {/* Metrics Table */}
                <MetricsTable
                  metrics={filteredMetrics}
                  selectedRows={selectedRows}
                  toggleRowSelection={toggleRowSelection}
                  toggleSelectAll={toggleSelectAll}
                  handleEditMetric={handleEditMetric}
                  handleDeleteSingleMetric={handleDeleteSingleMetric}
                />
              </CardContent>
            </Card>
          </div>
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
