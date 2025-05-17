import { withApiHandler } from "@/lib/api-utils";
import { dbService } from "@/services/db";
import { ValidationError, NotFoundError } from "@/lib/errors";

export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const clerkId = searchParams.get("clerkId");
  
  if (!clerkId) {
    throw new ValidationError("Clerk ID required");
  }

  const profile = await dbService.getProfileByClerkId(clerkId);
  if (!profile) {
    return { profile: null, organization: null };
  }
  
  if (!profile.org_id) {
    return { profile, organization: null };
  }
  
  const organization = await dbService.getOrganization(profile.org_id);
  return { profile, organization };
});