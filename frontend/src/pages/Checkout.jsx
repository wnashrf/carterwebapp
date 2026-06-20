import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import './Home.css';

const navItems = ['Explore', 'Deals', 'Rewards', 'Wallet'];
const profileImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBSuIxUxfHg4wgNs3r-LO4qo6VNboOmg9Kb3aXO51jImuiyOFvXuTrd1wLc7zuGzCYjXZ5uW-DcC-AM0Dx6_HcT74tKyPAwBRGp9jf4ENR6pu1lD2E_6w-CWtUcsf33qMmCjPjGRar-Zs9Ux64NQXcqqYWPA6KLkOYxYtkNHGbhGV1nufUeRWL1bJjpYyc06lh1E3ZH_apHor12onMvLgo1q_GTHEL_AAjC1AMDXJ4yvYmKVbneaw-U35QqqQp0k0tHC7X_odbbPf5';

const SERVICE_FEE = 2.5;
const DISCOUNT = 10.0;

const INITIAL_CART = [
  {
    id: 1,
    title: 'Gourmet Dining Experience',
    subtitle: 'Valid at 50+ Premium Locations',
    price: 120.0,
    qty: 1,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCvEQ1T_XV_zTVuMyy7dRYwNDlJ00oDPlaHOAyXUsofF-wz8GDF87gHOdlbqSX0G_1SvBF2o5K0ZG9_5b3O_nU0lA0ZNBq9Cg9ci_dndlkukF4ER4wPHezMOZC2ltFo1ADE3Mg_7zYehHLv4tqp5n8jeVSrrjbWtRBHIj2IE4lzvoIfI4W_QF0NeIai8rPoUsxZMPMh7DFuAfgzclgKDH0Ql7SwRheZ9wNdoQEc9THS1hc-C4Mt8XGPtvje4AL4JJORy078gWMh7D_Y',
  },
  {
    id: 2,
    title: 'Luxury Spa Weekend',
    subtitle: 'Full Body Treatment & Sauna',
    price: 175.0,
    qty: 2,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCC0gfOn50jO9AMV91msX4ouBrpLj2Cuh8lGC48NMTyUDmuofkziKgSMMPd3auH3fxzvOCrexH0sMyFDTi9TM8imw0BnklsvvA5E-g89IbNY3uw35XlP8-2e0CGHshekdVTBlMMfqJrDCtT7vjIrms-A7VBv8CEEOQi_C-28INEq7uOdkXTixc47gA8JbZL8sOz1waMq-hKMpoSXV-fGvsG3ZOQGr0F0HaR1w-D6FKWNbi6j67fnaC48wm80tf8CtqX4HuDc1jNcxkc',
  },
];

