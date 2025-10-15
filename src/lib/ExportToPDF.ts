import { Editor } from "@tiptap/react";
import printJS from "print-js";

export const ExportToPDF = (editor: Editor | null, documentTitle: string) => {
  if (!editor) return;

  const html = editor.getHTML();
  if (!html) return;

  printJS({
    printable: html,
    type: "raw-html",
    documentTitle,
    scanStyles: false,
    showModal: true,
    modalMessage: 'جاري إعداد التدوينة للطباعة',   
    css: [
      // Arabic fonts
      "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400..700&family=Tajawal:wght@300;400;500;700;900&display=swap",
      "https://cdn.jsdelivr.net/npm/holiday.css@0.11.2",
    ],
    style: `
      @page {
        size: A4;
        margin: 1cm 1cm;
      }
      body {
        font-family: 'Tajawal', sans-serif;
      }
      ul,
      ol {
        direction: rtl;
      }
     img {
        display: block;
        max-width: fit-content;
        height: auto;
        margin-left: auto;
        margin-right: auto;
      }
      blockquote {
        border-inline-end: 3px solid #618ee7; /* RTL/LTR friendly */
        border-inline-start: none;
        background: rgb(243, 244, 246);
        color: #5a5a5a;
        padding-top: 20;
        padding-bottom: 20;
        padding-right: 10px;
      }

      /* Center tables on the page, keep them responsive */
      table {
        border-collapse: collapse;
        width: 90%;            /* size to content */
        table-layout: auto;    /* natural column sizing */
        margin: 1em 0;      /* center horizontally */
        background: transparent;
        display: table;        /* ensure it's treated like a table */
      }

      table th,
      table td {
        border: none;
        border-bottom: 1px solid #e5e7eb;
        padding: 8px 12px;
        text-align: right;     /* keep RTL cell alignment */
        vertical-align: middle;
      }

      table th {
        font-weight: 600;
        color: #374151;
      }
      table td {
        color: #6b7280;
      }

      /* Remove bottom border on last row */
      table tr:last-child th,
      table tr:last-child td {
        border-bottom: none;
      }

      /* Make sure images inside tables scale down */
      table img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 auto;
      }
    `,
  });
};

export default ExportToPDF;
