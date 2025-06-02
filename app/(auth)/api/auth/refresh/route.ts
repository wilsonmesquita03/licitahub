import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();

  return Response.json(session);
}
