import { NextResponse } from "next/server";

/** Split text into chunks suitable for the TTS service (≤ maxLen chars each). */
function splitText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    const range = remaining.substring(0, maxLen);
    // Prefer splitting at sentence boundaries, then commas, then spaces
    let splitAt = Math.max(
      range.lastIndexOf(". "),
      range.lastIndexOf("! "),
      range.lastIndexOf("? ")
    );
    if (splitAt > maxLen * 0.3) {
      splitAt += 2;
    } else {
      splitAt = range.lastIndexOf(", ");
      if (splitAt > maxLen * 0.3) {
        splitAt += 2;
      } else {
        splitAt = range.lastIndexOf(" ");
        if (splitAt <= 0) splitAt = maxLen;
        else splitAt += 1;
      }
    }
    chunks.push(remaining.substring(0, splitAt).trim());
    remaining = remaining.substring(splitAt).trim();
  }
  return chunks.filter((c) => c.length > 0);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  const lang = searchParams.get("lang") || "en";

  if (!text) {
    return NextResponse.json(
      { error: "Missing text parameter" },
      { status: 400 }
    );
  }

  try {
    const chunks = splitText(text, 180);
    const audioBuffers: ArrayBuffer[] = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob&ttsspeed=1&textlen=${chunk.length}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/",
        },
      });
      if (!res.ok) throw new Error(`TTS service returned ${res.status}`);
      audioBuffers.push(await res.arrayBuffer());
    }

    const totalLength = audioBuffers.reduce(
      (sum, buf) => sum + buf.byteLength,
      0
    );
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffers) {
      combined.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    return new Response(combined.buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "TTS generation failed" },
      { status: 500 }
    );
  }
}
