import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: "Supabase environment variables are missing" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, key);

  const { error } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "LayoffOS is connected to Supabase.",
  });
}
