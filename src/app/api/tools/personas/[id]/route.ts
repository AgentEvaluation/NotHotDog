import { NextResponse } from "next/server";
import { dbService } from "@/services/db";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  context: { params: any }
) {
  const { id: personaId } = await context.params;

  if (!personaId) {
    return NextResponse.json(
      { error: "Missing persona ID" },
      { status: 400 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const persona = await dbService.getPersonaById(personaId);
    if (!persona) {
      return NextResponse.json(
        { error: "Persona not found" },
        { status: 404 }
      );
    }

    await dbService.deletePersona(personaId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting persona:", error);
    return NextResponse.json(
      { error: "Failed to delete persona" },
      { status: 500 }
    );
  }
}
