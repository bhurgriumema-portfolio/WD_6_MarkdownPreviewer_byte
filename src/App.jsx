
import { useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import "./App.css";

marked.setOptions({
  gfm: true,
  breaks: true,
});

const starterMarkdown = `# Welcome to MarkFlow Studio

Your workspace for **beautiful Markdown**.

Write on the left. Your formatted document appears on the right — instantly.

## What you can create

- Technical documentation
- Project README files
- Notes and tutorials
- Code examples

## Code highlighting

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));
\`\`\`

## A simple table

| Feature | Status |
| --- | --- |
| Live preview | Ready |
| Markdown | Supported |
| Code blocks | Highlighted |

> Great documentation makes great software easier to understand.

[Learn Markdown](https://www.markdownguide.org/)

---

**Start editing to see the magic.**
`;

function renderMarkdown(source) {
  const rawHtml = marked.parse(source, { async: false });

  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
  });
}

function App() {
  const [markdown, setMarkdown] = useState(starterMarkdown);
  const [copied, setCopied] = useState(false);

  const editorRef = useRef(null);
  const previewRef = useRef(null);

  const previewHtml = useMemo(
    () => renderMarkdown(markdown),
    [markdown]
  );

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    preview.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
  }, [previewHtml]);

  function applyInlineFormat(before, after, placeholder) {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.slice(start, end);
    const text = selected || placeholder;

    const replacement = before + text + after;
    const updated =
      markdown.slice(0, start) +
      replacement +
      markdown.slice(end);

    setMarkdown(updated);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + text.length
      );
    });
  }

  function applyLinePrefix(prefix, placeholder) {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const lineStart = markdown.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = markdown.indexOf("\n", end);

    if (lineEnd === -1) {
      lineEnd = markdown.length;
    }

    let selectedLines = markdown.slice(lineStart, lineEnd);

    if (!selectedLines.trim()) {
      selectedLines = placeholder;
    }

    const lines = selectedLines.split("\n");
    const allPrefixed = lines.every((line) =>
      line.startsWith(prefix)
    );

    const updatedLines = lines.map((line) => {
      if (allPrefixed) {
        return line.startsWith(prefix)
          ? line.slice(prefix.length)
          : line;
      }

      return prefix + line;
    });

    const replacement = updatedLines.join("\n");
    const updated =
      markdown.slice(0, lineStart) +
      replacement +
      markdown.slice(lineEnd);

    setMarkdown(updated);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        lineStart,
        lineStart + replacement.length
      );
    });
  }

  function insertCodeBlock() {
    applyInlineFormat(
      "\n```javascript\n",
      "\n```\n",
      "// Write your code here"
    );
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.alert("Copy failed. Please try copying the text manually.");
    }
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "markflow-document.md";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  function clearEditor() {
    setMarkdown("");

    requestAnimationFrame(() => {
      editorRef.current?.focus();
    });
  }

  const wordCount = markdown.trim()
    ? markdown.trim().split(/\s+/).length
    : 0;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#"
          aria-label="MarkFlow Studio home"
        >
          <span className="brand-icon">M</span>
          <span>
            <strong>MarkFlow</strong>
            <small>STUDIO</small>
          </span>
        </a>

        <div className="topbar-center">
          <span className="status-dot" />
          Live Markdown Workspace
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="button button-quiet"
            onClick={copyMarkdown}
          >
            {copied ? "✓ Copied" : "Copy Markdown"}
          </button>

          <button
            type="button"
            className="button button-primary"
            onClick={downloadMarkdown}
          >
            ↓ Export .md
          </button>
        </div>
      </header>

      <section className="welcome-row">
        <div>
          <div className="eyebrow">YOUR WRITING WORKSPACE</div>
          <h1>
            Ideas into <span>documentation.</span>
          </h1>
          <p>
            Write naturally. Preview beautifully. Ship with confidence.
          </p>
        </div>

        <div className="document-badge">
          <span className="document-icon">MD</span>
          <span>
            <strong>Untitled document</strong>
            <small>Markdown document</small>
          </span>
        </div>
      </section>

      <section className="editor-card">
        <div className="workspace-toolbar">
          <div className="workspace-tabs">
            <span className="tab tab-active">Editor &amp; Preview</span>
          </div>

          <div className="toolbar-right">
            <span className="live-label">
              <span className="status-dot" /> LIVE
            </span>

            <button
              type="button"
              className="text-button"
              onClick={clearEditor}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="panels">
          <section className="panel editor-panel">
            <div className="panel-heading">
              <div className="panel-title">
                <span className="panel-symbol">&lt;/&gt;</span>
                <div>
                  <strong>MARKDOWN</strong>
                  <small>Source editor</small>
                </div>
              </div>

              <span className="file-pill">.md</span>
            </div>

            <div
              className="format-toolbar"
              role="toolbar"
              aria-label="Markdown formatting shortcuts"
            >
              <button
                type="button"
                title="Toggle heading"
                aria-label="Toggle heading"
                onClick={() => applyLinePrefix("## ", "Heading")}
              >
                H
              </button>

              <button
                type="button"
                title="Bold selected text"
                aria-label="Bold"
                onClick={() =>
                  applyInlineFormat("**", "**", "bold text")
                }
              >
                <strong>B</strong>
              </button>

              <button
                type="button"
                title="Italic selected text"
                aria-label="Italic"
                onClick={() =>
                  applyInlineFormat("*", "*", "italic text")
                }
              >
                <em>I</em>
              </button>

              <button
                type="button"
                title="Insert link"
                aria-label="Insert link"
                onClick={() =>
                  applyInlineFormat(
                    "[",
                    "](https://example.com)",
                    "link text"
                  )
                }
              >
                ↗
              </button>

              <button
                type="button"
                title="Insert code block"
                aria-label="Insert code block"
                onClick={insertCodeBlock}
              >
                {"</>"}
              </button>

              <button
                type="button"
                title="Toggle bullet list"
                aria-label="Toggle bullet list"
                onClick={() => applyLinePrefix("- ", "List item")}
              >
                ☷
              </button>
            </div>

            <textarea
              ref={editorRef}
              className="markdown-input"
              aria-label="Markdown source editor"
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              spellCheck={false}
              placeholder="Start writing Markdown here..."
            />

            <div className="panel-footer">
              <span>Markdown · GitHub Flavored</span>
              <span>{markdown.length} characters</span>
            </div>
          </section>

          <section className="panel preview-panel">
            <div className="panel-heading">
              <div className="panel-title">
                <span className="preview-symbol">◉</span>
                <div>
                  <strong>LIVE PREVIEW</strong>
                  <small>Rendered document</small>
                </div>
              </div>

              <span className="preview-pill">● Live</span>
            </div>

            <div
              ref={previewRef}
              className="preview-content markdown-body"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />

            <div className="panel-footer">
              <span>HTML preview · Sanitized</span>
              <span>{wordCount} words</span>
            </div>
          </section>
        </div>
      </section>

      <footer className="app-footer">
        <span>
          <span className="status-dot" />
          All changes preview instantly
        </span>
        <span>Built for developers, by developers.</span>
      </footer>
    </main>
  );
}

export default App;
