import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function GET() {
  const session = await getSession();

  if (session.status === "authenticated") return redirect("/dashboard");

  redirect("/login");
}
