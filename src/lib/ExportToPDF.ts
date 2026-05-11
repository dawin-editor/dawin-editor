import { Editor } from "@tiptap/react";
import { isAndroidWebView, androidBridge } from "./androidBridge";
import printJS from "print-js";

const PDF_STYLES = `
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
    border-inline-end: 3px solid #618ee7;
    border-inline-start: none;
    background: rgb(243, 244, 246);
    color: #5a5a5a;
    padding-top: 20;
    padding-bottom: 20;
    padding-right: 10px;
  }
  table {
    border-collapse: collapse;
    width: 90%;
    table-layout: auto;
    margin: 1em 0;
    background: transparent;
    display: table;
  }
  table th,
  table td {
    border: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 8px 12px;
    text-align: right;
    vertical-align: middle;
  }
  table th {
    font-weight: 600;
    color: #374151;
  }
  table td {
    color: #6b7280;
  }
  table tr:last-child th,
  table tr:last-child td {
    border-bottom: none;
  }
  table img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
`;

const PDF_FONTS = `
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400..700&family=Tajawal:wght@300;400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/holiday.css@0.11.2">
`;

export const ExportToPDF = async (editor: Editor) => {
  if (!editor) return;

  const html = editor.getHTML();
  if (!html) return;

  const fullHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8">${PDF_FONTS}<style>${PDF_STYLES}</style></head>
<body>${html}</body>
</html>`;

  if (isAndroidWebView) {
    try {
      await androidBridge.printPdf(fullHtml, "داوين - تدوينة");
    } catch (e) {
      console.error("AndroidBridge printPdf failed:", e);
    }
    return;
  }

  printJS({
    printable: html,
    type: "raw-html",
    scanStyles: false,
    showModal: true,
    modalMessage: "جاري إعداد التدوينة للطباعة",
    css: [
      "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400..700&family=Tajawal:wght@300;400;500;700;900&display=swap",
      "https://cdn.jsdelivr.net/npm/holiday.css@0.11.2",
    ],
    style: PDF_STYLES,
  });
};

export default ExportToPDF;
