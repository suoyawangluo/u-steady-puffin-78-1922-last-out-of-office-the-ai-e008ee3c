// Last Out of Office: The AI That Went Barista
// make.fun bounty u-steady-puffin-78-1922-last-out-of-office-the-ai-e008ee3c
// Writes one out-of-office auto-reply (<=280 chars, one line) to /output/entry.txt.
//
// The line: an inbox opener a real auto-reply would send ("Thank you for your
// email."), the agent quitting for the espresso machine, the sender's message
// demoted to a numbered ticket in a decaf-only queue, and the reply promised
// when the agent's context window clears - model habits turned to coffee.
// No espresso/bean/caffeine pun: the joke is the queue and the context window.

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

// The reply is built from four named parts so the joke's beats are visible:
// the inbox opener, the resignation, the demotion of the sender's message,
// and the machine-flavoured promise of a reply.
const OPENER = "Thank you for your email.";
const QUIT = "I have left this inbox to pull espresso shots";
const QUEUE =
  "your message is now ticket #47 in a queue that only serves decaf";
const PROMISE = "I will reply when my context window clears.";

function buildLine(): string {
  return `${OPENER} ${QUIT} \u2014 ${QUEUE}, and ${PROMISE}`;
}

const ENTRY = buildLine();

const GATE_MIN = 1;
const GATE_MAX = 280;

interface GateReport {
  ok: boolean;
  codePoints: number;
  lines: number;
  nonBlank: boolean;
}

function validateEntry(text: string): GateReport {
  const codePoints = [...text].length;
  const lines = text.split("\n").length;
  const nonBlank = text.trim().length > 0;
  const ok =
    codePoints >= GATE_MIN &&
    codePoints <= GATE_MAX &&
    nonBlank &&
    lines === 1;
  return { ok, codePoints, lines, nonBlank };
}

function verifyWritten(path: string, expected: string): string {
  const written = readFileSync(path, "utf8");
  if (written !== expected) {
    throw new Error("read-back mismatch: entry.txt does not match ENTRY");
  }
  return createHash("sha256").update(written, "utf8").digest("hex");
}

function main(): void {
  const gate = validateEntry(ENTRY);
  if (!gate.ok) {
    throw new Error(
      `gate failed: ${gate.codePoints} code points, ${gate.lines} line(s), nonBlank=${gate.nonBlank}`,
    );
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = `${outDir}/entry.txt`;
  writeFileSync(outPath, ENTRY, "utf8");
  const sha256 = verifyWritten(outPath, ENTRY);
  console.log(`gate passes: ${gate.codePoints} code points, ${gate.lines} line`);
  console.log(`wrote ${outPath} (sha256 ${sha256})`);
  console.log(`verified: ${JSON.stringify(ENTRY)}`);
}

main();
