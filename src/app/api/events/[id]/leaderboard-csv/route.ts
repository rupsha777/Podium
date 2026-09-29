import { exportLeaderboardCSV } from "@/actions/judging";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await exportLeaderboardCSV(id);

  if (!result.success || !result.data) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return new NextResponse(result.data, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leaderboard.csv"`,
    },
  });
}