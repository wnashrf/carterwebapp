import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'qrcode';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { getCart, addToCart, updateCartQuantity, deleteFromCart, redeemCart } from '../api/cart';
import './Home.css';

const navItems = [
  { label: 'Explore', path: '/home' },
  { label: 'Categories', path: '/categories/all' },
  { label: 'Wallet', path: '/wallet' }
];
const profileImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBSuIxUxfHg4wgNs3r-LO4qo6VNboOmg9Kb3aXO51jImuiyOFvXuTrd1wLc7zuGzCYjXZ5uW-DcC-AM0Dx6_HcT74tKyPAwBRGp9jf4ENR6pu1lD2E_6w-CWtUcsf33qMmCjPjGRar-Zs9Ux64NQXcqqYWPA6KLkOYxYtkNHGbhGV1nufUeRWL1bJjpYyc06lh1E3ZH_apHor12onMvLgo1q_GTHEL_AAjC1AMDXJ4yvYmKVbneaw-U35QqqQp0k0tHC7X_odbbPf5';

const downloadPdfFromBase64 = (base64String, fileName) => {
  try {
    // Convert base64 string back to binary raw data bytes
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    // Package bytes into a secure application/pdf browser file stream blob
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    
    // Create an internal local download instance link
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = fileName || 'voucher.pdf';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up memory allocations right after download trigger completion
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Blob download conversion breakdown:", error);
  }
};

function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [redemptionCode, setRedemptionCode] = useState('');
  const [pdfFilename, setPdfFilename] = useState('');
  const [savedPdfFile, setSavedPdfFile] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const addedRef = useRef(false);

  useEffect(() => {
    let active = true;
    async function initCart() {
      try {
        const incoming = location.state?.voucher;
        if (incoming && !addedRef.current) {
          addedRef.current = true;
          window.history.replaceState({}, document.title);
          await addToCart(incoming._id, 1);
        }
        const data = await getCart();
        if (!active) return;
        const mapped = data.map(item => ({
          id: item._id,
          voucherId: item.voucher._id,
          title: item.voucher.title,
          subtitle: item.voucher.category_id?.name || 'General',
          price: Number(item.voucher.points) || 0,
          qty: item.quantity,
          image: item.voucher.image || '',
          unit: 'pts'
        }));
        setItems(mapped);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load cart');
      } finally {
        if (active) setLoading(false);
      }
    }
    initCart();
    return () => { active = false; };
  }, [location.state]);

  const updateQty = async (id, delta) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.qty + delta);
    try {
      await updateCartQuantity(id, newQty);
      setItems(prev =>
        prev.map(i => (i.id === id ? { ...i, qty: newQty } : i))
      );
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to update quantity.', life: 3000 });
    }
  };

  const removeItem = async (id) => {
    try {
      await deleteFromCart(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.current.show({ severity: 'success', summary: 'Removed', detail: 'Item removed from cart.', life: 3000 });
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to remove item.', life: 3000 });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal;
  const fmt = (n) => `${n.toLocaleString()} pts`;

  const placeOrder = async () => {
    setProcessing(true);
    try {
      const response = await redeemCart();
      console.log("Raw API response:", response);
      setProcessing(false);

      const data = response?.data || response;
      console.log("Frontend received parsed data object:", data);

      const responseData = response?.data?.data || response?.data || response;
      
      // Ensure a valid redemption code is always available for download attempt
      if (responseData && responseData.redemptionCode) {
        setRedemptionCode(responseData.redemptionCode);
        setPdfFilename(responseData.fileName);
        
        if (responseData.pdfFile) {
          setSavedPdfFile(responseData.pdfFile); // 🔌 This will enable the button!
          downloadPdfFromBase64(responseData.pdfFile, responseData.fileName || 'voucher.pdf');
        }
      } else {
        setRedemptionCode('UNKNOWN-ERR');
        setPdfFilename('');
      }

      setOrderSuccess(true);
      setDialogVisible(true);
      setItems([]); // emptied frontend cart state
    } catch (err) {
      console.error("API Error block caught:", err);
      setProcessing(false);
      setOrderSuccess(false);
      setError(err.message || 'We couldn\'t process your request.')
      setDialogVisible(true);
    }
  };

  const successDialogFooter = (
    <div className="flex flex-column gap-2 w-full">
      <Button
        label="Download Voucher PDF Again" // 📝 Contextually correct text updates
        icon="pi pi-download"
        className="w-full"
        disabled={!savedPdfFile}
        onClick={() => {
          if (savedPdfFile) {
            downloadPdfFromBase64(savedPdfFile, pdfFilename || 'voucher.pdf');
          }
        }} 
      />
      <Button
        label="Back to Home"
        icon="pi pi-home"
        outlined
        className="w-full"
        onClick={() => { setDialogVisible(false); navigate('/home'); }}
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
            <span className="home-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>
              <i className="pi pi-ticket mr-2" />
              VouchWise Redeem
            </span>
            <nav className="home-nav hidden lg:flex gap-3">
              {navItems.map((item, index) => (
                <a 
                  key={item.label} 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                  }}
                  className="home-nav__link"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex align-items-center gap-3">
            <Button icon="pi pi-shopping-cart" rounded text severity="secondary" onClick={() => navigate('/cart')}>
              <Badge value={items.length} severity="danger" className="home-cart-badge" />
            </Button>
            <Avatar 
              image={profileImage} 
              shape="circle" 
              size="large" 
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/profile')} 
            />
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
                  <Button label="Browse Vouchers" icon="pi pi-arrow-left" text className="mt-3" onClick={() => navigate('/home')} />
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
                onClick={() => navigate('/home')}
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
              Your voucher code <strong className="font-mono">{redemptionCode}</strong> is ready for use.
              Click the button if the download have not started.
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
              {error || "We couldn't process your request. The payment authorization was declined."}
            </p>
          </>
        )}
      </Dialog>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer__inner grid">
          <div className="col-12 md:col-5">
            <span className="home-brand">
              <i className="pi pi-ticket mr-2" />
              VouchWise Redeem
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
          Copyright 2026 VouchWise Redeem Web App Voucher Management.
        </div>
      </footer>
    </div>
  );
}

export default Cart;
