import { withApiHandler } from '@/lib/api-utils';
import { dbService } from "@/services/db";
import { auth } from "@clerk/nextjs/server";
import { AuthorizationError, NotFoundError } from '@/lib/errors';

export const DELETE = withApiHandler(async (
  request: Request,
  context: { params: any }
) => {
  const { id: personaId } = await context.params;

  if (!personaId) {
    throw new NotFoundError("Missing persona ID");
  }

  const { userId } = await auth();
  if (!userId) {
    throw new AuthorizationError("Unauthorized");
  }

  const persona = await dbService.getPersonaById(personaId);
  if (!persona) {
    throw new NotFoundError("Persona not found");
  }

  await dbService.deletePersona(personaId);
  return { success: true };
});