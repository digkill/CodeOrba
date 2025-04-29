export function parseGeneratedCode(generatedCode) {
  if (!generatedCode || typeof generatedCode !== "string") {
    console.warn("parseGeneratedCode: пустой или неверный input");
    return [];
  }

  const files = [];

  // 🧪 Попробуем распарсить как JSON-объект, если это не Markdown
  try {
    const asObject = JSON.parse(generatedCode);
    if (typeof asObject === "object" && !Array.isArray(asObject)) {
      console.log("📦 JSON-файлы распознаны");
      return Object.entries(asObject).map(([filename, content]) => ({
        filename,
        content: content?.trim?.() || "",
      }));
    }
  } catch (e) {
    // не JSON — всё ок, идём дальше
  }

  // 📄 Markdown-режим: ### filename + ```content```
  const sections = generatedCode.split(/^###\s+/m).filter(Boolean);

  for (const section of sections) {
    const lines = section.trim().split("\n");
    const filename = lines.shift()?.trim();
    if (!filename) continue;

    let content = lines.join("\n").trim();

    if (content.startsWith("```")) {
      content = content.replace(/^```[\w]*\n?/, "");
      content = content.replace(/```$/, "");
    }

    files.push({ filename, content: content.trim() });
  }

  return files;
}
