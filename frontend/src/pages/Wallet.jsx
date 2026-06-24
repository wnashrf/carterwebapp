import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { getCart } from '../api/cart';
import apiClient from '../api/client';
import './Home.css';

const navItems = [
  { label: 'Explore', path: '/home' },
  { label: 'Categories', path: '/categories/all' },
  { label: 'Wallet', path: '/wallet' }
];

const profileImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBSuIxUxfHg4wgNs3r-LO4qo6VNboOmg9Kb3aXO51jImuiyOFvXuTrd1wLc7zuGzCYjXZ5uW-DcC-AM0Dx6_HcT74tKyPAwBRGp9jf4ENR6pu1lD2E_6w-CWtUcsf33qMmCjPjGRar-Zs9Ux64NQXcqqYWPA6KLkOYxYtkNHGbhGV1nufUeRWL1bJjpYyc06lh1E3ZH_apHor12onMvLgo1q_GTHEL_AAjC1AMDXJ4yvYmKVbneaw-U35QqqQp0k0tHC7X_odbbPf5';

function Wallet() {
  const navigate = useNavigate();
  const toast = useRef(null);
  
  const [historyItems, setHistoryItems] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);

  useEffect(() => {
  let active = true;
    async function fetchWalletData() {
      try {
        const userRes = await apiClient.get('/auth/profile');
        const userData = userRes.data;
        
        if (active && userData) {
          const profileUserObj = userData.user || userData; 
          setUserPoints(Number(profileUserObj.points || 0));
        }

        const historyRes = await apiClient.get('/cart/history'); 
        if (active) {
          setHistoryItems(Array.isArray(historyRes.data) ? historyRes.data : []);
        }

        const cartData = await getCart();
        if (active && Array.isArray(cartData)) {
          setCartCount(cartData.length);
        }
      } catch (err) {
        console.error("Wallet loading breakdown:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchWalletData();
    return () => { active = false; };
  }, []);

  const activeVouchers = historyItems.filter(item => !item.isUsed);
  const usedVouchers = historyItems.filter(item => item.isUsed);

  const openVoucherModal = (item) => {
    setActiveVoucher(item);
    setQrVisible(true);
  };

  return (
    <div className="home-shell">
      <Toast ref={toast} />

      {/* ---------- Universal Top Header Bar ---------- */}
      <header className="home-topbar">
        <div className="home-topbar__inner">
          <div className="flex align-items-center gap-4">
            <span className="home-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>
              <i className="pi pi-ticket mr-2" />
              Carter Redeem
            </span>
            <nav className="home-nav hidden lg:flex gap-3">
              {navItems.map((item, index) => (
                <a 
                  key={item.label} 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); navigate(item.path); }} 
                  className={`home-nav__link${index === 2 ? ' is-active' : ''}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex align-items-center gap-3">
            <Button icon="pi pi-shopping-cart" rounded text severity="secondary" onClick={() => navigate('/cart')}>
              <Badge value={cartCount} severity="danger" className="home-cart-badge" />
            </Button>
            <Avatar image={profileImage} shape="circle" size="large" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')} />
          </div>
        </div>
      </header>

      {/* ---------- Main View Grid Elements ---------- */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: 'calc(100vh - 70px - 250px)' }}>
        
        {/*Points Balance Summary Header Card */}
        <Card className="shadow-2 border-none mb-4 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', borderRadius: '1rem' }}>
          <div className="flex align-items-center justify-content-between p-2">
            <div>
              <p className="text-sm opacity-80 uppercase font-semibold tracking-wider mb-1">Total Available Balance</p>
              <h1 className="text-4xl font-bold m-0">{userPoints.toLocaleString()} <span className="text-xl font-normal opacity-90">pts</span></h1>
            </div>
            <div className="hidden sm:flex border-circle bg-white-alpha-20 align-items-center justify-content-center" style={{ width: '4.5rem', height: '4.5rem' }}>
              <i className="pi pi-wallet text-3xl" />
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-content-center py-6"><ProgressSpinner style={{ width: '50px', height: '50px' }} /></div>
        ) : (
          <Card className="shadow-1 border-none">
            <TabView>
              
              {/*TAB: ACTIVE VALID VOUCHERS */}
              <TabPanel header={`Active (${activeVouchers.length})`} leftIcon="pi pi-ticket mr-2">
                {activeVouchers.length === 0 ? (
                  <div className="text-center py-6 text-secondary">
                    <i className="pi pi-info-circle text-4xl block mb-3" />
                    <p>No active vouchers found. Start exploring options to redeem rewards!</p>
                    <Button label="Browse Vouchers" className="mt-2" onClick={() => navigate('/categories/all')} />
                  </div>
                ) : (
                  <div className="grid mt-2">
                    {activeVouchers.map((item) => (
                      <div className="col-12 md:col-6 lg:col-4 mb-3" key={item._id}>
                        <div className="border-1 border-200 border-round-xl p-3 bg-white hover:shadow-2 transition-all flex flex-column h-full">
                          <div className="flex gap-3 align-items-center mb-3">
                            <img 
                              src={item.voucher?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'} 
                              alt={item.voucher?.title} 
                              style={{ width: '4rem', height: '4rem', borderRadius: '0.5rem', objectFit: 'cover' }}
                            />
                            <div>
                              <h4 className="font-bold m-0 line-height-2">{item.voucher?.title}</h4>
                              <p className="text-xs text-secondary mt-1">Redeemed on {new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="mt-auto pt-2 border-top-1 border-50 flex justify-content-between align-items-center">
                            <span className="text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 border-round">Ready to Use</span>
                            <Button label="Use Voucher" icon="pi pi-qrcode" size="small" onClick={() => openVoucherModal(item)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabPanel>

              {/*TAB: USED/EXPIRED HISTORY LOGS */}
              <TabPanel header="Used / Expired" leftIcon="pi pi-history mr-2">
                {usedVouchers.length === 0 ? (
                  <div className="text-center py-6 text-secondary">
                    <p>No archive history files tracked inside this window profile view block yet.</p>
                  </div>
                ) : (
                  <div className="grid mt-2">
                    {usedVouchers.map((item) => (
                      <div className="col-12 md:col-6 lg:col-4 opacity-70" key={item._id}>
                        <div className="border-1 border-200 border-round-xl p-3 bg-gray-50 flex gap-3 align-items-center">
                          <img src={item.voucher?.image} alt={item.voucher?.title} style={{ width: '3.5rem', height: '3.5rem', borderRadius: '0.5rem', objectFit: 'cover', filter: 'grayscale(100%)' }} />
                          <div>
                            <h4 className="font-bold m-0 text-sm">{item.voucher?.title}</h4>
                            <p className="text-xs text-secondary mt-1">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabPanel>

            </TabView>
          </Card>
        )}
      </main>

      {/* USE VOUCHER DIALOG POPUP OVERLAY */}
      <Dialog
        header="Voucher Redemption Pass"
        visible={qrVisible}
        style={{ width: '26rem' }}
        onHide={() => setQrVisible(false)}
        draggable={false}
        resizable={false}
        contentStyle={{ textAlign: 'center', padding: '1.5rem' }}
      >
        {activeVoucher && (
          <div className="flex flex-column align-items-center gap-3">
            <h3 className="font-bold m-0">{activeVoucher.voucher?.title}</h3>
            
            <div className="p-3 bg-gray-100 border-round-xl inline-block my-2">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${activeVoucher.uniqueCode}`} 
                alt="Voucher QR Scanner Target Code" 
                style={{ width: '180px', height: '180px', display: 'block' }}
              />
            </div>

            <div className="w-full bg-blue-50 border-round-md p-2 my-1 border-1 border-blue-200">
              <p className="text-xs text-secondary uppercase tracking-wider font-semibold mb-1">Voucher Code</p>
              <span className="font-mono text-xl font-bold text-primary tracking-widest">
                {activeVoucher.uniqueCode || "NO-CODE-FOUND"}
              </span>
            </div>
            
            <p className="text-xs text-secondary line-height-3 px-2">
              Present this QR code or the unique alphanumeric voucher string to the cashier merchant agent for validation.
            </p>
            <Divider className="my-1" />
            <Button label="Dismiss" className="w-full mt-2" outlined onClick={() => setQrVisible(false)} />
          </div>
        )}
      </Dialog>

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

export default Wallet;