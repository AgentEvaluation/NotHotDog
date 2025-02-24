"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Code, List } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  agentEndpoint: string;
  setAgentEndpoint: (value: string) => void;
  headers: { key: string; value: string }[];
  setHeaders: (headers: { key: string; value: string }[]) => void;
  body: string;
  setBody: (body: string) => void;
}

export default function AgentSetup({ agentEndpoint, setAgentEndpoint, headers, setHeaders, body, setBody }: Props) {
  const [activeTab, setActiveTab] = useState<"headers" | "body">("headers");

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  return (
    <Card className="bg-black/40 border-zinc-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Agent Configuration</CardTitle>
            <CardDescription>Configure your AI agent endpoint, headers, and request body</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Input
            value={agentEndpoint ?? ""}
            onChange={(e) => setAgentEndpoint(e.target.value)}
            placeholder="https://your-agent-endpoint.com/api"
            className="bg-black/20"
          />
        </div>
        
        <div className="flex gap-4 mt-4">
          <Button variant={activeTab === "headers" ? "default" : "outline"} onClick={() => setActiveTab("headers")}>
            <List className="h-4 w-4 mr-1" /> Headers
          </Button>
          <Button variant={activeTab === "body" ? "default" : "outline"} onClick={() => setActiveTab("body")}>
            <Code className="h-4 w-4 mr-1" /> Body
          </Button>
        </div>

        {activeTab === "headers" ? (
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Headers</h4>
              <Button variant="outline" size="sm" onClick={addHeader}>
                <Plus className="h-4 w-4 mr-1" /> Add Header
              </Button>
            </div>
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  placeholder="Header key"
                  value={header.key ?? ""}
                  onChange={(e) => updateHeader(index, "key", e.target.value)}
                  className="flex-1 bg-black/20"
                />
                <Input
                  placeholder="Header value"
                  value={header.value ?? ""}
                  onChange={(e) => updateHeader(index, "value", e.target.value)}
                  className="flex-1 bg-black/20"
                />
                <Button variant="ghost" size="icon" onClick={() => removeHeader(index)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Request Body (JSON)</h4>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter JSON body here"
              className="w-full h-40 bg-black/20 rounded-lg p-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}