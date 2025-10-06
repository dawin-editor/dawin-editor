import { Editor } from "@tiptap/react";

export const ExportToPDF = (editor: Editor, documentTitle: string) => {
    const html = editor?.getHTML() || "";
    const editorEl = document.querySelector(
      ".tiptap.ProseMirror.simple-editor"
    );
    if (!editorEl || !html) return;

    // Open new window
    const printWindow = window.open();
    if (printWindow) {
      printWindow.document.body.innerHTML = (`
        <html>
          <head>
            <title>${documentTitle}</title>
            <style>
            @font-face {
      font-family: 'Samim';
      src: url('https://raw.githubusercontent.com/benotsman-youssuf/quranJson/main/Samim.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
              body {
                direction: rtl;
                text-align: right;
                font-family: 'Arial', sans-serif;
              }
              ul, ol {
                direction: rtl;
                text-align: right;
                padding-right: 20px; /* optional spacing for bullets/numbers */
              }
                 h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      font-family: var(--font-samim), sans-serif;
      color: #0f599e;
      margin-block: 1.4rem 0.7rem;
      line-height: 1.35;
    }

    h1 {
      font-size: 2.25rem;
    }
    h2 {
      font-size: 1.6rem;
    }
    h3 {
      font-size: 1.35rem;
    }
    h4 {
      font-size: 1.2rem;
    }
    h5 {
      font-size: 1.05rem;
    }
    h6 {
      font-size: 0.95rem;
    }

    p {
      margin-block: 0.75rem;
    }

    a {
      color: #0f599e;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.9rem;
  margin: 1em 0;
  background: transparent;
}
 table th,
 table td {
  border: none;
  border-bottom: 1px solid #e5e7eb;
  padding: 8px 12px;
  text-align: right;
  position: relative;
}
 table th { font-weight: 600; color: #374151; }
 table td { color: #6b7280; }
 table tr:last-child th,
 table tr:last-child td { border-bottom: none; }
 table td:hover,
 table th:hover { background-color: #f9fafb; }


    blockquote {
      border-inline-start: 3px solid #618ee7; /* RTL/LTR friendly */
      background: rgb(223, 224, 226);
      color: #5a5a5a;
      padding-top: 10;
      padding-bottom: 10;
      padding-right: 10px;

      // padding: 0.85rem 0.5rem;
      // margin-block: 1rem;
    }
    blockquote::before {
      display: none;
    }

    ul,
    ol {
      padding-inline: 1.25rem;
      margin-block: 0.75rem;
      direction: rtl;
    }
    

    li {
      margin-block: 0.35rem;
    }

    /* Gray bullets and numbers for lists */
    

    code:not(pre code) {
      background: rgba(15, 89, 158, 0.08);
      color: #0f3b63;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
        "Liberation Mono", "Courier New", monospace;
      font-size: 0.92em;
    }

    pre code {
      display: block;
      background: #0b1220;
      color: #e6edf3;
      padding: 1rem 1.1rem;
      border-radius: 8px;
      overflow-x: auto;
    }

    img {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 1rem auto;
      border-radius: 8px;
    }

    hr {
      border: 0;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(15, 89, 158, 0.4),
        transparent
      );
      margin-block: 1.5rem;
    }

            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `);
      printWindow.document.close(); // ensure the content is rendered
      printWindow.print();
    }
  };

export default ExportToPDF;
