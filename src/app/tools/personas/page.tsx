"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonaDialog } from "./personaDialog"
import { PersonaCard } from "./personaCard"
import { EmptyCustomPersonas } from "./emptyCustomPersonas"
import { PersonaType, defaultPersona } from "./types"
import { defaultPersonas } from "./defaultPersonas"

export default function PersonasScreen() {
  const [personas, setPersonas] = useState<PersonaType[]>(defaultPersonas)

  const [editingPersona, setEditingPersona] = useState<PersonaType | null>(null)
  const [newPersona, setNewPersona] = useState<PersonaType>({...defaultPersona})
  const [isNewPersonaDialogOpen, setIsNewPersonaDialogOpen] = useState(false)

  const handleEditPersona = (persona: PersonaType) => {
    setEditingPersona({ ...persona })
  }

  const handleSaveEdit = () => {
    if (editingPersona) {
      setPersonas(personas.map((p) => (p.id === editingPersona.id ? editingPersona : p)))
      setEditingPersona(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingPersona(null)
  }

  const handleCreatePersona = () => {
    const newId = Math.max(...personas.map((p) => p.id)) + 1
    setPersonas([...personas, { ...newPersona, id: newId }])
    setNewPersona({...defaultPersona})
    setIsNewPersonaDialogOpen(false)
  }

  const handleDeletePersona = (id: number) => {
    setPersonas(personas.filter((p) => p.id !== id))
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
        >
          <Button onClick={() => setIsNewPersonaDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Persona
          </Button>
        </PersonaDialog>
      </div>

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
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="standard" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {personas.filter(p => defaultPersonas.some(dp => dp.id === p.id)).map((persona) => (
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
            {personas.slice(4).length > 0 ? (
              personas.filter(p => !defaultPersonas.some(dp => dp.id === p.id))
              .map((persona) => (
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
    </div>
  )
}