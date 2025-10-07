import { Editor } from "@tiptap/react";

export const ExportToPDF = (editor: Editor, documentTitle: string) => {
  const html = editor?.getHTML() || "";
  const editorEl = document.querySelector(".tiptap.ProseMirror.simple-editor");
  if (!editorEl || !html) return;

  // Open new window
  const printWindow = window.open();
  if (printWindow) {
    printWindow.document.body.innerHTML = `
        <html>
          <head>
            <title>${documentTitle}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/holiday.css@0.11.2" />

            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            
           <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Naskh+Arabic:wght@400..700&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet">

            <style>
            body {
              font-family: 'Tajawal', sans-serif;
            }
            ul,
            ol {
              direction: rtl;
            }
            img {
              max-width: 300px;
              align-self: center;
            }
            table {
              margin: 1rem 0;
              border-collapse: collapse;
              width: auto !important;
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
            </style>
          </head>
          <body data-theme="light">
            ${html}
          </body>
        </html>
      `;
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
};

export default ExportToPDF;
