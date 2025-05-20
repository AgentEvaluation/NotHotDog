"use client"

import { useState } from "react"
import { Plus, X, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Rule } from "@/services/agents/claude/types";

interface AgentRulesProps {
  manualResponse: any
  rules: Rule[]
  setRules: (rules: Rule[]) => void
  agentId: string
}

export default function AgentRules({ manualResponse, rules, setRules, agentId }: AgentRulesProps) {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)

  const addRule = (path = "") => {
    const newRule: Rule = {
      id: uuidv4(),
      path,
      condition: "=",
      value: "",
      isValid: true, // Add the isValid property
    }
    setRules([...rules, newRule])
  }

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const updateRule = (index: number, updates: Partial<Rule>) => {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], ...updates }
    setRules(newRules)
  }

  const checkRules = (response: any): boolean => {
    if (!rules.length) return true

    return rules.every((rule) => {
      const value = getValueByPath(response, rule.path)
      switch (rule.condition) {
        case "=":
          return value === rule.value
        case "!=":
          return value !== rule.value
        case ">":
          return Number(value) > Number(rule.value)
        case "<":
          return Number(value) < Number(rule.value)
        case ">=":
          return Number(value) >= Number(rule.value)
        case "<=":
          return Number(value) <= Number(rule.value)
        case "contains":
          return String(value).includes(rule.value)
        case "not_contains":
          return !String(value).includes(rule.value)
        case "starts_with":
          return String(value).startsWith(rule.value)
        case "ends_with":
          return String(value).endsWith(rule.value)
        case "matches":
          try {
            const regex = new RegExp(rule.value)
            return regex.test(String(value))
          } catch (e) {
            return false
          }
        case "has_key":
          return value && typeof value === "object" && rule.value in value
        case "array_contains":
          return Array.isArray(value) && value.includes(rule.value)
        case "array_length":
          return Array.isArray(value) && value.length === Number(rule.value)
        case "null":
          return value === null || value === undefined
        case "not_null":
          return value !== null && value !== undefined
        case "chat":
          return typeof value === "string" && value.length > 0 // Chat validation logic
        default:
          return false
      }
    })
  }

  const getValueByPath = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj)
  }

  const renderObject = (obj: any, path = "") => {
    if (!obj || typeof obj !== "object") return null

    return Object.entries(obj).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key

      if (value && typeof value === "object" && !Array.isArray(value)) {
        return (
          <div key={currentPath} className="ml-4">
            <div className="text-muted-foreground font-medium">{key}:</div>
            {renderObject(value, currentPath)}
          </div>
        )
      }

      return (
        <div
          key={currentPath}
          className="ml-4 flex items-center group py-1"
          onMouseEnter={() => setHoveredPath(currentPath)}
          onMouseLeave={() => setHoveredPath(null)}
        >
          <span className="text-muted-foreground">{key}: </span>
          <span className="text-foreground ml-2 font-mono text-sm">
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </span>
          {hoveredPath === currentPath && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => addRule(currentPath)}
            >
              <Plus className="h-3.5 w-3.5 text-primary" />
            </Button>
          )}
        </div>
      )
    })
  }

  const rulesPass = manualResponse ? checkRules(manualResponse) : true

  // Get display name for condition
  const getConditionDisplayName = (condition: string): string => {
    switch (condition) {
      case "=":
        return "equals"
      case "!=":
        return "not equals"
      case ">":
        return "greater than"
      case "<":
        return "less than"
      case ">=":
        return "greater/equal"
      case "<=":
        return "less/equal"
      case "contains":
        return "contains"
      case "not_contains":
        return "not contains"
      case "starts_with":
        return "starts with"
      case "ends_with":
        return "ends with"
      case "matches":
        return "matches regex"
      case "has_key":
        return "has key"
      case "array_contains":
        return "array contains"
      case "array_length":
        return "array length"
      case "null":
        return "is null"
      case "not_null":
        return "is not null"
      case "chat":
        return "is chat"
      default:
        return condition
    }
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">Validation Rules</CardTitle>
          {rules.length > 0 && (
            <Badge
              variant="outline"
              className={`${
                rulesPass
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20"
              }`}
            >
              {rulesPass ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Pass
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Fail
                </span>
              )}
            </Badge>
          )}
        </div>
        <CardDescription>
          {manualResponse
            ? "Click on response fields to add validation rules"
            : "Test the agent to see response and add rules"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {rules.length > 0 && (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {rules.map((rule, index) => (
              <div key={index} className="bg-background/80 p-3 rounded-md border border-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono">
                          {rule.path}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>JSON path to validate</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(index)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <div className="w-full sm:w-auto">
                    <Select
                      value={rule.condition}
                      onValueChange={(value) => updateRule(index, { condition: value as Rule["condition"] })}
                    >
                      <SelectTrigger className="h-8 text-xs w-full sm:w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="=">equals</SelectItem>
                        <SelectItem value="!=">not equals</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                        <SelectItem value="not_contains">not contains</SelectItem>
                        <SelectItem value="starts_with">starts with</SelectItem>
                        <SelectItem value="ends_with">ends with</SelectItem>
                        <SelectItem value="matches">matches regex</SelectItem>
                        <SelectItem value=">">greater than</SelectItem>
                        <SelectItem value=">=">greater/equal</SelectItem>
                        <SelectItem value="<">less than</SelectItem>
                        <SelectItem value="<=">less/equal</SelectItem>
                        <SelectItem value="has_key">has key</SelectItem>
                        <SelectItem value="array_contains">array contains</SelectItem>
                        <SelectItem value="array_length">array length</SelectItem>
                        <SelectItem value="null">is null</SelectItem>
                        <SelectItem value="not_null">not null</SelectItem>
                        <SelectItem value="chat">chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {!["null", "not_null", "chat"].includes(rule.condition) ? (
                    <>
                      <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground shrink-0" />
                      <Input
                        value={rule.value}
                        onChange={(e) => updateRule(index, { value: e.target.value })}
                        className="h-8 text-xs flex-1"
                        placeholder="Value to compare against"
                      />
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground italic ml-2">
                      No value needed for {getConditionDisplayName(rule.condition)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!manualResponse && (
          <div className="flex flex-col items-center justify-center h-[200px] text-center p-4 border border-dashed border-border rounded-md">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
            <p className="text-muted-foreground">Test the agent to view response and add validation rules</p>
          </div>
        )}

        {manualResponse && (
          <div className="bg-background/80 p-3 rounded-md border border-border text-sm overflow-auto max-h-[300px]">
            {renderObject(manualResponse)}
          </div>
        )}

        {/* {manualResponse && (
          <Button variant="outline" size="sm" onClick={() => addRule()} className="w-full mt-2">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Custom Rule
          </Button>
        )} */}
      </CardContent>
    </Card>
  )
}