function toCartItem(v) {
  return {
    id: v._id || String(Date.now()),
    title: v.title,
    subtitle: v.category_id?.name || 'General',
    price: Number(v.points) || 0,
    qty: 1,
    image: v.image || '',
    unit: 'pts',
  };
}

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useRef(null);
  const [items, setItems] = useState(() => {
    const incoming = location.state?.voucher;
    return incoming ? [toCartItem(incoming)] : INITIAL_CART;
  });
  const [promoCode, setPromoCode] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  const updateQty = (id, delta) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const applyPromo = () => {
    if (!promoCode.trim()) return;
    toast.current.show({ severity: 'info', summary: 'Promo Code', detail: 'Invalid or expired code.', life: 3000 });
  };

  const usePts = items.length > 0 && items.every(i => i.unit === 'pts');
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = usePts ? subtotal : subtotal + SERVICE_FEE - DISCOUNT;
  const fmt = (n) => usePts ? `${n.toLocaleString()} pts` : `$${n.toFixed(2)}`;

  const placeOrder = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setOrderSuccess(true);
      setDialogVisible(true);
    }, 800);
  };

  const downloadPDF = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const code = 'VW-8821-X90';
    const now = new Date().toLocaleString();

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(code, { width: 160, margin: 1, color: { dark: '#0f6b45', light: '#ffffff' } });

    // Header band
    doc.setFillColor(15, 107, 69);
    doc.rect(0, 0, W, 90, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26).setFont('helvetica', 'bold');
    doc.text('CARTER REDEEM', W / 2, 45, { align: 'center' });
    doc.setFontSize(12).setFont('helvetica', 'normal');
    doc.text('Loyalty Voucher — Official Redemption Receipt', W / 2, 68, { align: 'center' });

    // Divider
    doc.setDrawColor(15, 107, 69);
    doc.setLineWidth(2);
    doc.line(40, 110, W - 40, 110);

    // Voucher items
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14).setFont('helvetica', 'bold');
    doc.text('Voucher(s) Redeemed', 40, 140);

    let y = 165;
    items.forEach((item) => {
      doc.setFontSize(11).setFont('helvetica', 'bold');
      doc.text(`• ${item.title}`, 50, y);
      doc.setFont('helvetica', 'normal').setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`  ${item.subtitle}   ×${item.qty}   ${item.unit === 'pts' ? `${(item.price * item.qty).toLocaleString()} pts` : `$${(item.price * item.qty).toFixed(2)}`}`, 50, y + 16);
      doc.setTextColor(30, 30, 30);
      y += 42;
    });

    // Summary box
    y += 10;
    doc.setFillColor(240, 249, 244);
    doc.roundedRect(40, y, W - 80, usePts ? 60 : 90, 6, 6, 'F');
    doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor(80, 80, 80);
    doc.text(`Subtotal:`, 60, y + 22);
    doc.setFont('helvetica', 'bold').setTextColor(30, 30, 30);
    doc.text(fmt(subtotal), W - 60, y + 22, { align: 'right' });
    if (!usePts) {
      doc.setFont('helvetica', 'normal').setTextColor(80, 80, 80);
      doc.text('Service Fee:', 60, y + 42);
      doc.setFont('helvetica', 'bold').setTextColor(30, 30, 30);
      doc.text(fmt(SERVICE_FEE), W - 60, y + 42, { align: 'right' });
      doc.setFont('helvetica', 'normal').setTextColor(22, 163, 74);
      doc.text('Discount:', 60, y + 62);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${fmt(DISCOUNT)}`, W - 60, y + 62, { align: 'right' });
      y += 30;
    }
    doc.setFontSize(13).setFont('helvetica', 'bold').setTextColor(15, 107, 69);
    doc.text('Total:', 60, y + 52);
    doc.text(fmt(total), W - 60, y + 52, { align: 'right' });

    // Redemption code + QR box
    y += usePts ? 90 : 100;
    const boxH = 130;
    const qrSize = 100;
    const qrX = W - 40 - qrSize - 16;
    const qrY = y + (boxH - qrSize) / 2;

    doc.setFillColor(15, 107, 69);
    doc.roundedRect(40, y, W - 80, boxH, 8, 8, 'F');

    // Text side
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11).setFont('helvetica', 'normal');
    doc.text('REDEMPTION CODE', 60, y + 28);
    doc.setFontSize(26).setFont('courier', 'bold');
    doc.text(code, 60, y + 68);
    doc.setFontSize(9).setFont('helvetica', 'normal');
    doc.text('Present this code or scan the QR at the counter', 60, y + 90);
    doc.text('Valid for single use only', 60, y + 106);

    // QR code image (white background card)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 4, 4, 'F');
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Date & terms
    doc.setTextColor(120, 120, 120).setFontSize(9).setFont('helvetica', 'normal');
    doc.text(`Generated: ${now}`, 40, y);
    doc.text('Non-transferable. Not redeemable for cash.', W / 2, y + 16, { align: 'center' });

    doc.save(`CartRedeem_${code}.pdf`);
  };

  const successDialogFooter = (
    <div className="flex flex-column gap-2 w-full">
      <Button label="Download PDF Voucher" icon="pi pi-download" className="w-full" onClick={downloadPDF} />
      <Button
        label="Back to Home"
        icon="pi pi-home"
        outlined
        className="w-full"
        onClick={() => { setDialogVisible(false); navigate('/Home'); }}
      />
    </div>
  );

  const failureDialogFooter = (
    <div className="flex flex-column gap-2 w-full">
      <Button
        label="Retry Payment"
        icon="pi pi-refresh"
        className="w-full"
        onClick={() => { setDialogVisible(false); placeOrder(); }}
      />
      <Button label="Contact Support" text className="w-full" onClick={() => setDialogVisible(false)} />
    </div>
  );

  return (
    <div className="home-shell">
      <Toast ref={toast} />

      {/* Header */}
      <header className="home-topbar">
        <div className="home-topbar__inner">
          <div className="flex align-items-center gap-4">
            <span className="home-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/Home')}>
              <i className="pi pi-ticket mr-2" />
              Carter Redeem
            </span>
            <nav className="home-nav hidden lg:flex gap-3">
              {navItems.map((item, i) => (
                <a key={item} href="/Home" className={`home-nav__link${i === 3 ? ' is-active' : ''}`}>
                  {item}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex align-items-center gap-3">
            <span className="p-input-icon-left hidden md:inline-block">
              <i className="pi pi-search" />
              <InputText placeholder="Search vouchers..." className="home-search" />
            </span>
            <Button icon="pi pi-shopping-cart" rounded text severity="secondary">
              <Badge value={items.length} severity="danger" className="home-cart-badge" />
            </Button>
            <Avatar image={profileImage} shape="circle" size="large" />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className="grid">

          {/* Left column */}
          <div className="col-12 lg:col-8">

            {/* Voucher cart items */}
            <Card className="shadow-1 border-none mb-4">
              <h1 className="text-2xl font-bold mb-4">Voucher Selection</h1>

              {items.length === 0 ? (
                <div className="text-center py-6" style={{ color: '#6c757d' }}>
                  <i className="pi pi-shopping-cart" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }} />
                  <p>Your cart is empty.</p>
                  <Button label="Browse Vouchers" icon="pi pi-arrow-left" text className="mt-3" onClick={() => navigate('/Home')} />
                </div>
              ) : (
                <div className="flex flex-column gap-3">
                  {items.map((item, idx) => (
                    <div key={item.id}>
                      <div className="flex align-items-center gap-3 p-3 border-round-lg" style={{ background: '#f8f9fa' }}>
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: '5rem', height: '5rem', borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <h3 className="font-bold mb-1" style={{ fontSize: '0.95rem' }}>{item.title}</h3>
                          <p className="text-sm mb-3" style={{ color: '#6c757d' }}>{item.subtitle}</p>
                          <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center gap-2 border-1 border-round-3xl px-2 py-1" style={{ borderColor: '#dee2e6' }}>
                              <Button
                                icon="pi pi-minus"
                                rounded
                                text
                                size="small"
                                style={{ width: '1.5rem', height: '1.5rem' }}
                                onClick={() => updateQty(item.id, -1)}
                              />
                              <span className="font-bold px-1">{item.qty}</span>
                              <Button
                                icon="pi pi-plus"
                                rounded
                                text
                                size="small"
                                style={{ width: '1.5rem', height: '1.5rem' }}
                                onClick={() => updateQty(item.id, 1)}
                              />
                            </div>
                            <Button
                              label="Remove"
                              icon="pi pi-trash"
                              text
                              severity="danger"
                              size="small"
                              onClick={() => removeItem(item.id)}
                            />
                          </div>
                        </div>
                        <div className="text-right" style={{ flexShrink: 0 }}>
                          <p className="font-bold text-lg">
                            {item.unit === 'pts'
                              ? `${(item.price * item.qty).toLocaleString()} pts`
                              : `$${(item.price * item.qty).toFixed(2)}`}
                          </p>
                          <p className="text-sm" style={{ color: '#6c757d' }}>
                            {item.unit === 'pts'
                              ? `${item.price.toLocaleString()} pts each`
                              : `$${item.price.toFixed(2)} each`}
                          </p>
                        </div>
                      </div>
                      {idx < items.length - 1 && <Divider className="my-2" />}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Payment details */}
            <Card className="shadow-1 border-none">
              <h2 className="text-xl font-bold mb-4">
                <i className="pi pi-lock mr-2" style={{ color: '#22c55e' }} />
                Secure Payment
              </h2>
              <div className="grid">
                <div className="col-12 md:col-6 field">
                  <label className="font-semibold text-sm block mb-2" style={{ color: '#6c757d' }}>Card Number</label>
                  <span className="p-input-icon-left w-full">
                    <i className="pi pi-credit-card" />
                    <InputText
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="**** **** **** 4242"
                      className="w-full"
                    />
                  </span>
                </div>
                <div className="col-12 md:col-6 field">
                  <label className="font-semibold text-sm block mb-2" style={{ color: '#6c757d' }}>Promo Code</label>
                  <div className="flex gap-2">
                    <InputText
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1"
                    />
                    <Button label="Apply" outlined onClick={applyPromo} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column: order summary */}
          <div className="col-12 lg:col-4">
            <div style={{ position: 'sticky', top: '5rem' }}>
              <Card className="shadow-2 border-none mb-3">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="flex flex-column gap-3">
                  <div className="flex justify-content-between">
                    <span style={{ color: '#6c757d' }}>Subtotal</span>
                    <span className="font-bold">{fmt(subtotal)}</span>
                  </div>
                  {!usePts && (
                    <>
                      <div className="flex justify-content-between">
                        <span style={{ color: '#6c757d' }}>Service Fee</span>
                        <span className="font-bold">{fmt(SERVICE_FEE)}</span>
                      </div>
                      <div className="flex justify-content-between" style={{ color: '#16a34a' }}>
                        <span>Discount</span>
                        <span className="font-bold">-{fmt(DISCOUNT)}</span>
                      </div>
                    </>
                  )}
                </div>

                <Divider />

                <div className="flex justify-content-between align-items-center mb-4">
                  <span className="font-bold text-xl">Total</span>
                  <span className="font-bold text-2xl">{fmt(total)}</span>
                </div>

                <Button
                  label="Place Order"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  className="w-full"
                  loading={processing}
                  disabled={items.length === 0}
                  onClick={placeOrder}
                />

                <div className="flex align-items-center justify-content-center gap-2 mt-3">
                  <i className="pi pi-lock text-sm" style={{ color: '#6c757d' }} />
                  <span className="text-xs" style={{ color: '#6c757d' }}>Encrypted &amp; Secure Transaction</span>
                </div>
              </Card>

              <Button
                label="Continue Shopping"
                icon="pi pi-arrow-left"
                text
                className="w-full"
                onClick={() => navigate('/Home')}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Success / Failure Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        footer={orderSuccess ? successDialogFooter : failureDialogFooter}
        closable={false}
        style={{ width: '32rem' }}
        contentStyle={{ textAlign: 'center', padding: '2rem' }}
      >
        {orderSuccess ? (
          <>
            <div
              className="flex align-items-center justify-content-center border-circle mx-auto mb-4"
              style={{ width: '6rem', height: '6rem', background: '#dcfce7' }}
            >
              <i className="pi pi-check-circle" style={{ fontSize: '3.5rem', color: '#16a34a' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Redemption Successful!</h2>
            <p style={{ color: '#6c757d', lineHeight: 1.6 }}>
              Your voucher code <strong className="font-mono">VW-8821-X90</strong> is ready for use.
              A confirmation email has been sent to you.
            </p>
          </>
        ) : (
          <>
            <div
              className="flex align-items-center justify-content-center border-circle mx-auto mb-4"
              style={{ width: '6rem', height: '6rem', background: '#fee2e2' }}
            >
              <i className="pi pi-times-circle" style={{ fontSize: '3.5rem', color: '#dc2626' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Redemption Failed</h2>
            <p style={{ color: '#6c757d', lineHeight: 1.6 }}>
              We couldn't process your request. The payment authorization was declined.
            </p>
            <div
              className="flex align-items-start gap-3 p-3 border-round-lg text-left mt-3"
              style={{ background: '#fee2e2', border: '1px solid #fca5a5' }}
            >
              <i className="pi pi-info-circle mt-1" style={{ color: '#dc2626' }} />
              <div>
                <p className="font-bold text-sm" style={{ color: '#dc2626' }}>Error Code: ERR_PAY_AUTH_402</p>
                <p className="text-sm" style={{ color: '#6c757d' }}>Insufficient funds or bank rejection.</p>
              </div>
            </div>
          </>
        )}
      </Dialog>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer__inner grid">
          <div className="col-12 md:col-5">
            <span className="home-brand">
              <i className="pi pi-ticket mr-2" />
              Carter Redeem
            </span>
            <p className="mt-2 text-sm opacity-70">
              A modern voucher platform powered by React and MongoDB.
            </p>
          </div>
          <div className="col-6 md:col-2">
            <strong>Company</strong>
            <a href="/">About Us</a>
            <a href="/">Contact Us</a>
          </div>
          <div className="col-6 md:col-2">
            <strong>Support</strong>
            <a href="/">Help Center</a>
            <a href="/">Redemption Guide</a>
          </div>
          <div className="col-6 md:col-3">
            <strong>Legal</strong>
            <a href="/">Privacy Policy</a>
            <a href="/">Terms of Service</a>
          </div>
        </div>
        <div className="home-footer__bottom opacity-50 text-xs">
          Copyright 2026 Carter Redeem Web App Voucher Management.
        </div>
      </footer>
    </div>
  );
}

export default Checkout;
