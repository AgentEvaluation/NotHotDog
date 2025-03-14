import { NextResponse } from "next/server";
import { dbService } from "@/services/db/dbService";
import { auth } from "@clerk/nextjs/server";
import { mapToUIPersona } from "@/lib/utils";
import { generateSystemPromptForPersona } from "@/services/persona";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  
  try {
    const dbPersonas = await dbService.getPersonas(userId);
    const personas = dbPersonas.map(mapToUIPersona);

    return new NextResponse(
      JSON.stringify(personas),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching personas:", error);
    return NextResponse.json({ error: "Failed to fetch personas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await dbService.getProfileByClerkId(userId);
    if (!profile || !profile.org_id) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const personaData = await request.json();
    
    if (!personaData.name || !personaData.temperature === undefined || 
        !personaData.messageLength || !personaData.primaryIntent ||
        !personaData.communicationStyle) {
      return NextResponse.json({ error: "Missing required persona fields" }, { status: 400 });
    }

    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required to generate system prompt" }, { status: 400 });
    }
    
    // Generate system prompt
    const systemPrompt = await generateSystemPromptForPersona(personaData, apiKey);
    
    
    const newPersona = await dbService.createPersona({
      ...personaData,
      org_id: profile.org_id,
      systemPrompt
    });
    
    return NextResponse.json(newPersona, { status: 201 });
  } catch (error) {
    console.error("Error creating persona:", error);
    return NextResponse.json({ error: "Failed to create persona" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const personaData = await request.json();
    
    // Basic validation for required fields
    if (!personaData.name || personaData.temperature === undefined || 
        !personaData.messageLength || !personaData.primaryIntent ||
        !personaData.communicationStyle) {
      return NextResponse.json({ error: "Missing required persona fields" }, { status: 400 });
    }
    
    const updatedPersona = await dbService.updatePersona(params.id, personaData);
    
    return NextResponse.json(updatedPersona);
  } catch (error) {
    console.error("Error updating persona:", error);
    return NextResponse.json({ error: "Failed to update persona" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbService.deletePersona(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting persona:", error);
    return NextResponse.json({ error: "Failed to delete persona" }, { status: 500 });
  }
}