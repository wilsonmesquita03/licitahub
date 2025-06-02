"use client";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

export default function PDFPreview({ pdfUrl }: { pdfUrl: string }) {
  if (!pdfUrl) {
    return <p className="text-muted-foreground">Prévia indisponível.</p>;
  }

  return (
    <iframe
      src={pdfUrl}
      className="w-full border rounded aspect-[210/297]"
      title="Prévia do PDF"
    />
  );
}
