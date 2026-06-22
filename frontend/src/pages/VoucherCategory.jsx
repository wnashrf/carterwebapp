import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { getVouchers } from '../api/vouchers';
import { useParams } from 'react-router-dom';
import { getCart } from '../api/cart';
import './Home.css';

const navItems = [
  { label: 'Explore', path: '/home' },
  { label: 'Categories', path: '/categories/all' },
  { label: 'Wallet', path: '/wallet' }
];
const categoryIcons = {
  'Food & Beverage': 'pi-apple',
  Shopping: 'pi-shopping-bag',
  Travel: 'pi-send',
  Health: 'pi-heart',
  Entertainment: 'pi-video',
  Lifestyle: 'pi-star',
  General: 'pi-gift'
};

const profileImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBSuIxUxfHg4wgNs3r-LO4qo6VNboOmg9Kb3aXO51jImuiyOFvXuTrd1wLc7zuGzCYjXZ5uW-DcC-AM0Dx6_HcT74tKyPAwBRGp9jf4ENR6pu1lD2E_6w-CWtUcsf33qMmCjPjGRar-Zs9Ux64NQXcqqYWPA6KLkOYxYtkNHGbhGV1nufUeRWL1bJjpYyc06lh1E3ZH_apHor12onMvLgo1q_GTHEL_AAjC1AMDXJ4yvYmKVbneaw-U35QqqQp0k0tHC7X_odbbPf5';

function formatCategoryName(voucher) {
  return voucher.category_id?.name || 'General';
}

function formatVoucherValue(points) {
  return `${Number(points || 0).toLocaleString()} pts`;
}

