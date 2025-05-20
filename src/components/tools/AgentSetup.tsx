"use client"

import { useState } from "react"
import { useErrorContext } from "@/hooks/useErrorContext"
import { Plus, Trash, Code, FileJson, Globe } from "lucide-react"

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import ErrorDisplay from "@/components/common/ErrorDisplay"

interface Props {
  agentEndpoint: string
  setAgentEndpoint: (value: string) => void
  headers: { key: string; value: string }[]
  setHeaders: (headers: { key: string; value: string }[]) => void
  body: string
  setBody: (body: string) => void
}

export default function AgentSetup({ agentEndpoint, setAgentEndpoint, headers, setHeaders, body, setBody }: Props) {
  const [activeTab, setActiveTab] = useState("headers")
  const errorContext = useErrorContext()

  const addHeader = () => {
    try {
      setHeaders([...headers, { key: "", value: "" }])
    } catch (err) {
      errorContext.handleError(err)
    }
  }

  const removeHeader = (index: number) => {
    try {
      setHeaders(headers.filter((_, i) => i !== index))
    } catch (err) {
      errorContext.handleError(err)
    }
  }

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    try {
      const newHeaders = [...headers]
      newHeaders[index][field] = value
      setHeaders(newHeaders)
    } catch (err) {
      errorContext.handleError(err)
    }
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-sm">
      {errorContext.error && (
        <div className="p-4">
          <ErrorDisplay error={errorContext.error} onDismiss={errorContext.clearError} />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-semibold">Agent Configuration</CardTitle>
        </div>
        <CardDescription>Configure your AI agent endpoint, headers, and request body</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Agent Endpoint</Label>
          <div className="flex items-center gap-2">
            <Input
              value={agentEndpoint ?? ""}
              onChange={(e) => setAgentEndpoint(e.target.value)}
              placeholder="https://your-agent-endpoint.com/api"
              className="font-mono text-sm border-border"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-background/50 w-full grid grid-cols-2 p-0.5 h-auto border border-border/50">
            <TabsTrigger
              value="headers"
              className="
                py-2
                text-sm
                font-medium
                data-[state=active]:bg-primary
                data-[state=active]:text-primary-foreground
                data-[state=active]:shadow-sm
                transition-all
                rounded-md
                flex items-center gap-2
              "
            >
              <Code className="h-4 w-4" />
              Headers
            </TabsTrigger>
            <TabsTrigger
              value="body"
              className="
                py-2
                text-sm
                font-medium
                data-[state=active]:bg-primary
                data-[state=active]:text-primary-foreground
                data-[state=active]:shadow-sm
                transition-all
                rounded-md
                flex items-center gap-2
              "
            >
              <FileJson className="h-4 w-4" />
              Body
            </TabsTrigger>
          </TabsList>

          <TabsContent value="headers" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-muted-foreground">
                Request Headers
                {headers.length > 0 && (
                  <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                    {headers.length}
                  </Badge>
                )}
              </h4>
              <Button variant="outline" size="sm" onClick={addHeader} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Header
              </Button>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-3 items-center group">
                  <Input
                    placeholder="Header key"
                    value={header.key ?? ""}
                    onChange={(e) => updateHeader(index, "key", e.target.value)}
                    className="flex-1 font-mono text-sm border-border"
                  />
                  <Input
                    placeholder="Header value"
                    value={header.value ?? ""}
                    onChange={(e) => updateHeader(index, "value", e.target.value)}
                    className="flex-1 font-mono text-sm border-border"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHeader(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {headers.length === 0 && (
                <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-md">
                  No headers added yet. Click "Add Header" to begin.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="body" className="mt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-muted-foreground">Request Body (JSON)</h4>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  JSON
                </Badge>
              </div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter JSON body here"
                className="
                  w-full
                  min-h-[320px]
                  resize-y
                  overflow-auto
                  font-mono
                  text-sm
                  border-border
                  bg-background/50
                "
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
