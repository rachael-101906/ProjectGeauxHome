// Prints every voice file name the game looks for, next to the line it should say.
// Usage: npm run voice:list            (all lines)
//        npm run voice:list -- --missing   (only lines with no file yet)
import { existsSync, writeFileSync } from "node:fs";
import { voiceFileList } from "../src/data/voiceFiles.js";

const dir = new URL("../src/components/assets/voice/", import.meta.url);
const onlyMissing = process.argv.includes("--missing");
const rows = voiceFileList().map(([file, line]) => ({ file, line, have: existsSync(new URL(file, dir)) }));
for (const r of rows) if (!onlyMissing || !r.have) console.log(`${r.have ? "✓" : "·"} ${r.file.padEnd(26)} ${r.line}`);
const have = rows.filter((r) => r.have).length;
console.log(`\n${have}/${rows.length} voice files present in src/components/assets/voice/`);
writeFileSync(new URL("voice-lines.csv", dir), "file,line\n" + rows.map((r) => `${r.file},"${r.line.replace(/"/g, '""')}"`).join("\n") + "\n");
console.log("Wrote src/components/assets/voice/voice-lines.csv (handy for batch-generating in ElevenLabs).");
