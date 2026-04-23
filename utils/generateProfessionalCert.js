const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

/**
 * 🎓 BR30 TRADER - ULTIMATE MSME CERTIFICATE GENERATOR (BUFFER READY)
 */
const generateProfessionalCert = async (user, fullName, certId, courseName) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 📂 1. Certificates folder setup (Local backup ke liye)
      const certFolder = path.join(process.cwd(), "certificates");
      if (!fs.existsSync(certFolder))
        fs.mkdirSync(certFolder, { recursive: true });

      const fileName = `${certId}.pdf`;
      const filePath = path.join(certFolder, fileName);

      // 📱 2. QR Link for Verification
      const frontendBase =
        process.env.FRONTEND_URL || "https://my-frontend-eight-roan.vercel.app";
      const qrData = `${frontendBase}/verify.html?id=${certId}`;
      const qrImage = await QRCode.toDataURL(qrData);

      // 📄 3. PDF Setup
      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margin: 0,
      });

      // 🛠️ BUFFER LOGIC: Data collect karne ke liye
      let buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));

      // File system me bhi save hoga (aapke purane record ke liye)
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      const gold = "#D4AF37";

      // 🎨 --- START DESIGN (NO CHANGES) ---
      doc.rect(20, 20, 802, 555).lineWidth(12).stroke(gold);
      doc.rect(45, 45, 752, 505).lineWidth(2).stroke("#1a1a1a");

      doc
        .fontSize(10)
        .fillColor("#1a1a1a")
        .font("Helvetica-Bold")
        .text("BR30 TRADER ACADEMY | TRUSTED EDUCATION", 0, 65, {
          align: "center",
        });

      doc.fontSize(11).text("MSME REGISTERED ACADEMY ✓", 550, 95, {
        align: "right",
        width: 220,
      });
      doc
        .fontSize(10)
        .fillColor(gold)
        .text(`CERTIFICATE NO: ${certId}`, 550, 110, {
          align: "right",
          width: 220,
        });
      doc
        .fontSize(8)
        .fillColor("#64748b")
        .text("UDYAM-BR-34-0058103", 550, 125, { align: "right", width: 220 });

      doc
        .fillColor("#1a1a1a")
        .font("Helvetica-Bold")
        .fontSize(42)
        .text("CERTIFICATE OF COMPLETION", 0, 160, { align: "center" });

      doc
        .fontSize(18)
        .font("Helvetica")
        .fillColor("#64748b")
        .text("This certificate is proudly presented to", 0, 210, {
          align: "center",
        });

      doc
        .fontSize(55)
        .fillColor(gold)
        .font("Helvetica")
        .text(fullName.toUpperCase(), 0, 255, { align: "center" });

      doc
        .fontSize(16)
        .fillColor("#64748b")
        .font("Helvetica")
        .text(
          "For successfully completing the professional masterclass",
          0,
          345,
          { align: "center" },
        );

      doc
        .fontSize(24)
        .fillColor("#1a1a1a")
        .font("Helvetica-Bold")
        .text(courseName.toUpperCase(), 0, 380, { align: "center" });

      const footerY = 485;
      doc.image(qrImage, 385, 445, { width: 75 });
      doc
        .fontSize(8)
        .fillColor("#94a3b8")
        .text("SCAN TO VERIFY ", 0, 525, { align: "center" });

      doc
        .fontSize(10)
        .fillColor("#1a1a1a")
        .font("Helvetica-Bold")
        .text("OFFICE ADDRESS", 100, footerY);
      doc
        .fontSize(9)
        .font("Helvetica")
        .text("Sitamarhi Bihar, 843302", 100, footerY + 15);
      doc
        .fontSize(12)
        .fillColor("#1a1a1a")
        .text(
          `DATE: ${new Date().toLocaleDateString("en-IN")}`,
          100,
          footerY + 40,
        );

      doc
        .fontSize(14)
        .fillColor("#1a1a1a")
        .font("Helvetica-Bold")
        .text("INSTRUCTOR", 550, footerY + 15, { align: "right", width: 180 });
      doc
        .fontSize(22)
        .fillColor(gold)
        .font("Helvetica-Bold")
        .text("MUKESH RAJ.", 550, footerY + 35, { align: "right", width: 180 });
      // 🎨 --- END DESIGN ---

      doc.end();

      // 🚀 FINAL STEP: Buffer return karo taaki Cloudinary chal sake
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        console.log("✅ PDF Buffer Created Successfully");
        resolve(pdfBuffer); // 👈 Ye Controller ko asli data bhejega
      });
    } catch (err) {
      console.error("❌ PDF Generation Error:", err);
      reject(err);
    }
  });
};

// Fixed Export (Taaki destructuring me error na aaye)
module.exports = generateProfessionalCert;
