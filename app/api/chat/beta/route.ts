// @ts-nocheck

import { generateTitleFromUserMessage } from "@/app/(dashboard)/analyzer/actions";
import type { Attachment } from "@/app/(dashboard)/analyzer/page";
import { systemPrompt } from "@/lib/ai/prompts";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AssistantResponse } from "ai";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const input: {
    id: string;
    threadId: string | null;
    message: string;
    attachments: Array<Attachment>;
  } = await req.json();

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;

  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: input.message,
    attachments: input.attachments.map((attachment) => ({
      file_id: attachment.id,
      tools: [
        {
          type: "file_search",
        },
      ],
    })),
  });

  let chat = await prisma.chat.findFirst({
    where: { id: input.id },
  });

  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        id: input.id,
        threadId: input.threadId,
        title: await generateTitleFromUserMessage({ message: input.message }),
        visibility: "public",
        createdAt: new Date(),
        userId: session.user.id,
      },
    });
  }

  await prisma.message.create({
    data: {
      attachments: JSON.stringify(input.attachments),
      parts: [{ type: "text", text: input.message }],
      id: createdMessage.id,
      createdAt: new Date(),
      role: "user",
      chatId: chat.id,
    },
  });

  const userContext = await prisma.onboardingResponse.findMany({
    where: {
      userId: session.user.id,
    },
  });

  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream, sendDataMessage }) => {
      // Run the assistant on the thread
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id: "asst_tT4E2GmuOfxg3aZL12uE780T",
        additional_instructions: systemPrompt({
          selectedChatModel: "regular",
          userContext,
        }),
      });

      // forward run status would stream message deltas
      let runResult = await forwardStream(runStream);

      // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
      if (runResult?.status === "completed") {
        const messages = await openai.beta.threads.messages.list(threadId, {
          run_id: runResult.id,
          limit: 1,
        });

        const message = messages.data[0];

        if (message.content)
          await prisma.message.create({
            data: {
              attachments: [],
              parts: message.content
                .filter((content) => content.type === "text")
                .map((content) => ({
                  type: content.type,
                  text: content.text?.value,
                })),
              id: message.id,
              createdAt: new Date(message.created_at),
              role: "assistant",
              chatId: chat.id,
            },
          });
      }

      while (
        runResult?.status === "requires_action" &&
        runResult.required_action?.type === "submit_tool_outputs"
      ) {
        const tool_outputs =
          runResult.required_action.submit_tool_outputs.tool_calls.map(
            (toolCall: any) => {
              const parameters = JSON.parse(toolCall.function.arguments);

              switch (toolCall.function.name) {
                // configure your tool calls here

                default:
                  throw new Error(
                    `Unknown tool call function: ${toolCall.function.name}`
                  );
              }
            }
          );

        runResult = await forwardStream(
          openai.beta.threads.runs.submitToolOutputsStream(
            threadId,
            runResult.id,
            { tool_outputs }
          )
        );
      }
    }
  );
}
