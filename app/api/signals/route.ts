import { loadSources } from "@/lib/sources/load-sources";

export const runtime = "nodejs";
export async function GET() {
  return Response.json(await loadSources(), {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
    },
  });
}
