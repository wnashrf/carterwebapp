// utils/pdfGenerator.js
 
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
 
/**
 * Generate PDF for redeemed voucher
 *
 * @param {Object} redemptionData - { userName, voucherTitle, points, category }
 * @returns {Promise<string>} - PDF filename
 */
async function generateRedemptionPDF(redemptionData) {
  return new Promise((resolve, reject) => {
    try {
      const { userName, items, totalPoints } = redemptionData;
      const generatedCodes = [];
     
      // Create filename
      const masterFileId = uuidv4().toUpperCase().slice(0, 6);
      const filename = `VOUCHER_${masterFileId}_${Date.now()}.pdf`;
      const filepath = path.join(process.env.VOUCHER_PDF_PATH || './vouchers/', filename);
      
      // Ensure vouchers directory exists
      if (!fs.existsSync(path.dirname(filepath))) {
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
      }
      
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });
      
      // Write to file
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      
      let isFirstPage = true;

      items.forEach((item, index) => {
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i++) {
          const itemVoucherCode = uuidv4().toUpperCase().slice(0,8);
          generatedCodes.push(itemVoucherCode);

          if (isFirstPage) {
            isFirstPage = false;
          } else {
            doc.addPage();
          }
          
          const title = item.voucher?.title || 'Unknown Voucher';
          const catName = item.voucher?.category_id?.name || 'General';
          const cost = item.voucher?.points || 0;

          // Add content
          doc.fontSize(24).font('Helvetica-Bold').text('CARTER BANK', { align: 'center' });
          doc.fontSize(14).text('Loyalty Program', { align: 'center' });
          doc.moveDown(0.5);
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Divider line
    
          doc.moveDown(1);
          doc.fontSize(18).font('Helvetica-Bold').text('VOUCHER REDEEMED', { align: 'center' });
          doc.moveDown(1);
    
          // Redemption details
          doc.fontSize(12).font('Helvetica');
          doc.text(`Customer: ${userName}`, { width: 400 });
          doc.text(`Voucher: ${title}`, {width: 400});
          doc.text(`Category: ${catName}`, {width: 400});
          doc.text(`Quantity: 1 of ${qty}`, {width: 400});
          doc.text(`Points Spent: ${cost.toLocaleString()} pts`, {width: 400});
          doc.text(`Date: ${new Date().toLocaleString()}`, { width: 400 });
          doc.moveDown(1);
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    
          // Redemption code (big and prominent)
          doc.moveDown(1);
          doc.fontSize(20).font('Helvetica-Bold').text('REDEMPTION CODE', { align: 'center' });
          doc.moveDown(0.5);
          doc.fontSize(28).font('Courier-Bold').text(itemVoucherCode, { align: 'center', lineGap: 10 });
          doc.moveDown(0.5);
          doc.fontSize(10).font('Helvetica').text('Present this code at the counter', { align: 'center' });
          doc.moveDown(1.5);
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Divider line
    
          // Terms
          doc.moveDown(0.5);
          doc.fontSize(9).font('Helvetica').text('Valid for single use only. Non-transferable. Not redeemable for cash.', { align: 'center', width: 400 });
        }
      });

      // Finalize PDF
      doc.end();
 
      // Resolve when stream finishes
      stream.on('finish', () => {
        resolve({ filename, generatedCodes, filepath }); 
      });
 
      stream.on('error', (err) => {
        reject(err);
      });
 
    } catch (error) {
      reject(error);
    }
  });
}
 
module.exports = { generateRedemptionPDF };