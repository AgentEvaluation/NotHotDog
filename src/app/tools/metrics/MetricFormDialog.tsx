"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { MetricType, Criticality } from "./types"
import { Slider } from "@/components/ui/slider";

interface FormData {
  name: string
  description: string
  type: MetricType
  successCriteria: string
  criticality: Criticality
}

interface MetricFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  onSave: () => void
  onCancel: () => void
  editingMetric: string | null
}

export default function MetricFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSave,
  onCancel,
  editingMetric,
}: MetricFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editingMetric ? "Edit Metric" : "Create New Metric"}</DialogTitle>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="name">Metric Label</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter metric label"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="type">Metric Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as MetricType }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select metric type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Binary Qualitative">Binary Qualitative</SelectItem>
                <SelectItem value="Numeric">Numeric</SelectItem>
                <SelectItem value="Binary Workflow Adherence">Binary Workflow Adherence</SelectItem>
                <SelectItem value="Continuous Qualitative">Continuous Qualitative</SelectItem>
                <SelectItem value="Enum">Enum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type && (
  <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
    {formData.type === "Binary Qualitative" && (
      <p>Captures descriptive questions with only two possible values (Yes/No, Pass/Fail).</p>
    )}
    {formData.type === "Numeric" && (
      <p>Represents quantitative data that can be measured numerically (counts, percentages).</p>
    )}
    {formData.type === "Binary Workflow Adherence" && (
      <p>Tracks whether a process followed the expected workflow or sequence of steps.</p>
    )}
    {formData.type === "Continuous Qualitative" && (
      <p>Measures qualitative aspects on a continuous scale (typically 1-10).</p>
    )}
    {formData.type === "Enum" && (
      <p>Metrics with multiple predefined categories (e.g., Positive, Neutral, Negative).</p>
    )}
  </div>
)}

          

          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter metric description"
              rows={3}
            />
          </div>

          {/* <div className="grid gap-3">
            <Label htmlFor="successCriteria">Success Criteria</Label>
            <Textarea
              id="successCriteria"
              name="successCriteria"
              value={formData.successCriteria}
              onChange={(e) => setFormData((prev) => ({ ...prev, successCriteria: e.target.value }))}
              placeholder="Define what constitutes success for this metric"
              rows={2}
            />
          </div> */}

          {/* Replace the existing success criteria input with this conditional UI */}
          
          <div className="grid gap-3">
            <Label htmlFor="successCriteria">Success Criteria</Label>
            
            {formData.type === "Binary Qualitative" && (
            <RadioGroup
              value={formData.successCriteria}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, successCriteria: value }))}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id="criteria-yes" />
                <Label htmlFor="criteria-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="criteria-no" />
                <Label htmlFor="criteria-no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          )}
            
            {formData.type === "Numeric" && (
              <Input
                id="successCriteria"
                name="successCriteria"
                value={formData.successCriteria}
                onChange={(e) => setFormData((prev) => ({ ...prev, successCriteria: e.target.value }))}
                placeholder="Enter numeric threshold (e.g., >=5)"
                type="text"
              />
            )}
            
            {formData.type === "Binary Workflow Adherence" && (
              <Textarea
                id="successCriteria"
                name="successCriteria"
                value={formData.successCriteria}
                onChange={(e) => setFormData((prev) => ({ ...prev, successCriteria: e.target.value }))}
                placeholder="Define workflow steps that must be followed"
                rows={3}
              />
            )}
            
            {formData.type === "Continuous Qualitative" && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Min: 1</span>
                  <span>Current: {formData.successCriteria || '5'}</span>
                  <span>Max: 10</span>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[parseInt(formData.successCriteria) || 5]}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, successCriteria: value[0].toString() }))}
                />
              </div>
            )}
            
            {formData.type === "Enum" && (
              <Textarea
                id="successCriteria"
                name="successCriteria"
                value={formData.successCriteria}
                onChange={(e) => setFormData((prev) => ({ ...prev, successCriteria: e.target.value }))}
                placeholder="Enter comma-separated values (e.g., Positive, Neutral, Negative)"
                rows={2}
              />
            )}
          </div>

          <div className="grid gap-3">
            <Label>Criticality</Label>
            <RadioGroup
              value={formData.criticality}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, criticality: value as Criticality }))}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Low" id="criticality-low" />
                <Label htmlFor="criticality-low" className="cursor-pointer">
                  Low
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Medium" id="criticality-medium" />
                <Label htmlFor="criticality-medium" className="cursor-pointer">
                  Medium
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="High" id="criticality-high" />
                <Label htmlFor="criticality-high" className="cursor-pointer">
                  High
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>{editingMetric ? "Save Changes" : "Create Metric"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
