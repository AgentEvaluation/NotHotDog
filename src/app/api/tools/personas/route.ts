import { NextResponse } from "next/server";
import { dbService } from "@/services/db/dbService";
import { auth } from "@clerk/nextjs/server";
import { mapToUIPersona } from "@/lib/utils";
import { generateSystemPromptForPersona } from "@/services/persona";
import { ModelFactory } from "@/services/llm/modelfactory";
import { LLMProvider } from "@/services/llm/enums";

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
    
    if (!personaData.name || personaData.temperature === undefined || 
        !personaData.messageLength || !personaData.primaryIntent ||
        !personaData.communicationStyle) {
      return NextResponse.json({ error: "Missing required persona fields" }, { status: 400 });
    }

    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required to generate system prompt" }, { status: 400 });
    }
    
    const modelId = request.headers.get("x-model") || "";
    const providerStr = request.headers.get("x-provider") || "";
    const extraParamsStr = request.headers.get("x-extra-params");
    
    // Convert provider string to LLMProvider enum
    const provider = (providerStr as LLMProvider) || LLMProvider.Anthropic;
    
    let extraParams = {};
    if (extraParamsStr) {
      try {
        extraParams = JSON.parse(extraParamsStr);
      } catch (e) {
        console.error("Failed to parse extra params", e);
      }
    }
    
    const modelConfig = {
      id: modelId,
      provider,
      name: "Model from headers",
      apiKey,
      keyName: "From headers",
      extraParams
    };
    
    try {
      const systemPrompt = await generateSystemPromptForPersona(personaData, modelConfig);
      
      const newPersona = await dbService.createPersona({
        ...personaData,
        org_id: profile.org_id,
        systemPrompt
      });
      
      return NextResponse.json(newPersona, { status: 201 });
    } catch (error) {
      console.error("Error generating system prompt:", error);
      return NextResponse.json({ 
        error: "Failed to generate system prompt. Please check your API key and model configuration." 
      }, { status: 500 });
    }
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