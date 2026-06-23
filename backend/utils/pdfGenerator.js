// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

/**
 * Generate a beautiful, styled PDF for redeemed vouchers in memory as a Buffer stream
 */
async function generateRedemptionPDF(redemptionData) {
  return new Promise(async (resolve, reject) => {
    try {
      const { userName, items } = redemptionData;
      const generatedCodes = [];
     
      const masterFileId = uuidv4().toUpperCase().slice(0, 6);
      const filename = `VOUCHER_${masterFileId}_${Date.now()}.pdf`;
      
      // Create PDF document (wiping default margins so we can draw full-width headers)
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0 
      });
      
      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve({ pdfBuffer, generatedCodes, filename });
      });

      let isFirstPage = true;
      
      // 🎨 BRANDING BRAND SETUP: Define your primary design accent theme color here
      const THEME_COLOR = '#1e3a8a'; // Premium Deep Indigo/Navy Blue

      for (const item of items) {
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i++) {
          const itemVoucherCode = uuidv4().toUpperCase().slice(0, 8);
          generatedCodes.push(itemVoucherCode);

          if (isFirstPage) {
            isFirstPage = false;
          } else {
            doc.addPage({ margin: 0 });
          }
          
          const title = item.voucher?.title || 'Unknown Voucher';
          const catName = item.voucher?.category_id?.name || 'General';
          const cost = item.voucher?.points || 0;

          // =========================================================================
          // 🏙️ SECTION 1: FULL-WIDTH TOP HEADER HERO BANNER
          // =========================================================================
          doc.rect(0, 0, doc.page.width, 140).fill(THEME_COLOR);

          // Render Text Elements directly centered onto the colored block fill layer
          doc.fillColor('#ffffff'); // Set text ink color to white
          doc.fontSize(28).font('Helvetica-Bold').text('CARTER REDEEM', 0, 45, { align: 'center' });
          doc.fontSize(12).font('Helvetica').text('Loyalty Voucher — Official Redemption Pass', 0, 85, { align: 'center' });
    
          // =========================================================================
          // 📋 SECTION 2: REDEMPTION TRANSACTION SPEC DETAILS TABLE
          // =========================================================================
          doc.fillColor('#1f2937'); // Set text ink color back to deep dark gray
          doc.fontSize(16).font('Helvetica-Bold').text('Voucher Redemption Breakdown', 50, 180);
          
          // Gray layout row card block line
          doc.moveTo(50, 205).lineTo(545, 205).lineWidth(1).strokeColor('#e5e7eb').stroke();

          // Data Fields Layout Grid
          let textY = 225;
          const drawDataRow = (label, val) => {
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#6b7280').text(label, 60, textY);
            doc.font('Helvetica-Bold').fillColor('#1f2937').text(val, 200, textY, { align: 'right', width: 335 });
            textY += 28;
          };

          drawDataRow('Customer Name', userName);
          drawDataRow('Reward Title', title);
          drawDataRow('Category Log', catName);
          drawDataRow('Quantity Count', `1 of ${qty}`);
          drawDataRow('Points Exchanged', `${cost.toLocaleString()} pts`);
          drawDataRow('Generation Timestamp', new Date().toLocaleString());

          // Bottom divider line for table container block rules
          doc.moveTo(50, textY + 5).lineTo(545, textY + 5).strokeColor('#e5e7eb').stroke();
    
          // =========================================================================
          // 🎫 SECTION 3: THE PASS BADGE TICKET SECTION
          // =========================================================================
          const badgeY = textY + 40;
          const badgeHeight = 130;
          const badgeWidth = 495;

          // Draw the rounded container ticket voucher pass card box frame block background
          doc.roundedRect(50, badgeY, badgeWidth, badgeHeight, 12).fill(THEME_COLOR);

          // Render inner text labels on left quadrant half zone
          doc.fillColor('#ffffff');
          doc.fontSize(10).font('Helvetica').text('REDEMPTION PASS VERIFICATION CODE', 75, badgeY + 25);
          doc.fontSize(24).font('Courier-Bold').text(itemVoucherCode, 75, badgeY + 45);
          
          doc.fontSize(9).font('Helvetica').text('Present this digital coupon pass ticket code to a cashier merchant agent.', 75, badgeY + 85);
          doc.text('Valid for single application use only context layers.', 75, badgeY + 98);

          // Generate high-res image block asset buffer string from engine configuration hooks
          const qrDataUrl = await QRCode.toDataURL(itemVoucherCode, { 
            width: 110, 
            margin: 1,
            color: {
              dark: THEME_COLOR, // Makes the QR code pixels match your theme color!
              light: '#ffffff'
            }
          });
          
          // Render white safety box frame inside ticket canvas for scanner readability contrast
          doc.roundedRect(420, badgeY + 10, 110, 110, 6).fill('#ffffff');
          // Overlay QR code straight on top
          doc.image(qrDataUrl, 420, badgeY + 10, { width: 110 });

          // =========================================================================
          // ⚖️ SECTION 4: FOOTER TERMS & CONDITIONS RULES
          // =========================================================================
          doc.fillColor('#9ca3af');
          doc.fontSize(8).font('Helvetica').text('TERMS OF SERVICE LIABILITY DISCLOSURE', 0, badgeY + badgeHeight + 50, { align: 'center' });
          doc.text('This digital certificate represents a points exchange asset transaction event log record history tracker stack layer component. Non-transferable. Not exchangeable or refundable for cash currency notes.', 50, badgeY + badgeHeight + 65, { align: 'center', width: 495, lineGap: 2 });
        }
      }

      doc.end();
 
    } catch (error) {
      reject(error);
    }
  });
}
 
module.exports = { generateRedemptionPDF };