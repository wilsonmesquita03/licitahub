import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function GET(request: NextRequest) {
    const result = await openai.beta.assistants.list({})

    for (const assistant of result.data) {
        await openai.beta.assistants.del(assistant.id)
    }   

    return NextResponse.json(result);
}
