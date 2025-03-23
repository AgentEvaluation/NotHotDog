import { NextResponse } from "next/server";
import { dbService } from "@/services/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const metric = await dbService.getMetricById(params.id);
    if (!metric) {
      return NextResponse.json({ error: "Metric not found" }, { status: 404 });
    }
    return NextResponse.json(metric);
  } catch (error) {
    console.error("Error fetching metric:", error);
    return NextResponse.json({ error: "Failed to fetch metric" }, { status: 500 });
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
    const metricData = await request.json();
    
    // Basic validation for required fields
    if (!metricData.name || !metricData.type || !metricData.criticality) {
      return NextResponse.json({ error: "Missing required metric fields" }, { status: 400 });
    }
    
    const updatedMetric = await dbService.updateMetric(params.id, metricData);
    
    return NextResponse.json(updatedMetric);
  } catch (error) {
    console.error("Error updating metric:", error);
    return NextResponse.json({ error: "Failed to update metric" }, { status: 500 });
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
    await dbService.deleteMetric(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting metric:", error);
    return NextResponse.json({ error: "Failed to delete metric" }, { status: 500 });
  }
}