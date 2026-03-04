import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import type { McqQuestion } from "@shared/schema";

const WATERMARK_PATH = path.join(process.cwd(), "client/public/images/watermark.jpg");

export function generateMcqPdf(
  mcqs: McqQuestion[],
  title: string,
  studentName?: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - 100;

    const addWatermark = () => {
      if (fs.existsSync(WATERMARK_PATH)) {
        doc.save();
        doc.opacity(0.08);
        const wmSize = 300;
        doc.image(WATERMARK_PATH, (pageWidth - wmSize) / 2, (pageHeight - wmSize) / 2, {
          width: wmSize,
          height: wmSize,
        });
        doc.restore();
      }
    };

    const addFooter = () => {
      doc.save();
      doc.fontSize(8).fillColor("#888888");
      doc.text("www.pakshaheens.com", 50, pageHeight - 40, { align: "center", width: contentWidth });
      doc.text("WhatsApp: +923348480890", 50, pageHeight - 28, { align: "center", width: contentWidth });
      doc.restore();
    };

    const addHeader = () => {
      if (fs.existsSync(WATERMARK_PATH)) {
        doc.image(WATERMARK_PATH, 50, 30, { width: 50, height: 50 });
      }

      doc.save();
      doc.fontSize(16).fillColor("#1a7a3a").font("Helvetica-Bold");
      doc.text("Shaheen Forces Academy", 110, 38, { width: contentWidth - 60 });
      doc.fontSize(9).fillColor("#666666").font("Helvetica");
      doc.text("Enter to Learn, Leave to Lead", 110, 58, { width: contentWidth - 60 });
      doc.restore();

      doc.moveTo(50, 88).lineTo(pageWidth - 50, 88).strokeColor("#1a7a3a").lineWidth(1.5).stroke();
    };

    addWatermark();
    addHeader();

    doc.moveDown(1);
    doc.y = 100;

    doc.fontSize(14).fillColor("#111111").font("Helvetica-Bold");
    doc.text(title, 50, doc.y, { align: "center", width: contentWidth });
    doc.moveDown(0.3);

    if (studentName) {
      doc.fontSize(10).fillColor("#555555").font("Helvetica");
      doc.text(`Student: ${studentName}`, 50, doc.y, { align: "center", width: contentWidth });
      doc.moveDown(0.3);
    }

    doc.fontSize(9).fillColor("#888888").font("Helvetica");
    doc.text(`Generated: ${new Date().toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}`, 50, doc.y, { align: "center", width: contentWidth });
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).strokeColor("#dddddd").lineWidth(0.5).stroke();
    doc.moveDown(0.8);

    mcqs.forEach((mcq, idx) => {
      if (doc.y > pageHeight - 150) {
        addFooter();
        doc.addPage();
        addWatermark();
        addHeader();
        doc.y = 100;
      }

      doc.fontSize(10).fillColor("#1a7a3a").font("Helvetica-Bold");
      doc.text(`Q${idx + 1}.`, 50, doc.y, { continued: true, width: contentWidth });
      doc.fillColor("#111111").font("Helvetica");
      doc.text(` ${mcq.questionText}`, { width: contentWidth - 30 });
      doc.moveDown(0.4);

      const options = mcq.optionsJson as Record<string, string>;
      if (options) {
        const optLabels = ["A", "B", "C", "D"];
        const keys = Object.keys(options);
        keys.forEach((key, i) => {
          doc.fontSize(9.5).fillColor("#333333").font("Helvetica");
          const label = optLabels[i] || key.toUpperCase();
          doc.text(`     ${label})  ${options[key]}`, 60, doc.y, { width: contentWidth - 30 });
          doc.moveDown(0.15);
        });
      }

      doc.moveDown(0.6);
      doc.moveTo(70, doc.y).lineTo(pageWidth - 70, doc.y).strokeColor("#eeeeee").lineWidth(0.3).stroke();
      doc.moveDown(0.6);
    });

    if (doc.y > pageHeight - 200) {
      addFooter();
      doc.addPage();
      addWatermark();
      addHeader();
      doc.y = 100;
    }

    doc.moveDown(1);
    doc.fontSize(12).fillColor("#1a7a3a").font("Helvetica-Bold");
    doc.text("Answer Key", 50, doc.y, { width: contentWidth });
    doc.moveDown(0.5);

    doc.moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).strokeColor("#1a7a3a").lineWidth(0.5).stroke();
    doc.moveDown(0.5);

    const answersPerRow = 5;
    mcqs.forEach((mcq, idx) => {
      const optLabels = ["A", "B", "C", "D"];
      const keys = Object.keys(mcq.optionsJson as Record<string, string>);
      const correctIdx = keys.indexOf(mcq.correctOption);
      const correctLabel = optLabels[correctIdx] || mcq.correctOption.toUpperCase();

      doc.fontSize(9).fillColor("#333333").font("Helvetica");
      const text = `Q${idx + 1}: ${correctLabel}`;
      const col = idx % answersPerRow;
      const x = 60 + col * 95;

      if (col === 0 && idx > 0) {
        doc.moveDown(0.3);
      }

      doc.text(text, x, doc.y, { width: 90, continued: col < answersPerRow - 1 && idx < mcqs.length - 1 });
    });

    doc.moveDown(2);
    addFooter();
    doc.end();
  });
}
