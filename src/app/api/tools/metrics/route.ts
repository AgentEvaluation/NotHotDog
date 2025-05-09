import { NextResponse } from "next/server";
import { dbService } from "@/services/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const metrics = await dbService.getMetrics(userId);
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
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

    const metricData = await request.json();
    
    if (!metricData.name || !metricData.type || !metricData.criticality) {
      return NextResponse.json({ error: "Missing required metric fields" }, { status: 400 });
    }
    
    const newMetric = await dbService.createMetric({
      ...metricData,
      org_id: profile.org_id,
      created_by: profile.id,
      agentIds: metricData.agentIds || []
    });
    
    return NextResponse.json(newMetric, { status: 201 });
  } catch (error) {
    console.error("Error creating metric:", error);
    return NextResponse.json({ error: "Failed to create metric" }, { status: 500 });
  }
}