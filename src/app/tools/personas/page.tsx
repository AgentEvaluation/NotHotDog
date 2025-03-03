"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PersonasScreen() {
  const [personas, setPersonas] = useState([
    {
      id: 1,
      name: "Chatty",
      description: "Speaks in long sentences, asks a lot of questions",
      temperature: 0.8,
      messageLength: "Long",
      questionFrequency: "High",
      technicalLevel: "Low",
      isVerbose: true,
      isEmotional: true,
    },
    {
      id: 2,
      name: "Concise",
      description: "Brief and to-the-point responses",
      temperature: 0.3,
      messageLength: "Short",
      questionFrequency: "Low",
      technicalLevel: "Medium",
      isVerbose: false,
      isEmotional: false,
    },
    {
      id: 3,
      name: "Technical",
      description: "Uses technical vocabulary and detailed explanations",
      temperature: 0.4,
      messageLength: "Medium",
      questionFrequency: "Medium",
      technicalLevel: "High",
      isVerbose: true,
      isEmotional: false,
    },
    {
      id: 4,
      name: "Friendly",
      description: "Casual, approachable tone with personal touches",
      temperature: 0.7,
      messageLength: "Medium",
      questionFrequency: "Medium",
      technicalLevel: "Low",
      isVerbose: false,
      isEmotional: true,
    },
  ])

  const [editingPersona, setEditingPersona] = useState(null)
  const [newPersona, setNewPersona] = useState({
    name: "",
    description: "",
    temperature: 0.5,
    messageLength: "Medium",
    questionFrequency: "Medium",
    technicalLevel: "Medium",
    isVerbose: false,
    isEmotional: false,
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
      questionFrequency: "Medium",
      technicalLevel: "Medium",
      isVerbose: false,
      isEmotional: false,
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Persona</DialogTitle>
              <div>Define a new AI personality with custom traits and behaviors.</div>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newPersona.name}
                  onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newPersona.description}
                  onChange={(e) => setNewPersona({ ...newPersona, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="temperature" className="text-right">
                  Temperature: {newPersona.temperature.toFixed(1)}
                </Label>
                <div className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="messageLength" className="text-right">
                  Message Length
                </Label>
                <Select
                  value={newPersona.messageLength}
                  onValueChange={(value) => setNewPersona({ ...newPersona, messageLength: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short">Short</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="questionFrequency" className="text-right">
                  Question Frequency
                </Label>
                <Select
                  value={newPersona.questionFrequency}
                  onValueChange={(value) => setNewPersona({ ...newPersona, questionFrequency: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="technicalLevel" className="text-right">
                  Technical Level
                </Label>
                <Select
                  value={newPersona.technicalLevel}
                  onValueChange={(value) => setNewPersona({ ...newPersona, technicalLevel: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isVerbose" className="text-right">
                  Verbose
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="isVerbose"
                    checked={newPersona.isVerbose}
                    onCheckedChange={(checked) => setNewPersona({ ...newPersona, isVerbose: checked })}
                  />
                  <Label htmlFor="isVerbose">{newPersona.isVerbose ? "Yes" : "No"}</Label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isEmotional" className="text-right">
                  Emotional
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="isEmotional"
                    checked={newPersona.isEmotional}
                    onCheckedChange={(checked) => setNewPersona({ ...newPersona, isEmotional: checked })}
                  />
                  <Label htmlFor="isEmotional">{newPersona.isEmotional ? "Yes" : "No"}</Label>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                          <Label>Question Frequency</Label>
                          <Select
                            value={editingPersona.questionFrequency}
                            onValueChange={(value) =>
                              setEditingPersona({ ...editingPersona, questionFrequency: value })
                            }
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
                          <Label>Technical Level</Label>
                          <Select
                            value={editingPersona.technicalLevel}
                            onValueChange={(value) => setEditingPersona({ ...editingPersona, technicalLevel: value })}
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
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`verbose-${persona.id}`}>Verbose</Label>
                          <Switch
                            id={`verbose-${persona.id}`}
                            checked={editingPersona.isVerbose}
                            onCheckedChange={(checked) => setEditingPersona({ ...editingPersona, isVerbose: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`emotional-${persona.id}`}>Emotional</Label>
                          <Switch
                            id={`emotional-${persona.id}`}
                            checked={editingPersona.isEmotional}
                            onCheckedChange={(checked) =>
                              setEditingPersona({ ...editingPersona, isEmotional: checked })
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
                            <p className="font-medium">{persona.messageLength}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Question Frequency</Label>
                            <p className="font-medium">{persona.questionFrequency}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Technical Level</Label>
                            <p className="font-medium">{persona.technicalLevel}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Verbose</Label>
                            <p className="font-medium">{persona.isVerbose ? "Yes" : "No"}</p>
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
                        <Label className="text-xs text-muted-foreground">Question Frequency</Label>
                        <p className="font-medium">{persona.questionFrequency}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Technical Level</Label>
                        <p className="font-medium">{persona.technicalLevel}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Verbose</Label>
                        <p className="font-medium">{persona.isVerbose ? "Yes" : "No"}</p>
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
                            <Label>Question Frequency</Label>
                            <Select
                              value={editingPersona.questionFrequency}
                              onValueChange={(value) =>
                                setEditingPersona({ ...editingPersona, questionFrequency: value })
                              }
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
                            <Label>Technical Level</Label>
                            <Select
                              value={editingPersona.technicalLevel}
                              onValueChange={(value) => setEditingPersona({ ...editingPersona, technicalLevel: value })}
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
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`verbose-${persona.id}`}>Verbose</Label>
                            <Switch
                              id={`verbose-${persona.id}`}
                              checked={editingPersona.isVerbose}
                              onCheckedChange={(checked) =>
                                setEditingPersona({ ...editingPersona, isVerbose: checked })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`emotional-${persona.id}`}>Emotional</Label>
                            <Switch
                              id={`emotional-${persona.id}`}
                              checked={editingPersona.isEmotional}
                              onCheckedChange={(checked) =>
                                setEditingPersona({ ...editingPersona, isEmotional: checked })
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
                              <p className="font-medium">{persona.messageLength}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Question Frequency</Label>
                              <p className="font-medium">{persona.questionFrequency}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Technical Level</Label>
                              <p className="font-medium">{persona.technicalLevel}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Verbose</Label>
                              <p className="font-medium">{persona.isVerbose ? "Yes" : "No"}</p>
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

