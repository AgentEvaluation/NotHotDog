"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown, Trash2, Edit } from "lucide-react"
import { Metric } from "@/types"

function getCriticalityColor(criticality?: string) {
  switch (criticality) {
    case "High":
      return "destructive"
    case "Medium":
      return "warning"
    case "Low":
      return "secondary"
    default:
      return "secondary"
  }
}

interface MetricsTableProps {
  metrics: Metric[]
  selectedRows: string[]
  toggleRowSelection: (id: string) => void
  toggleSelectAll: () => void
  handleEditMetric: (id: string) => void
  handleDeleteSingleMetric: (id: string) => void
}

export default function MetricsTable({
  metrics,
  selectedRows,
  toggleRowSelection,
  toggleSelectAll,
  handleEditMetric,
  handleDeleteSingleMetric,
}: MetricsTableProps) {
  return (
    <div className="mt-4 overflow-x-auto">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={selectedRows.length === metrics.length && metrics.length > 0}
                  onChange={toggleSelectAll}
                />
              </div>
            </TableHead>
            <TableHead className="w-1/5">
              <div className="flex items-center">
                Name
                <ArrowUpDown size={14} className="ml-1 text-muted-foreground" />
              </div>
            </TableHead>
            <TableHead className="hidden md:table-cell w-1/6">Type</TableHead>
            <TableHead className="hidden lg:table-cell w-1/4">Success Criteria</TableHead>
            <TableHead className="w-1/6">Criticality</TableHead>
            <TableHead className="hidden sm:table-cell w-1/6">Created</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {metrics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No metrics found. Create your first metric to get started.
              </TableCell>
            </TableRow>
          ) : (
            metrics.map((metric) => (
              <TableRow key={metric.id} className="group">
                <TableCell>
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedRows.includes(metric.id)}
                      onChange={() => toggleRowSelection(metric.id)}
                    />
                  </div>
                </TableCell>
                <TableCell className="truncate">
                  <div className="font-medium">{metric.name}</div>
                  <div className="text-sm text-muted-foreground md:hidden">{metric.type}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{metric.type}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                  {metric.successCriteria}
                </TableCell>
                <TableCell>
                  <Badge variant={getCriticalityColor(metric.criticality)}>{metric.criticality}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {metric.createdAt}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={16} />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setTimeout(() => handleEditMetric(metric.id), 0)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteSingleMetric(metric.id)}
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
