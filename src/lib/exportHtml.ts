import type { Editor } from "@tiptap/react";

/**
 * Build a self-contained HTML export string from the current editor content.
 * This is the single source of truth — used by both ExportDropMenu and MobileSideBar.
 */
export function buildHtmlExport(editor: Editor, documentTitle: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${documentTitle}</title>

    <!-- Simple CSS base -->
    <link rel="stylesheet" href="https://cdn.simplecss.org/simple.css" />

    <!-- Arabic fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap"
      rel="stylesheet"
    />

    <!-- Code highlighting -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
    />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script>hljs.highlightAll();</script>

    <style>
      @font-face {
        font-family: 'Graphik Arabic';
        src: url('https://raw.githubusercontent.com/benotsman-youssuf/quranJson/main/Graphik%20Arabic%20SemiBold.ttf') format('truetype');
        font-weight: 600;
        font-style: normal;
      }
      @font-face {
        font-family: 'Samim';
        src: url('https://raw.githubusercontent.com/benotsman-youssuf/quranJson/main/Samim.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }

      body {
        font-family: 'Samim', sans-serif;
        direction: rtl;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Graphik Arabic', sans-serif;
      }
      p {
        font-family: 'Samim', sans-serif;
      }
      ul, ol {
        direction: rtl;
      }
      pre {
        overflow: visible !important;
        white-space: pre-wrap;
        word-wrap: break-word;
        direction: ltr;
      }
      pre code {
        background: none !important;
        padding: 0;
        margin: 0;
        display: block;
        direction: ltr;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        table-layout: auto;
        margin: 1em 0;
        background: transparent;
        display: table;
      }
      table th,
      table td {
        border: none;
        padding: 8px 12px;
        text-align: right;
        vertical-align: middle;
      }
      img {
        display: block;
        max-width: 100%;
        height: auto;
        margin-left: auto;
        margin-right: auto;
      }
    </style>
  </head>
  <body>
    ${editor.getHTML()}
  </body>
</html>`;
}
