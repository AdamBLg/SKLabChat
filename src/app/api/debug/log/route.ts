import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFirstLevelEntries, clearFirstLevel } from "@/lib/ai/logger";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sinceParam = searchParams.get("since");
  const sinceId = sinceParam !== null ? Number(sinceParam) : undefined;

  const entries = getFirstLevelEntries(sinceId);
  const lastId = entries.length ? entries[entries.length - 1].id : sinceId ?? 0;

  return NextResponse.json({ entries, lastId });
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  clearFirstLevel();
  return NextResponse.json({ ok: true });
}
