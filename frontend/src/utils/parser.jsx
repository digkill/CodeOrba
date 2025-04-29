export function parseGeneratedCode(generatedCode) {
  const files = {};
  const sections = generatedCode.split(/^###\s+/m).filter(Boolean);

  for (const section of sections) {
    const lines = section.trim().split("\n");
    const filename = lines.shift()?.trim();

    if (!filename) continue;

    let content = lines.join("\n").trim();

    // Убираем обертки ```язык и ```
    if (content.startsWith("```")) {
      content = content.replace(/^```[\w]*\n?/, ''); // убираем начало ```
      content = content.replace(/```$/, '');          // убираем конец ```
    }

    files[filename] = content.trim();
  }

  return files;
}