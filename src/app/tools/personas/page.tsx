"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PersonasScreen() {
  const [personas, setPersonas] = useState([
    {
      id: 1,
      name: "Chatty",
      description: "Speaks in long sentences, asks a lot of questions",
      temperature: 0.8,
      messageLength: "Long",
      primaryIntent: "Information-seeking",
      communicationStyle: "Casual",
      techSavviness: "Beginner",
      emotionalState: "Curious",
      errorTolerance: "High",
      decisionSpeed: "Fast",
      slangUsage: "Moderate",
      historyBasedMemory: true,
    },
    {
      id: 2,
      name: "Concise",
      description: "Brief and to-the-point responses",
      temperature: 0.3,
      messageLength: "Short",
      primaryIntent: "Transactional",
      communicationStyle: "Formal",
      techSavviness: "Intermediate",
      emotionalState: "Neutral",
      errorTolerance: "Low",
      decisionSpeed: "Fast",
      slangUsage: "None",
      historyBasedMemory: false,
    },
    {
      id: 3,
      name: "Technical",
      description: "Uses technical vocabulary and detailed explanations",
      temperature: 0.4,
      messageLength: "Medium",
      primaryIntent: "Support Query",
      communicationStyle: "Detailed",
      techSavviness: "Advanced",
      emotionalState: "Neutral",
      errorTolerance: "Low",
      decisionSpeed: "Thoughtful",
      slangUsage: "None",
      historyBasedMemory: true,
    },
    {
      id: 4,
      name: "Friendly",
      description: "Casual, approachable tone with personal touches",
      temperature: 0.7,
      messageLength: "Medium",
      primaryIntent: "Feedback",
      communicationStyle: "Casual",
      techSavviness: "Beginner",
      emotionalState: "Happy",
      errorTolerance: "High",
      decisionSpeed: "Hesitant",
      slangUsage: "Moderate",
      historyBasedMemory: true,
    },
  ])

  const [editingPersona, setEditingPersona] = useState(null)
  const [newPersona, setNewPersona] = useState({
    name: "",
    description: "",
    temperature: 0.5,
    messageLength: "Medium",
    primaryIntent: "Information-seeking",
    communicationStyle: "Casual",
    techSavviness: "Intermediate",
    emotionalState: "Neutral",
    errorTolerance: "Medium",
    decisionSpeed: "Thoughtful",
    slangUsage: "None",
    historyBasedMemory: false,
  })
  const [isNewPersonaDialogOpen, setIsNewPersonaDialogOpen] = useState(false)

  const handleEditPersona = (persona) => {
    setEditingPersona({ ...persona })
  }

  const handleSaveEdit = () => {
    setPersonas(personas.map((p) => (p.id === editingPersona.id ? editingPersona : p)))
    setEditingPersona(null)
  }

  const handleCancelEdit = () => {
    setEditingPersona(null)
  }

  const handleCreatePersona = () => {
    const newId = Math.max(...personas.map((p) => p.id)) + 1
    setPersonas([...personas, { ...newPersona, id: newId }])
    setNewPersona({
      name: "",
      description: "",
      temperature: 0.5,
      messageLength: "Medium",
      primaryIntent: "Information-seeking",
      communicationStyle: "Casual",
      techSavviness: "Intermediate",
      emotionalState: "Neutral",
      errorTolerance: "Medium",
      decisionSpeed: "Thoughtful",
      slangUsage: "None",
      historyBasedMemory: false,
    })
    setIsNewPersonaDialogOpen(false)
  }

  const handleDeletePersona = (id) => {
    setPersonas(personas.filter((p) => p.id !== id))
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Personas</h1>
          <p className="text-muted-foreground">Customize how your AI agents interact with users</p>
        </div>
        <Dialog open={isNewPersonaDialogOpen} onOpenChange={setIsNewPersonaDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Persona</DialogTitle>
              <div>Define a new AI personality with custom traits and behaviors.</div>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="name" className="text-right w-40"> {/* Adjust width here */}
                    Name
                </Label>
                <Input id="name" value={newPersona.name} onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })} className="col-span-2" />
            </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="description" className="text-right w-40">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newPersona.description}
                  onChange={(e) => setNewPersona({ ...newPersona, description: e.target.value })}
                  className="col-span-2"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="temperature" className="text-right w-40">
                  Temperature: {newPersona.temperature.toFixed(1)}
                </Label>
                <div className="col-span-2">
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[newPersona.temperature]}
                    onValueChange={(value) => setNewPersona({ ...newPersona, temperature: value[0] })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="messageLength" className="text-right w-40">
                  Message Length
                </Label>
                <Select
                  value={newPersona.messageLength}
                  onValueChange={(value) => setNewPersona({ ...newPersona, messageLength: value })}
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short">Short</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="primaryIntent" className="text-right w-40">
                  Primary Intent
                </Label>
                <Select
                  value={newPersona.primaryIntent}
                  onValueChange={(value) => setNewPersona({ ...newPersona, primaryIntent: value })}
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select intent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Information-seeking">Information-seeking</SelectItem>
                    <SelectItem value="Transactional">Transactional</SelectItem>
                    <SelectItem value="Support Query">Support Query</SelectItem>
                    <SelectItem value="Feedback">Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="communicationStyle" className="text-right w-40">
                  Communication Style
                </Label>
                <Select
                  value={newPersona.communicationStyle}
                  onValueChange={(value) => setNewPersona({ ...newPersona, communicationStyle: value })}
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Formal">Formal</SelectItem>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Sarcastic">Sarcastic</SelectItem>
                    <SelectItem value="Concise">Concise</SelectItem>
                    <SelectItem value="Detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="techSavviness" className="text-right w-40">
                  Tech-savviness
                </Label>
                <Select
                  value={newPersona.techSavviness}
                  onValueChange={(value) => setNewPersona({ ...newPersona, techSavviness: value })}
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="emotionalState" className="text-right w-40">
                  Emotional State
                </Label>
                <Select
                  value={newPersona.emotionalState}
                  onValueChange={(value) => setNewPersona({ ...newPersona, emotionalState: value })}
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                    <SelectItem value="Frustrated">Frustrated</SelectItem>
                    <SelectItem value="Happy">Happy</SelectItem>
                    <SelectItem value="Curious">Curious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="errorTolerance" className="text-right w-40">
                  Error Tolerance
                </Label>
                <Select
                  value={newPersona.errorTolerance}
                  onValueChange={(value) => setNewPersona({ ...newPersona, errorTolerance: value })}
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select tolerance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="decisionSpeed" className="text-right w-40">
                  Decision Speed
                </Label>
                <Select
                  value={newPersona.decisionSpeed}
                  onValueChange={(value) => setNewPersona({ ...newPersona, decisionSpeed: value })}
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fast">Fast</SelectItem>
                    <SelectItem value="Thoughtful">Thoughtful</SelectItem>
                    <SelectItem value="Hesitant">Hesitant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="slangUsage" className="text-right w-40">
                  Slang Usage
                </Label>
                <Select
                  value={newPersona.slangUsage}
                  onValueChange={(value) => setNewPersona({ ...newPersona, slangUsage: value })}
                >
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select usage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="historyBasedMemory" className="text-right w-40">
                  History-based Memory
                </Label>
                <div className="flex items-center space-x-2 col-span-2">
                  <Switch
                    id="historyBasedMemory"
                    checked={newPersona.historyBasedMemory}
                    onCheckedChange={(checked) => setNewPersona({ ...newPersona, historyBasedMemory: checked })}
                  />
                  <Label htmlFor="historyBasedMemory">{newPersona.historyBasedMemory ? "Yes" : "No"}</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewPersonaDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePersona}>Create Persona</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All Personas</TabsTrigger>
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <Card key={persona.id} className="relative">
                {editingPersona && editingPersona.id === persona.id ? (
                  <>
                    <CardHeader className="pb-2">
                      <Input
                        value={editingPersona.name}
                        onChange={(e) => setEditingPersona({ ...editingPersona, name: e.target.value })}
                        className="font-bold text-lg"
                      />
                      <Input
                        value={editingPersona.description}
                        onChange={(e) => setEditingPersona({ ...editingPersona, description: e.target.value })}
                        className="text-sm text-muted-foreground"
                      />
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <Label>Temperature</Label>
                            <span className="text-sm">{editingPersona.temperature.toFixed(1)}</span>
                          </div>
                          <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            value={[editingPersona.temperature]}
                            onValueChange={(value) => setEditingPersona({ ...editingPersona, temperature: value[0] })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Message Length</Label>
                          <Select
                            value={editingPersona.messageLength}
                            onValueChange={(value) => setEditingPersona({ ...editingPersona, messageLength: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Short">Short</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Long">Long</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Primary Intent</Label>
                          <Select
                            value={editingPersona.primaryIntent}
                            onValueChange={(value) => setEditingPersona({ ...editingPersona, primaryIntent: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Information-seeking">Information-seeking</SelectItem>
                              <SelectItem value="Transactional">Transactional</SelectItem>
                              <SelectItem value="Support Query">Support Query</SelectItem>
                              <SelectItem value="Feedback">Feedback</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Communication Style</Label>
                          <Select
                            value={editingPersona.communicationStyle}
                            onValueChange={(value) =>
                              setEditingPersona({ ...editingPersona, communicationStyle: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Formal">Formal</SelectItem>
                              <SelectItem value="Casual">Casual</SelectItem>
                              <SelectItem value="Sarcastic">Sarcastic</SelectItem>
                              <SelectItem value="Concise">Concise</SelectItem>
                              <SelectItem value="Detailed">Detailed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Tech-savviness</Label>
                          <Select
                            value={editingPersona.techSavviness}
                            onValueChange={(value) => setEditingPersona({ ...editingPersona, techSavviness: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Emotional State</Label>
                          <Select
                            value={editingPersona.emotionalState}
                            onValueChange={(value) => setEditingPersona({ ...editingPersona, emotionalState: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Neutral">Neutral</SelectItem>
                              <SelectItem value="Frustrated">Frustrated</SelectItem>
                              <SelectItem value="Happy">Happy</SelectItem>
                              <SelectItem value="Curious">Curious</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Error Tolerance</Label>
                          <Select
                            value={editingPersona.errorTolerance}
                            onValueChange={(value) => setEditingPersona({ ...editingPersona, errorTolerance: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Decision Speed</Label>
                          <Select
                            value={editingPersona.decisionSpeed}
                            onValueChange={(value) => setEditingPersona({ ...editingPersona, decisionSpeed: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Fast">Fast</SelectItem>
                              <SelectItem value="Thoughtful">Thoughtful</SelectItem>
                              <SelectItem value="Hesitant">Hesitant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Slang Usage</Label>
                          <Select
                            value={editingPersona.slangUsage}
                            onValueChange={(value) => setEditingPersona({ ...editingPersona, slangUsage: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="None">None</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="Heavy">Heavy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`memory-${persona.id}`}>History-based Memory</Label>
                          <Switch
                            id={`memory-${persona.id}`}
                            checked={editingPersona.historyBasedMemory}
                            onCheckedChange={(checked) =>
                              setEditingPersona({ ...editingPersona, historyBasedMemory: checked })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="default" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </>
                ) : (
                  <>
                    <CardHeader className="pb-2">
                      <CardTitle>{persona.name}</CardTitle>
                      <CardDescription>{persona.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <Label>Temperature</Label>
                            <span className="text-sm">{persona.temperature.toFixed(1)}</span>
                          </div>
                          <Slider disabled min={0} max={1} step={0.1} value={[persona.temperature]} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Message Length</Label>
                            <p>{persona.messageLength}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Primary Intent</Label>
                            <p >{persona.primaryIntent}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Communication Style</Label>
                            <p >{persona.communicationStyle}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Tech-savviness</Label>
                            <p >{persona.techSavviness}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Emotional State</Label>
                            <p >{persona.emotionalState}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Error Tolerance</Label>
                            <p >{persona.errorTolerance}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Decision Speed</Label>
                            <p>{persona.decisionSpeed}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Slang Usage</Label>
                            <p >{persona.slangUsage}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">History-based Memory</Label>
                            <p>{persona.historyBasedMemory ? "Yes" : "No"}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleDeletePersona(persona.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditPersona(persona)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="standard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.slice(0, 4).map((persona) => (
              <Card key={persona.id} className="relative">
                <CardHeader className="pb-2">
                  <CardTitle>{persona.name}</CardTitle>
                  <CardDescription>{persona.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <Label>Temperature</Label>
                        <span className="text-sm">{persona.temperature.toFixed(1)}</span>
                      </div>
                      <Slider disabled min={0} max={1} step={0.1} value={[persona.temperature]} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Message Length</Label>
                        <p className="font-medium">{persona.messageLength}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Primary Intent</Label>
                        <p className="font-medium">{persona.primaryIntent}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Communication Style</Label>
                        <p className="font-medium">{persona.communicationStyle}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Tech-savviness</Label>
                        <p className="font-medium">{persona.techSavviness}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Emotional State</Label>
                        <p className="font-medium">{persona.emotionalState}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Error Tolerance</Label>
                        <p className="font-medium">{persona.errorTolerance}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Decision Speed</Label>
                        <p className="font-medium">{persona.decisionSpeed}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Slang Usage</Label>
                        <p className="font-medium">{persona.slangUsage}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">History-based Memory</Label>
                        <p className="font-medium">{persona.historyBasedMemory ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditPersona(persona)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="custom" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.slice(4).length > 0 ? (
              personas.slice(4).map((persona) => (
                <Card key={persona.id} className="relative">
                  {editingPersona && editingPersona.id === persona.id ? (
                    <>
                      <CardHeader className="pb-2">
                        <Input
                          value={editingPersona.name}
                          onChange={(e) => setEditingPersona({ ...editingPersona, name: e.target.value })}
                          className="font-bold text-lg"
                        />
                        <Input
                          value={editingPersona.description}
                          onChange={(e) => setEditingPersona({ ...editingPersona, description: e.target.value })}
                          className="text-sm text-muted-foreground"
                        />
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <Label>Temperature</Label>
                              <span className="text-sm">{editingPersona.temperature.toFixed(1)}</span>
                            </div>
                            <Slider
                              min={0}
                              max={1}
                              step={0.1}
                              value={[editingPersona.temperature]}
                              onValueChange={(value) => setEditingPersona({ ...editingPersona, temperature: value[0] })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Message Length</Label>
                            <Select
                              value={editingPersona.messageLength}
                              onValueChange={(value) => setEditingPersona({ ...editingPersona, messageLength: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Short">Short</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Long">Long</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Primary Intent</Label>
                            <Select
                              value={editingPersona.primaryIntent}
                              onValueChange={(value) => setEditingPersona({ ...editingPersona, primaryIntent: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Information-seeking">Information-seeking</SelectItem>
                                <SelectItem value="Transactional">Transactional</SelectItem>
                                <SelectItem value="Support Query">Support Query</SelectItem>
                                <SelectItem value="Feedback">Feedback</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Communication Style</Label>
                            <Select
                              value={editingPersona.communicationStyle}
                              onValueChange={(value) => setEditingPersona({ ...editingPersona, communicationStyle: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Formal">Formal</SelectItem>
                                <SelectItem value="Casual">Casual</SelectItem>
                                <SelectItem value="Sarcastic">Sarcastic</SelectItem>
                                <SelectItem value="Concise">Concise</SelectItem>
                                <SelectItem value="Detailed">Detailed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Tech-savviness</Label>
                            <Select
                              value={editingPersona.techSavviness}
                              onValueChange={(value) => setEditingPersona({ ...editingPersona, techSavviness: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Emotional State</Label>
                            <Select
                              value={editingPersona.emotionalState}
                              onValueChange={(value) => setEditingPersona({ ...editingPersona, emotionalState: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Neutral">Neutral</SelectItem>
                                <SelectItem value="Frustrated">Frustrated</SelectItem>
                                <SelectItem value="Happy">Happy</SelectItem>
                                <SelectItem value="Curious">Curious</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Error Tolerance</Label>
                            <Select
                              value={editingPersona.errorTolerance}
                              onValueChange={(value) => setEditingPersona({ ...editingPersona, errorTolerance: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Decision Speed</Label>
                            <Select
                                value={editingPersona.decisionSpeed}
                                onValueChange={(value) => setEditingPersona({ ...editingPersona, decisionSpeed: value })}
                                >

                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Fast">Fast</SelectItem>
                                <SelectItem value="Thoughtful">Thoughtful</SelectItem>
                                <SelectItem value="Hesitant">Hesitant</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Slang Usage</Label>
                            <Select
                              value={editingPersona.slangUsage}
                              onValueChange={(value) => setEditingPersona({ ...editingPersona, slangUsage: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="Moderate">Moderate</SelectItem>
                                <SelectItem value="Heavy">Heavy</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`memory-${persona.id}`}>History-based Memory</Label>
                            <Switch
                              id={`memory-${persona.id}`}
                              checked={editingPersona.historyBasedMemory}
                              onCheckedChange={(checked) => setEditingPersona({ ...editingPersona, historyBasedMemory: checked })}
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="default" onClick={handleSaveEdit}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </>
                  ) : (
                    <>
                      <CardHeader className="pb-2">
                        <CardTitle>{persona.name}</CardTitle>
                        <CardDescription>{persona.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <Label>Temperature</Label>
                              <span className="text-sm">{persona.temperature.toFixed(1)}</span>
                            </div>
                            <Slider disabled min={0} max={1} step={0.1} value={[persona.temperature]} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Message Length</Label>
                              <p className="font-medium">{persona.messageLength}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Primary Intent</Label>
                              <p className="font-medium">{persona.primaryIntent}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Communication Style</Label>
                              <p className="font-medium">{persona.communicationStyle}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Tech-savviness</Label>
                              <p className="font-medium">{persona.techSavviness}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Emotional State</Label>
                              <p className="font-medium">{persona.emotionalState}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Error Tolerance</Label>
                              <p className="font-medium">{persona.errorTolerance}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Decision Speed</Label>
                              <p className="font-medium">{persona.decisionSpeed}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Slang Usage</Label>
                              <p className="font-medium">{persona.slangUsage}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">History-based Memory</Label>
                              <p className="font-medium">{persona.historyBasedMemory ? "Yes" : "No"}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleDeletePersona(persona.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditPersona(persona)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </>
                  )}
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Custom Personas Yet</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Create your own custom personas to define how your AI agents interact with users.
                </p>
                <Button onClick={() => setIsNewPersonaDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Persona
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

