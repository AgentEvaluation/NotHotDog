import { withApiHandler } from "@/lib/api-utils";
import { dbService } from "@/services/db";
import { ValidationError } from "@/lib/errors";

export const POST = withApiHandler(async (request: Request) => {
  const { clerkId, orgName, orgDescription, role, status } = await request.json();
  
  if (!clerkId || !orgName) {
    throw new ValidationError("Missing required fields for signup");
  }
  
  const result = await dbService.signupUser({
    clerkId,
    orgName,
    orgDescription: orgDescription || "",
    role: role || "admin",
    status: status || "active",
  });
  
  return result;
});