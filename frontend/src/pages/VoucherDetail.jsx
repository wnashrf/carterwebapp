import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import './Home.css';
import { getCart } from '../api/cart';
import apiClient from '../api/client';

const navItems = [
  { label: 'Explore', path: '/home' },
  { label: 'Categories', path: '/categories/all' },
  { label: 'Wallet', path: '/wallet' }
];

const profileImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBSuIxUxfHg4wgNs3r-LO4qo6VNboOmg9Kb3aXO51jImuiyOFvXuTrd1wLc7zuGzCYjXZ5uW-DcC-AM0Dx6_HcT74tKyPAwBRGp9jf4ENR6pu1lD2E_6w-CWtUcsf33qMmCjPjGRar-Zs9Ux64NQXcqqYWPA6KLkOYxYtkNHGbhGV1nufUeRWL1bJjpYyc06lh1E3ZH_apHor12onMvLgo1q_GTHEL_AAjC1AMDXJ4yvYmKVbneaw-U35QqqQp0k0tHC7X_odbbPf5';

const categoryIcons = {
  'Food & Beverage': 'pi-apple',
  Shopping: 'pi-shopping-bag',
  Travel: 'pi-send',
  Health: 'pi-heart',
  Entertainment: 'pi-video',
  Lifestyle: 'pi-star',
  General: 'pi-gift',
};

function formatVoucherValue(points) {
  return `${Number(points || 0).toLocaleString()} pts`;
}

function VoucherDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useRef(null);
  const [cartCount, setCartCount] = useState(0);
  const voucher = location.state?.voucher;

  useEffect(() => {
    let active = true;

    async function loadCartCount() {
      try {
        const data = await getCart();
        if (active && Array.isArray(data)) {
          setCartCount(data.length);
        }
      } catch (err) {
        console.error('Failed to load cart count', err);
      }
    }
    loadCartCount();

    return () => {
      active = false;
    };
  }, []);

  if (!voucher) {
    return (
      <div className="home-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="pi pi-exclamation-circle" style={{ fontSize: '3rem', color: '#6c757d', display: 'block', marginBottom: '1rem' }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No voucher selected.</p>
          <Button label="Back to Home" icon="pi pi-arrow-left" onClick={() => navigate('/home')} />
        </div>
      </div>
    );
  }

  const categoryName = voucher.category_id?.name || 'General';
  const categoryIcon = categoryIcons[categoryName] || categoryIcons.General;

  const breadcrumbItems = [
    { label: categoryName, command: () => navigate('/home') },
    { label: voucher.title },
  ];
  const breadcrumbHome = { icon: 'pi pi-home', command: () => navigate('/home') };

  const handleRedeem = () => {
    toast.current.show({
      severity: 'success',
      summary: 'Voucher Redeemed!',
      detail: `${voucher.title} has been added to your wallet.`,
      life: 3000,
    });
  };

  const handleAddToCart = async () => {
  try {
    await apiClient.post(`/cart`, { 
      voucher: voucher._id, 
      quantity: 1 
    });

    navigate('/cart');

  } catch (error) {
    console.error("Failed to update database cart:", error);
    toast.current.show({
      severity: 'error',
      summary: 'Cart Error',
      detail: 'Could not add item to cart. Please try again.',
      life: 3000,
    });
  }
};

  return (
    <div className="home-shell">
      <Toast ref={toast} />

      {/* Top bar */}
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
                  href={item.path !== '#' ? '#' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.path !== '#') {
                      navigate(item.path);
                    }
                  }}
                  className="home-nav__link"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex align-items-center gap-3">
            <span className="p-input-icon-left hidden md:inline-block">
              <i className="pi pi-search" />
              <InputText placeholder="Search vouchers..." className="home-search" />
            </span>
            <Button icon="pi pi-shopping-cart" rounded text severity="secondary" onClick={() => navigate('/cart')}>
              <Badge value={cartCount} severity="danger" className="home-cart-badge" />
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

      <main className="home-main" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem' }}>
        <BreadCrumb
          model={breadcrumbItems}
          home={breadcrumbHome}
          className="border-none bg-transparent p-0 mb-4"
        />

        <div className="grid">
          {/* Left column: hero + details */}
          <div className="col-12 lg:col-8">
            {/* Hero image */}
            <div className="relative border-round-xl overflow-hidden shadow-1 mb-4" style={{ position: 'relative' }}>
              <img
                src={
                  voucher.image ||
                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
                }
                alt={voucher.title}
                style={{ width: '100%', aspectRatio: '21/9', objectFit: 'cover', display: 'block' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
                }}
              />
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem' }}>
                <Tag
                  value={categoryName}
                  icon={`pi ${categoryIcon}`}
                  severity="warning"
                  rounded
                  style={{ display: 'inline-flex', marginBottom: '0.5rem' }}
                />
                <h1 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.25 }}>
                  {voucher.title}
                </h1>
              </div>
            </div>

            {/* Details card */}
            <Card className="shadow-1 border-none mb-4">
              <h2 className="text-xl font-bold mb-3">About this Voucher</h2>
              <p className="line-height-3" style={{ color: '#6c757d' }}>
                {voucher.description || 'Enjoy this exclusive voucher and experience premium quality service.'}
              </p>

              <div className="grid mt-4">
                <div className="col-12 md:col-6">
                  <div className="flex align-items-start gap-3 p-3 border-round-lg" style={{ background: '#f8f9fa' }}>
                    <i className="pi pi-check-circle mt-1" style={{ color: '#22c55e', fontSize: '1.25rem' }} />
                    <div>
                      <p className="font-semibold mb-1">Instant Redemption</p>
                      <p className="text-sm" style={{ color: '#6c757d' }}>Use your code immediately after redemption.</p>
                    </div>
                  </div>
                </div>
                <div className="col-12 md:col-6">
                  <div className="flex align-items-start gap-3 p-3 border-round-lg" style={{ background: '#f8f9fa' }}>
                    <i className="pi pi-calendar mt-1" style={{ color: '#3b82f6', fontSize: '1.25rem' }} />
                    <div>
                      <p className="font-semibold mb-1">6-Month Validity</p>
                      <p className="text-sm" style={{ color: '#6c757d' }}>Valid for 180 days from the date of issue.</p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold mt-4 mb-3">Terms &amp; Conditions</h3>
              <ul style={{ paddingLeft: '1.25rem', color: '#6c757d', lineHeight: 2 }}>
                <li>Valid for one person per voucher.</li>
                <li>Advance booking required; subject to availability.</li>
                <li>Not valid during public holidays or special event weekends.</li>
                <li>Cannot be combined with any other promotional offers or discounts.</li>
                <li>Non-refundable once redeemed or after expiration date.</li>
              </ul>
            </Card>
          </div>

          {/* Right column: redeem card */}
          <div className="col-12 lg:col-4">
            <div style={{ position: 'sticky', top: '5rem' }}>
              <Card className="shadow-2 border-none mb-3">
                <div className="flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="text-sm mb-1" style={{ color: '#6c757d' }}>Required Points</p>
                    <p className="font-bold" style={{ fontSize: '2rem', margin: 0 }}>
                      {formatVoucherValue(voucher.points)}
                    </p>
                  </div>
                  <Tag value="Available" severity="success" rounded />
                </div>

                <div className="flex align-items-center gap-2 mb-4">
                  <i className="pi pi-star-fill" style={{ color: '#f59e0b' }} />
                  <span className="font-bold">4.8</span>
                  <span className="text-sm" style={{ color: '#6c757d' }}>(1.2k reviews)</span>
                </div>

                <Button
                  label="Redeem Now"
                  icon="pi pi-check"
                  className="w-full mb-3"
                  onClick={handleRedeem}
                />
                <Button
                  label="Add to Cart"
                  icon="pi pi-shopping-cart"
                  className="w-full"
                  outlined
                  onClick={handleAddToCart}
                />

                <div
                  className="flex align-items-center gap-2 mt-4 pt-3"
                  style={{ borderTop: '1px solid #dee2e6' }}
                >
                  <i className="pi pi-shield" style={{ color: '#22c55e' }} />
                  <span className="text-sm" style={{ color: '#6c757d' }}>Secured Redemption Guarantee</span>
                </div>
              </Card>

              <Button
                label="Back to Home"
                icon="pi pi-arrow-left"
                text
                className="w-full"
                onClick={() => navigate('/home')}
              />
            </div>
          </div>
        </div>
      </main>

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

export default VoucherDetail;
