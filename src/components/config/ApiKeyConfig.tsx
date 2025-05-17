"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LLMProvider } from "@/services/llm/enums";
import { MODEL_CONFIGS, PROVIDER_MODELS } from "@/services/llm/config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LLMServiceConfig } from "@/services/llm/types";
import { ModelFactory } from "@/services/llm/modelfactory";
import { Plus, Trash2 } from "lucide-react";
import { useErrorContext } from "@/hooks/useErrorContext";
import ErrorDisplay from "@/components/common/ErrorDisplay";

interface ApiKeyConfigProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ApiKeyConfig({ isOpen, setIsOpen }: ApiKeyConfigProps) {
  const [configs, setConfigs] = useState<LLMServiceConfig[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const errorContext = useErrorContext();
  
  // New model form state
  const [provider, setProvider] = useState<LLMProvider>(LLMProvider.Anthropic);
  const [modelId, setModelId] = useState<string>("");
  const [keyName, setKeyName] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [orgId, setOrgId] = useState<string>("");
  
  useEffect(() => {
    // Load saved configurations
    const { configs, selectedModelId } = ModelFactory.getUserModelConfigs();
    setConfigs(configs);
    setSelectedModelId(selectedModelId);
    
    // Set default model for the selected provider
    if (PROVIDER_MODELS[provider]?.length > 0) {
      setModelId(PROVIDER_MODELS[provider][0]);
    }
  }, [provider]);

  const handleSaveConfig = () => {
    try {
      // Validate form
      if (!modelId || !apiKey || !keyName) {
        errorContext.showWarning("Please fill in all required fields");
        return;
      }

      const newConfig: LLMServiceConfig = {
        id: modelId,
        provider,
        name: MODEL_CONFIGS[modelId].name,
        apiKey,
        keyName,
        extraParams: provider === LLMProvider.OpenAI && orgId ? { organization: orgId } : {}
      };
      
      const updatedConfigs = [...configs, newConfig];
      
      // Save to localStorage
      localStorage.setItem("model_configs", JSON.stringify(updatedConfigs));
      
      // If this is the first config, set it as selected
      if (updatedConfigs.length === 1 || !selectedModelId) {
        localStorage.setItem("selected_model_id", newConfig.id);
        setSelectedModelId(newConfig.id);
      }
      
      setConfigs(updatedConfigs);
      resetForm();
    } catch (error) {
      errorContext.handleError(error);
    }
  };
  
  const handleSelectModel = (modelId: string) => {
    try {
      localStorage.setItem("selected_model_id", modelId);
      setSelectedModelId(modelId);
    } catch (error) {
      errorContext.handleError(error);
    }
  };
  
  const handleDeleteConfig = (id: string) => {
    try {
      const updatedConfigs = configs.filter(c => c.id !== id);
      localStorage.setItem("model_configs", JSON.stringify(updatedConfigs));
      
      // If we're deleting the selected model, update selection
      if (selectedModelId === id && updatedConfigs.length > 0) {
        localStorage.setItem("selected_model_id", updatedConfigs[0].id);
        setSelectedModelId(updatedConfigs[0].id);
      } else if (updatedConfigs.length === 0) {
        localStorage.removeItem("selected_model_id");
        setSelectedModelId("");
      }
      
      setConfigs(updatedConfigs);
    } catch (error) {
      errorContext.handleError(error);
    }
  };
  
  const resetForm = () => {
    setKeyName("");
    setApiKey("");
    setOrgId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] border-border">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>LLM API Configuration</DialogTitle>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>
        
        {errorContext.error && (
          <ErrorDisplay 
            error={errorContext.error}
            onDismiss={errorContext.clearError}
            className="mb-4"
          />
        )}
        
        <Tabs defaultValue="models">
          <TabsList>
            <TabsTrigger value="models">Your Models</TabsTrigger>
            <TabsTrigger value="add-new">Add New Model</TabsTrigger>
          </TabsList>
          
          <TabsContent value="models">
            {configs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No models configured yet. Add a new model to get started.
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <Label>Select active model:</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {configs.map(config => (
                    <div 
                      key={config.id}
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        selectedModelId === config.id ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{config.name}</div>
                        <div className="text-sm text-muted-foreground">{config.keyName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedModelId !== config.id && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSelectModel(config.id)}
                          >
                            Use
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteConfig(config.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="add-new">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={provider}
                  onValueChange={(value) => setProvider(value as LLMProvider)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LLMProvider.Anthropic}>Anthropic</SelectItem>
                    <SelectItem value={LLMProvider.OpenAI}>OpenAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Model</Label>
                <Select
                  value={modelId}
                  onValueChange={setModelId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_MODELS[provider]?.map(id => (
                      <SelectItem key={id} value={id}>
                        {MODEL_CONFIGS[id].name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Key Name (for your reference)</Label>
                <Input
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="E.g., My Personal Key"
                />
              </div>
              
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === LLMProvider.Anthropic ? "sk-ant-..." : "sk-..."}
                />
              </div>
              
              {provider === LLMProvider.OpenAI && (
                <div className="space-y-2">
                  <Label>Organization ID (Optional)</Label>
                  <Input
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    placeholder="org-..."
                  />
                </div>
              )}
              
              <Button 
                onClick={handleSaveConfig}
                disabled={!modelId || !apiKey || !keyName || errorContext.isLoading}
                className="w-full mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Model
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}