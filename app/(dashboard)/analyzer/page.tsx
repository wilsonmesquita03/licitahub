import Chat from "@/components/chat/beta/chat";
import { auth } from "@/lib/auth";
import { generateUUID } from "@/lib/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export interface Attachment {
  object: string;
  id: string;
  purpose: "assistants";
  filename: string;
  bytes: number;
  created_at: number;
  expires_at: number | null;
  status: string;
  status_details: null;
}

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const id = generateUUID();

  return (
    <Chat
      id={id}
      key={id}
      initialMessages={[]}
      isReadonly={false}
      session={session.session}
    />
  );
}
