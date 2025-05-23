"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonaDialog } from "./personaDialog"
import { PersonaCard } from "./personaCard"
import { EmptyCustomPersonas } from "./emptyCustomPersonas"
import { Persona } from "@/types"
import { v4 as uuidv4 } from 'uuid';
import ApiKeyConfig from "@/components/config/ApiKeyConfig"
import { getModelConfigHeaders } from "@/utils/model-config-checker"
import { useErrorContext } from "@/hooks/useErrorContext"
import ErrorDisplay from "@/components/common/ErrorDisplay"

export default function PersonasScreen() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(false)
  const [savingPersonaId, setSavingPersonaId] = useState<string | null>(null)
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)
  const errorContext = useErrorContext()

  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [isNewPersonaDialogOpen, setIsNewPersonaDialogOpen] = useState(false)
  const [newPersona, setNewPersona] = useState<Persona>({
    id: "",
    name: "",
    description: "",
    temperature: 0.7,
    messageLength: "Medium",
    primaryIntent: "Information-seeking",
    communicationStyle: "Casual",
    techSavviness: "Intermediate",
    emotionalState: "Neutral",
    errorTolerance: "Medium",
    decisionSpeed: "Thoughtful",
    slangUsage: "None",
    historyBasedMemory: true,
    systemPrompt: "",
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  useEffect(() => {
    fetchPersonas()
  }, [])

  const fetchPersonas = async () => {
    await errorContext.withErrorHandling(async () => {
      setLoading(true)
      const response = await fetch('/api/tools/personas')
      
      if (!response.ok) {
        throw new Error('Failed to fetch personas')
      }
      
      const data = await response.json()
      setPersonas(data.data)
    }, true);
  }

  const handleEditPersona = (persona: Persona) => {
    setEditingPersona({ ...persona })
  }

  const handleSaveEdit = async () => {
    if (editingPersona) {
      setSavingPersonaId(editingPersona.id);
      await errorContext.withErrorHandling(async () => {
        const headers = getModelConfigHeaders();
        if (!headers) {
          errorContext.handleError(new Error("LLM model configuration required to update personas"));
          setIsApiKeyModalOpen(true);
          return;
        }

        const response = await fetch(`/api/tools/personas/${editingPersona.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(editingPersona)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update persona');
        }
        
        const updatedPersona = await response.json();
        setPersonas(personas.map((p) => (p.id === editingPersona.id ? updatedPersona.data : p)));
        setEditingPersona(null);
      });
      setSavingPersonaId(null);
    }
  }

  const handleCancelEdit = () => {
    setEditingPersona(null)
  }

  const handleCreatePersona = async () => {
    await errorContext.withErrorHandling(async () => {
      const headers = getModelConfigHeaders();
      if (!headers) {
        errorContext.handleError(new Error("LLM model configuration required to generate personas"));
        setIsApiKeyModalOpen(true);
        return;
      }

      const response = await fetch('/api/tools/personas', {
        method: 'POST',
        headers,
        body: JSON.stringify(newPersona)
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create persona')
      }
      
      const createdPersona = await response.json()
      setPersonas([...personas, createdPersona.data])
      setNewPersona({
        id: uuidv4(),
        name: "",
        description: "",
        // Include all other default values
        temperature: 0.7,
        messageLength: "Medium",
        primaryIntent: "Information-seeking",
        communicationStyle: "Casual",
        techSavviness: "Intermediate",
        emotionalState: "Neutral",
        errorTolerance: "Medium",
        decisionSpeed: "Thoughtful",
        slangUsage: "None",
        historyBasedMemory: true,
        systemPrompt: "",
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      setIsNewPersonaDialogOpen(false)
    }, true);
  }
  
  const handleDeletePersona = async (id: string) => {
    await errorContext.withErrorHandling(async () => {
      const response = await fetch(`/api/tools/personas/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete persona')
      }
      
      setPersonas(personas.filter(p => p.id !== id))
    }, true);
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Personas</h1>
          <p className="text-muted-foreground">Customize how your AI agents interact with users</p>
        </div>
        
        <PersonaDialog
          open={isNewPersonaDialogOpen}
          onOpenChange={setIsNewPersonaDialogOpen}
          persona={newPersona}
          setPersona={setNewPersona}
          onSave={handleCreatePersona}
          onCancel={() => setIsNewPersonaDialogOpen(false)}
          title="Create New Persona"
          buttonText="Create Persona"
          isSaving={errorContext.isLoading}
        >
          <Button onClick={() => setIsNewPersonaDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Persona
          </Button>
        </PersonaDialog>
      </div>

      {errorContext.error && (
        <ErrorDisplay 
          error={errorContext.error} 
          onDismiss={errorContext.clearError}
          className="mb-4"
        />
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 border-b border-muted">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            All Personas
          </TabsTrigger>
          <TabsTrigger
            value="standard"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            Standard
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                editingPersona={editingPersona}
                setEditingPersona={setEditingPersona}
                onEdit={handleEditPersona}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onDelete={handleDeletePersona}
                isSaving={savingPersonaId === persona.id}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="standard" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {personas.filter(p => p.isDefault).map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                editingPersona={editingPersona}
                setEditingPersona={setEditingPersona}
                onEdit={handleEditPersona}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onDelete={handleDeletePersona}
                standardOnly={true}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {personas.filter(p => !p.isDefault).length > 0 ? (
              personas.filter(p => !p.isDefault).map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  editingPersona={editingPersona}
                  setEditingPersona={setEditingPersona}
                  onEdit={handleEditPersona}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  onDelete={handleDeletePersona}
                />
              ))
            ) : (
              <EmptyCustomPersonas onCreateNew={() => setIsNewPersonaDialogOpen(true)} />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* API Key Config Modal */}
      <ApiKeyConfig
        isOpen={isApiKeyModalOpen}
        setIsOpen={setIsApiKeyModalOpen}
      />
    </div>
  )
}