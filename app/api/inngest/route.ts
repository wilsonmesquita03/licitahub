import { syncPncp } from "@/lib/ingest/functions";
import { inngest } from "@/lib/utils/server";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncPncp],
});
