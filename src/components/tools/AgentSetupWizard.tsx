import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';

interface AgentSetupWizardProps {
  agentEndpoint: string;
  setAgentEndpoint: (value: string) => void;
  headers: { key: string; value: string }[];
  setHeaders: (headers: { key: string; value: string }[]) => void;
  body: string;
  setBody: (body: string) => void;
  onTestComplete?: (response: any) => void;
}

export default function AgentSetupWizard({
  agentEndpoint,
  setAgentEndpoint,
  headers,
  setHeaders,
  body,
  setBody,
  onTestComplete
}: AgentSetupWizardProps) {
  const [testResponse, setTestResponse] = useState<any>(null);
  const [selectedInputPath, setSelectedInputPath] = useState('message');
  const [selectedOutputPath, setSelectedOutputPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Parse body to show structure
  const [parsedBody, setParsedBody] = useState<any>({});
  
  useEffect(() => {
    try {
      setParsedBody(JSON.parse(body));
    } catch (e) {
      setParsedBody({});
    }
  }, [body]);

  const sendTestRequest = async () => {
    setIsLoading(true);
    
    try {
      const headersObj = headers.reduce((acc, header) => {
        if (header.key && header.value) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {} as Record<string, string>);

      const response = await fetch('/api/tools/test-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: agentEndpoint,
          headers: headersObj,
          requestBody: parsedBody
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResponse(result.data);
        onTestComplete?.(result.data);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing agent:', error);
      alert('Failed to test agent. Please check your configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderJsonTree = (obj: any, path: string = '', level: number = 0, forInput: boolean = false) => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        return (
          <div key={currentPath} style={{ marginLeft: `${level * 20}px` }}>
            <div className="text-sm text-muted-foreground">
              {key}: {Array.isArray(value) ? '[' : '{'}
            </div>
            {renderJsonTree(value, currentPath, level + 1, forInput)}
            <div className="text-sm text-muted-foreground" style={{ marginLeft: `${level * 20}px` }}>
              {Array.isArray(value) ? ']' : '}'}
            </div>
          </div>
        );
      }
      
      const selectedPath = forInput ? selectedInputPath : selectedOutputPath;
      const setPath = forInput ? setSelectedInputPath : setSelectedOutputPath;
      
      return (
        <div 
          key={currentPath} 
          style={{ marginLeft: `${level * 20}px` }}
          className={`text-sm py-1 px-2 rounded cursor-pointer transition-colors ${
            selectedPath === currentPath 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`}
          onClick={() => setPath(currentPath)}
        >
          <span className="text-muted-foreground">{key}:</span>{' '}
          <span className="font-mono">
            {typeof value === 'string' ? `"${value}"` : String(value)}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Endpoint & Headers */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
          <CardDescription>Configure your agent's endpoint and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="endpoint">Agent Endpoint URL</Label>
            <Input
              id="endpoint"
              placeholder="https://api.example.com/chat"
              value={agentEndpoint}
              onChange={(e) => setAgentEndpoint(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Headers</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setHeaders([...headers, { key: '', value: '' }])}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Header
              </Button>
            </div>
            <div className="space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) => {
                      const newHeaders = [...headers];
                      newHeaders[index].key = e.target.value;
                      setHeaders(newHeaders);
                    }}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Header value"
                    value={header.value}
                    type={header.key.toLowerCase().includes('auth') || header.key.toLowerCase().includes('key') ? 'password' : 'text'}
                    onChange={(e) => {
                      const newHeaders = [...headers];
                      newHeaders[index].value = e.target.value;
                      setHeaders(newHeaders);
                    }}
                    className="flex-1"
                  />
                  {headers.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setHeaders(headers.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Request Configuration</CardTitle>
          <CardDescription>Define your request structure and select input field</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit Request</TabsTrigger>
              <TabsTrigger value="select">Select Input Field</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="space-y-4">
              <div>
                <Label>Request Body</Label>
                <textarea
                  className="w-full h-48 p-3 font-mono text-sm rounded-md border bg-background mt-1"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={`{
  "message": "Your test message here",
  "temperature": 0.7
}`}
                />
              </div>
              
              <Button 
                onClick={sendTestRequest} 
                disabled={!agentEndpoint || !body || isLoading}
                className="w-full"
              >
                {isLoading ? 'Testing...' : 'Test Agent'}
              </Button>
            </TabsContent>
            
            <TabsContent value="select" className="space-y-4">
              <div>
                <Label>Click where the user message should go:</Label>
                {Object.keys(parsedBody).length > 0 ? (
                  <div className="mt-2 p-4 bg-muted rounded-md font-mono text-sm">
                    {renderJsonTree(parsedBody, '', 0, true)}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please enter valid JSON in the Edit Request tab first
                    </AlertDescription>
                  </Alert>
                )}
                
                {selectedInputPath && (
                  <Alert className="mt-4 border-blue-200 bg-blue-50">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      Input field selected: <code className="font-mono">{selectedInputPath}</code>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Configuration */}
      {testResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Response Configuration</CardTitle>
            <CardDescription>Select where the agent's response is located</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Click on the response field:</Label>
              <div className="mt-2 p-4 bg-muted rounded-md font-mono text-sm max-h-96 overflow-auto">
                {renderJsonTree(testResponse)}
              </div>
            </div>
            
            {selectedOutputPath && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Output field selected: <code className="font-mono">{selectedOutputPath}</code>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}