function VoucherCategory() {
  const { categoryId } = useParams();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const toast = useRef(null);
  const navigate = useNavigate();

  const filteredVouchers = vouchers.filter(voucher => {
    if (!categoryId || categoryId === 'all') return true; 
    const currentVoucherCategory = (voucher.category_id?.name || 'General').toLowerCase().trim();
    if (categoryId === 'home_garden') {
      return currentVoucherCategory === 'home & garden';
    }
    return currentVoucherCategory === categoryId.toLowerCase().trim();
  });

  const breadcrumbItems = [
    { 
      label: 'Categories', 
      command: () => navigate('/categories/all')
    },
    { 
      label: categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace('_', ' & ') : 'All Vouchers', 
      className: 'font-bold text-primary' 
    }
  ];

  const breadcrumbHome = { 
    icon: 'pi pi-home', 
    command: () => navigate('/home')
  };

  const sortOptions = [
    { label: 'Recommended', value: 'rec' },
    { label: 'Newest First', value: 'new' },
    { label: 'Points: Low to High', value: 'pts_asc' }
  ];

  useEffect(() => {
    let active = true;
    async function loadVouchers() {
      try {
        const data = await getVouchers();
       if (!active) return;
       setVouchers(Array.isArray(data) ? data : []);

       const cartData = await getCart();
       if (active && Array.isArray(cartData)) {
         setCartCount(cartData.length);
       }
      } catch (err) {
        setError(err.message || 'Failed to load vouchers');
      } finally {
        setLoading(false);
      }
    }
    loadVouchers();
    return () => { active = false; };
  }, []);

  const onPriceChange = (e) => {
    let _selectedPrices = [...selectedPrices];
    if (e.checked) _selectedPrices.push(e.value);
    else _selectedPrices.splice(_selectedPrices.indexOf(e.value), 1);
    setSelectedPrices(_selectedPrices);
  };

  const handleRedeem = (voucher) => {
    toast.current.show({
      severity: 'success',
      summary: 'Voucher Redeemed',
      detail: `${voucher.title} added to wallet!`,
      life: 3000
    });
  };

  return (
    <div className="home-shell">
      <Toast ref={toast} />
      
      {/* ---------- Top bar (Same as Home) ---------- */}
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
                  className={`home-nav__link${index === 1 ? ' is-active' : ''}`}
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
              <Badge value="2" severity="danger" className="home-cart-badge" />
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

      <main className="home-main max-w-container-max mx-auto px-4 py-4">
        <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="border-none bg-transparent p-0 mb-4" />

        <div className="grid mt-2">
          {/* ---------- Sidebar Filters ---------- */}
          <aside className="col-12 md:col-3 pr-4">
            <div className="mb-4 pb-3 border-bottom-1 border-300">
              <h2 className="text-2xl font-bold mb-1">
                {categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : 'All Vouchers'}
              </h2>
              <p className="text-secondary text-sm">{filteredVouchers.length} vouchers available</p>
            </div>

            <div className="mb-5">
              <h4 className="font-bold mb-3">Categories</h4>
              <div className="grid g-2">
                {[
                  { name: 'All Vouchers', id: 'all', icon: 'pi-th-large', path: '/categories/all' },
                  { name: 'Electronics', id: 'electronics', icon: 'pi-shopping-bag', path: '/categories/electronics' },
                  { name: 'Books', id: 'books', icon: 'pi-book', path: '/categories/books' },
                  { name: 'Home & Garden', id: 'home_garden', icon: 'pi-home', path: '/categories/home_garden' }
                ].map(cat => {
                  const isActive = (cat.id === 'all' && !categoryId) || categoryId === cat.id;

                  return (
                    <div key={cat.id} className="col-6 mb-2">
                      <div 
                        onClick={() => navigate(cat.path)}
                        className={`flex flex-column align-items-center justify-content-center p-3 border-round-xl border-1 text-center cursor-pointer transition-all transition-duration-150 ${
                          isActive 
                            ? 'bg-secondary border-200 text-primary shadow-1 font-bold' 
                            : 'bg-white border-200 hover:border-400 hover:shadow-1 text-secondary'
                        }`}
                        style={{ minHeight: '85px' }}
                      >
                        {/* Added pointer-events-none to safeguard nested clicks */}
                        <i className={`pi ${cat.icon} text-xl mb-2 pointer-events-none ${isActive ? 'text-primary' : 'text-secondary'}`} />
                        <span className="text-xs font-semibold line-height-2 pointer-events-none">{cat.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-5">
              <h4 className="font-bold mb-3">Price Range</h4>
              <div className="flex flex-column gap-2">
                {['Under 1,000 pts', '1,000 - 5,000 pts', 'Over 5,000 pts'].map(price => (
                  <div key={price} className="flex align-items-center">
                    <Checkbox inputId={price} value={price} onChange={onPriceChange} checked={selectedPrices.includes(price)} />
                    <label htmlFor={price} className="ml-2 text-sm">{price}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h4 className="font-bold mb-3">Discount %</h4>
              <div className="flex flex-wrap gap-2">
                {['10% Off', '25% Off', '50% Off', 'BOGO'].map(tag => (
                  <Button key={tag} label={tag} size="small" outlined className="p-button-rounded text-xs" />
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h4 className="font-bold mb-3">Popular Brands</h4>
              <div className="flex flex-column gap-2">
                {['Gourmet Garden', 'The Steakhouse', 'Coffee Co.'].map(brand => (
                  <div key={brand} className="flex align-items-center">
                    <RadioButton inputId={brand} value={brand} onChange={(e) => setSelectedBrand(e.value)} checked={selectedBrand === brand} />
                    <label htmlFor={brand} className="ml-2 text-sm">{brand}</label>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ---------- Main Content ---------- */}
          <section className="col-12 md:col-9">
            <div className="flex align-items-center justify-content-between mb-4 bg-white p-3 border-round-xl shadow-1 border-1 border-50">
              <div className="flex align-items-center gap-2">
                <span className="text-sm text-secondary">Sort by:</span>
                <Dropdown options={sortOptions} placeholder="Recommended" className="border-none text-sm p-0" />
              </div>
              <div className="flex gap-2">
                <Button icon="pi pi-th-large" text size="small" />
                <Button icon="pi pi-list" text size="small" severity="secondary" />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-content-center py-6">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} />
              </div>
            ) : error ? (
              <Message severity="error" text={error} className="w-full" />
            ) : (
              <div className="grid">
                {filteredVouchers.map((voucher) => (
                  <div className="col-12 md:col-6 lg:col-4 mb-4" key={voucher._id}>
                    <Card className="home-voucher h-full shadow-1 border-none hover:shadow-3 transition-all transition-duration-200">
                      <div className="home-voucher__image-wrap">
                        <img
                          alt={voucher.title}
                          className="home-voucher__image"
                          src={voucher.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                        />
                        <Tag
                          className="home-voucher__badge"
                          value={formatVoucherValue(voucher.points)}
                          severity="warning"
                          rounded
                        />
                        <div className="home-voucher__brand">
                          <i className={`pi ${categoryIcons[formatCategoryName(voucher)] || categoryIcons.General}`} />
                          <span>{formatCategoryName(voucher)}</span>
                        </div>
                      </div>

                      <h3 className="home-voucher__title mt-3 mb-1 text-lg font-bold">{voucher.title}</h3>
                      <p className="home-voucher__desc text-sm line-height-3 mb-3 text-secondary">
                        {voucher.description || 'Enjoy premium dining and exclusive flavors.'}
                      </p>
                      
                      <div className="flex align-items-center gap-2 mb-3">
                        <i className="pi pi-star-fill text-yellow-500 text-xs" />
                        <span className="text-xs font-bold">4.8</span>
                        <span className="text-xs text-secondary">(1.2k reviews)</span>
                      </div>

                      <div className="home-voucher__footer pt-3 border-top-1 border-50">
                        <span className="home-voucher__points text-xl font-bold">
                          {formatVoucherValue(voucher.points)}
                        </span>
                        <Button label="Redeem Now" size="small" onClick={() => handleRedeem(voucher)} />
                      </div>
                    </Card>
                  </div>
                ))}
                
                <div className="col-12">
                  <div className="flex flex-column align-items-center justify-content-center p-6 border-2 border-dashed border-300 border-round-xl bg-gray-50 cursor-pointer hover:bg-white transition-all">
                    <div className="w-3rem h-3rem border-circle bg-white flex align-items-center justify-content-center mb-3 shadow-1">
                      <i className="pi pi-plus text-primary" />
                    </div>
                    <p className="font-bold mb-1">View More Offers</p>
                    <p className="text-secondary text-xs">Showing {filteredVouchers.length} vouchers</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ---------- Footer (Same as Home) ---------- */}
      <footer className="home-footer">
        <div className="home-footer__inner grid">
          <div className="col-12 md:col-5">
            <span className="home-brand">
              <i className="pi pi-ticket mr-2" />
              Carter Redeem
            </span>
            <p className="mt-2 text-sm opacity-70">
              A modern voucher home page powered by your React frontend and MongoDB
              backend.
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

export default VoucherCategory;