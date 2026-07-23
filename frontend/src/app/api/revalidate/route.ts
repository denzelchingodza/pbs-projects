/**
 * Lets the admin panel force an immediate refresh of specific public pages
 * right after a save, instead of waiting out the site's normal 60 second
 * cache window (see lib/api.ts's `next: { revalidate: 60 }`). Only clears
 * the exact paths it's told to, nothing else on the site is touched.
 *
 * This route lives at /api/revalidate, inside Next's own app directory, so
 * it's resolved by Next itself and never reaches the next.config.js rewrite
 * that sends every other /api/* request to the FastAPI backend. Next checks
 * its own routes before applying that rewrite, so the two don't collide.
 *
 * No auth check here on purpose: this endpoint can't read or change any
 * real data, at worst someone could make it drop a cache a little early,
 * which is harmless. Called from lib/revalidate.ts right after an admin
 * mutation succeeds.
 */
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let paths: string[] = [];

  try {
    const body = await request.json();
    if (Array.isArray(body?.paths)) {
      paths = body.paths.filter((p: unknown): p is string => typeof p === "string" && p.startsWith("/"));
    }
  } catch {
    return NextResponse.json({ revalidated: false, error: "Invalid request body." }, { status: 400 });
  }

  if (paths.length === 0) {
    return NextResponse.json({ revalidated: false, error: "No valid paths supplied." }, { status: 400 });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths });
}
