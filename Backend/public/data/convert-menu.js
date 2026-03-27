import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.resolve(__dirname, "menu.js");
const OUTPUT_FILE = path.resolve(__dirname, "menu.cleaned.js");

const content = fs.readFileSync(INPUT_FILE, "utf-8");

// 2️⃣ Extract image imports → variable → filename
const imageMap = {};
// Updated Regex to capture the exact filename including extension
const importRegex = /import\s+(\w+)\s+from\s+["']\.\/images\/(.+?)["']/g;

let match;
while ((match = importRegex.exec(content)) !== null) {
  const variable = match[1];
  const fileName = match[2]; // 🔥 FIXED: No toLowerCase() or replace()

  imageMap[variable] = fileName;
}

// 3️⃣ Remove all imports
let cleaned = content.replace(importRegex, "");

// 4️⃣ Replace image_url → image
cleaned = cleaned.replace(/image_url:\s*(\w+)/g, (_, varName) => {
  // If the variable matches an import, use that filename; otherwise default
  return `image: "${imageMap[varName] || "missing.jpg"}"`;
});

// 5️⃣ Extract array
const arrayRegex = /=\s*(\[[\s\S]*?\]);|export\s+default\s+(\[[\s\S]*?\]);/;
const arrayMatch = cleaned.match(arrayRegex);

if (!arrayMatch) {
  console.error("❌ Menu array not found");
  process.exit(1);
}

const arrayText = arrayMatch[1] || arrayMatch[2];

// 6️⃣ Write JS array
const output = `const menu = ${arrayText};

export default menu;
`;

fs.writeFileSync(OUTPUT_FILE, output);

console.log("✅ DONE: Filenames preserved exactly as they appear in imports.");
console.log("📄 Output:", OUTPUT_FILE);
