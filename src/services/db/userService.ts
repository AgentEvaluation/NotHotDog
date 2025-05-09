import { prisma } from '@/lib/prisma';

export class UserService {
  async signupUser(data: { 
    clerkId: string; 
    orgName: string; 
    orgDescription: string; 
    role: string; 
    status: string; 
  }) {
    try {
      const { clerkId, orgName, orgDescription, role, status } = data;
      return await prisma.$transaction(async (tx) => {
        const newOrg = await tx.organizations.create({
          data: {
            name: orgName,
            description: orgDescription,
          },
        });
        const newProfile = await tx.profiles.create({
          data: {
            clerk_id: clerkId,
            org_id: newOrg.id,
          },
        });
        const newOrgMember = await tx.org_members.create({
          data: {
            org_id: newOrg.id,
            user_id: newProfile.id,
            role,
            status,
          },
        });
        return { organization: newOrg, profile: newProfile, orgMember: newOrgMember };
      });
    } catch (error) {
      console.error("Database error in signupUser:", error);
      throw new Error("Failed to sign up user");
    }
  }
  
  async getProfileByClerkId(clerkId: string) {
    try {
      const profile = await prisma.profiles.findUnique({
        where: { clerk_id: clerkId }
      });
      return profile;
    } catch (error) {
      console.error("Database error in getProfileByClerkId:", error);
      return null;
    }
  }
  
  async getOrganization(orgId: string) {
    try{
      return await prisma.organizations.findUnique({
        where: { id: orgId }
      });
    } catch(error){
      console.error("Database error in getOrganization:", error);
      throw new Error("Failed to fetch organization");
    }
  }
}

export const userService = new UserService();