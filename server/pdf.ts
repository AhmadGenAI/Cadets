import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import type { McqQuestion } from "@shared/schema";

const WATERMARK_PATH = path.join(process.cwd(), "client/public/images/watermark.jpg");
const URDU_FONT_PATH = path.join(process.cwd(), "server/fonts/JameelNooriNastaleeq.ttf");

const URDU_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

function hasUrdu(text: string): boolean {
  return URDU_REGEX.test(text);
}

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

    const urduAvailable = fs.existsSync(URDU_FONT_PATH);
    if (urduAvailable) {
      doc.registerFont("Urdu", URDU_FONT_PATH);
    }

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - 100;

    const setFont = (text: string, style: "normal" | "bold" = "normal") => {
      if (urduAvailable && hasUrdu(text)) {
        doc.font("Urdu");
      } else {
        doc.font(style === "bold" ? "Helvetica-Bold" : "Helvetica");
      }
    };

    const getTextFeatures = (text: string) => {
      const isUrdu = urduAvailable && hasUrdu(text);
      return {
        isUrdu,
        align: isUrdu ? "right" as const : "left" as const,
        fontSize: isUrdu ? 12 : 10,
        optionFontSize: isUrdu ? 11 : 9.5,
      };
    };

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
      doc.fontSize(8).fillColor("#888888").font("Helvetica");
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
      doc.text("Cadet Colleges Test Preparation Portal", 110, 38, { width: contentWidth - 60 });
      doc.fontSize(9).fillColor("#666666").font("Helvetica");
      doc.text("Enter to Learn, Leave to Lead", 110, 58, { width: contentWidth - 60 });
      doc.restore();

      doc.moveTo(50, 88).lineTo(pageWidth - 50, 88).strokeColor("#1a7a3a").lineWidth(1.5).stroke();
    };

    addWatermark();
    addHeader();

    doc.moveDown(1);
    doc.y = 100;

    setFont(title, "bold");
    doc.fontSize(14).fillColor("#111111");
    doc.text(title, 50, doc.y, { align: "center", width: contentWidth });
    doc.moveDown(0.3);

    if (studentName) {
      setFont(studentName);
      doc.fontSize(10).fillColor("#555555");
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

      const tf = getTextFeatures(mcq.questionText);

      doc.fontSize(tf.fontSize).fillColor("#1a7a3a").font("Helvetica-Bold");
      doc.text(`Q${idx + 1}. `, 50, doc.y, { continued: !tf.isUrdu, width: contentWidth });

      if (tf.isUrdu) {
        setFont(mcq.questionText);
        doc.fontSize(tf.fontSize).fillColor("#111111");
        doc.text(mcq.questionText, 50, doc.y, { align: "right", width: contentWidth, features: ["rtla", "rlig"] });
      } else {
        doc.fillColor("#111111").font("Helvetica");
        doc.text(mcq.questionText, { width: contentWidth - 30 });
      }
      doc.moveDown(0.4);

      const options = mcq.optionsJson as Record<string, string>;
      if (options) {
        const optLabels = ["A", "B", "C", "D"];
        const keys = Object.keys(options);
        keys.forEach((key, i) => {
          const optText = options[key];
          const label = optLabels[i] || key.toUpperCase();
          const optFeatures = getTextFeatures(optText);

          if (optFeatures.isUrdu) {
            doc.fontSize(optFeatures.optionFontSize).fillColor("#333333").font("Helvetica");
            doc.text(`${label})  `, 60, doc.y, { continued: true, width: contentWidth - 30 });
            setFont(optText);
            doc.fontSize(optFeatures.optionFontSize);
            doc.text(optText, { features: ["rtla", "rlig"] });
          } else {
            doc.fontSize(optFeatures.optionFontSize).fillColor("#333333").font("Helvetica");
            doc.text(`     ${label})  ${optText}`, 60, doc.y, { width: contentWidth - 30 });
          }
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
