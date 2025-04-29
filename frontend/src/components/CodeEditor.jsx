import { useEffect, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { python } from "@codemirror/lang-python";
import { php } from "@codemirror/lang-php";
import { oneDark } from "@codemirror/theme-one-dark";
import { highlightActiveLine } from "@codemirror/view";

export default function CodeEditor({ filename, code, onChange }) {
  const [view, setView] = useState(null);

  useEffect(() => {
    if (!view) return;

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: code,
      },
    });
  }, [code, view]);

  useEffect(() => {
    if (!filename) return;

    const language = getLanguageExtension(filename);

    const editor = new EditorView({
      parent: document.getElementById("editor"),
      extensions: [basicSetup, highlightActiveLine(), language, oneDark, EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newCode = update.state.doc.toString();
          onChange(newCode);
        }
      })],
    });

    setView(editor);

    return () => editor.destroy();
  }, [filename]);

  return (
<div
  id="editor"
  className="h-[70vh] w-full rounded-xl overflow-auto border border-neutral-700"
  style={{ fontSize: "14px" }}
/>
  );
}

function getLanguageExtension(filename) {
  if (filename.endsWith(".js")) return javascript();
  if (filename.endsWith(".html")) return html();
  if (filename.endsWith(".css")) return css();
  if (filename.endsWith(".py")) return python();
  if (filename.endsWith(".php")) return php();
  return javascript(); // По умолчанию
}
