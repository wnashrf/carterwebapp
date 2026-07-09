import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { getVouchers } from '../api/vouchers';
import { getCart, redeemSingleVoucher } from '../api/cart';
import { fetchCategories } from '../api/categories';
import './Home.css';

const downloadPdfFromBase64 = (base64String, fileName) => {
  try {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = fileName || 'voucher.pdf';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Blob download conversion breakdown:", error);
  }
};

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
  Electronics: 'pi-desktop',
  'Home & Garden': 'pi-home',
  General: 'pi-gift'
};

const profileImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBSuIxUxfHg4wgNs3r-LO4qo6VNboOmg9Kb3aXO51jImuiyOFvXuTrd1wLc7zuGzCYjXZ5uW-DcC-AM0Dx6_HcT74tKyPAwBRGp9jf4ENR6pu1lD2E_6w-CWtUcsf33qMmCjPjGRar-Zs9Ux64NQXcqqYWPA6KLkOYxYtkNHGbhGV1nufUeRWL1bJjpYyc06lh1E3ZH_apHor12onMvLgo1q_GTHEL_AAjC1AMDXJ4yvYmKVbneaw-U35QqqQp0k0tHC7X_odbbPf5';

function formatCategoryName(voucher) {
  return voucher.category_id?.name || 'General';
}

function formatVoucherValue(points) {
  return `${Number(points || 0).toLocaleString()} pts`;
}

function VoucherCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);

  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [sortBy, setSortBy] = useState('rec');
  const [viewMode, setViewMode] = useState('grid');
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [pendingVoucher, setPendingVoucher] = useState(null); 
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [pdfFilename, setPdfFilename] = useState('');
  const [resultVisible, setResultVisible] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [txError, setTxError] = useState('');
  const [savedPdfFile, setSavedPdfFile] = useState(null);

  const filteredAndSortedVouchers = vouchers
    .filter(voucher => {
      if (categoryId && categoryId !== 'all') {
        const currentVoucherCategoryName = (voucher.category_id?.name || 'General').toLowerCase().trim();
        const currentVoucherCategoryId = (voucher.category_id?._id || '').toString();
        const normalizedParam = categoryId.toLowerCase().trim();

        if (normalizedParam === 'home_garden' && currentVoucherCategoryName === 'home & garden') {

        } else if (currentVoucherCategoryName !== normalizedParam && currentVoucherCategoryId !== categoryId) {
          return false;
        }
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = voucher.title?.toLowerCase().includes(query);
        const matchDesc = voucher.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      if (selectedPrices.length > 0) {
        const pts = voucher.points || 0;
        const matchesAnyBracket = selectedPrices.some(bracket => {
          if (bracket === 'Under 1,000 pts') return pts < 1000;
          if (bracket === '1,000 - 5,000 pts') return pts >= 1000 && pts <= 5000;
          if (bracket === 'Over 5,000 pts') return pts > 5000;
          return false;
        });
        if (!matchesAnyBracket) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'pts_asc') {
        return (a.points || 0) - (b.points || 0);
      }
      if (sortBy === 'new') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });

  const displayTitle = () => {
    if (!categoryId || categoryId === 'all') return 'All Vouchers';
    if (categoryId === 'home_garden') return 'Home & Garden';
    
    const activeCat = categories.find(c => c._id === categoryId);
    if (activeCat) return activeCat.name;

    return categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace('_', ' & ');
  };

  const breadcrumbItems = [
    { label: 'Categories', command: () => navigate('/categories/all') },
    { label: displayTitle(), className: 'font-bold text-primary' }
  ];

  const breadcrumbHome = { icon: 'pi pi-home', command: () => navigate('/home') };

  const sortOptions = [
    { label: 'Recommended', value: 'rec' },
    { label: 'Newest First', value: 'new' },
    { label: 'Points: Low to High', value: 'pts_asc' }
  ];

  useEffect(() => {
    let active = true;
    async function loadInitialData() {
      try {
        const [voucherData, cartData, categoryData] = await Promise.all([
          getVouchers(),
          getCart(),
          fetchCategories()
        ]);

        if (!active) return;
        
        setVouchers(Array.isArray(voucherData) ? voucherData : []);
        if (Array.isArray(cartData)) setCartCount(cartData.length);
        setCategories(Array.isArray(categoryData) ? categoryData : categoryData.data || []);
      } catch (err) {
        setError(err.message || 'Failed to sync screen parameters');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadInitialData();
    return () => { active = false; };
  }, []);

  const onPriceChange = (e) => {
    let _selectedPrices = [...selectedPrices];
    if (e.checked) _selectedPrices.push(e.value);
    else _selectedPrices.splice(_selectedPrices.indexOf(e.value), 1);
    setSelectedPrices(_selectedPrices);
  };

  const askRedeemConfirmation = (voucher) => {
    setPendingVoucher(voucher);
    setConfirmVisible(true);
  };
  
  const handleConfirmedRedeem = async () => {
    if (!pendingVoucher) return;
    setConfirmVisible(false);
    setProcessing(true);
    
    try {
      const response = await redeemSingleVoucher(pendingVoucher._id);
      setProcessing(false);
      const responseData = response?.data?.data || response?.data || response;

      if (responseData && responseData.redemptionCode) {
        setRedemptionCode(responseData.redemptionCode);
        setPdfFilename(responseData.fileName);
        if (responseData.pdfFile) {
          setSavedPdfFile(responseData.pdfFile);
          downloadPdfFromBase64(responseData.pdfFile, responseData.fileName || 'voucher.pdf');
        }
      } else {
        setRedemptionCode('UNKNOWN-ERR');
        setPdfFilename('');
      }

      setOrderSuccess(true);
      setResultVisible(true);
    } catch (err) {
      setProcessing(false);
      setOrderSuccess(false);
      setTxError(err.message || "Redemption failed.");
      setResultVisible(true);
    }
  };

  const successDialogFooter = (
    <div className="flex flex-column gap-2 w-full">
      <Button
        label="Download Voucher PDF Again"
        icon="pi pi-download"
        className="w-full"
        disabled={!savedPdfFile}
        onClick={() => {
          if (savedPdfFile) {
            downloadPdfFromBase64(savedPdfFile, pdfFilename || 'voucher.pdf');
          }
        }}
      />
      <Button label="Done" icon="pi pi-check" outlined className="w-full" onClick={() => setResultVisible(false)} />
    </div>
  );

  const failureDialogFooter = (
    <div className="flex flex-column gap-2 w-full">
      <Button label="Close" text className="w-full" onClick={() => setResultVisible(false)} />
    </div>
  );

  const visibleCategories = isExpanded ? categories : categories.slice(0, 3);

  return (
    <div className="home-shell">
      <Toast ref={toast} />
      
      {/* ---------- Top bar ---------- */}
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

      <main className="home-main max-w-container-max mx-auto px-4 py-4">
        <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="border-none bg-transparent p-0 mb-4" />

        <div className="grid mt-2">
          {/* ---------- Sidebar Filters ---------- */}
          <aside className="col-12 md:col-3 pr-4">
            <div className="mb-4 pb-3 border-bottom-1 border-300">
              <h2 className="text-2xl font-bold mb-1">
                {displayTitle()}
              </h2>
              <p className="text-secondary text-sm">{filteredAndSortedVouchers.length} vouchers available</p>
            </div>

            <div className="mb-5">
              <h4 className="font-bold mb-3">Categories</h4>
              {/*Categories Buttons */}
              <div className="flex flex-wrap gap-2">
                <div 
                  onClick={() => navigate('/categories/all')}
                  className={`px-3 py-2 border-round-xl text-sm transition-all transition-duration-150 cursor-pointer ${
                    (!categoryId || categoryId === 'all')
                      ? 'bg-white border-2 border-900 text-900 font-bold shadow-1' 
          : 'bg-white border-1 border-200 hover:border-400 hover:shadow-1 text-secondary font-medium'
                  }`}
                >
                  All Vouchers
                </div>

                {/*Database-Driven Category Options mapping loop */}
                {visibleCategories.map(cat => {
                  const categoryUrlParam = cat.name.toLowerCase() === 'home & garden' ? 'home_garden' : cat._id;
                  const isActive = categoryId === categoryUrlParam || categoryId === cat._id;

                  return (
                    <div 
                      key={cat._id}
                      onClick={() => navigate(`/categories/${categoryUrlParam}`)}
                      className={`px-3 py-2 border-round-xl text-sm transition-all transition-duration-150 cursor-pointer ${
                        isActive 
                          ? 'bg-white border-2 border-900 text-900 font-bold shadow-1' 
                          : 'bg-white border-1 border-200 hover:border-400 hover:shadow-1 text-secondary font-medium'
                      }`}
                    >
                      {cat.name}
                    </div>
                  );
                })}
              </div>

              {/* Dynamic "View All" Expansion Controller Toggle Trigger */}
              {categories.length > 3 && (
                <div className="text-left mt-3">
                  <Button 
                    label={isExpanded ? "Show Less" : `View All (+${categories.length - 3})`} 
                    link 
                    className="p-0 text-xs font-semibold shadow-none" 
                    style={{ color: 'var(--primary-color)' }}
                    onClick={() => setIsExpanded(!isExpanded)} 
                  />
                </div>
              )}
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
          </aside>

          {/* ---------- Main Content ---------- */}
          <section className="col-12 md:col-9">
            <div className="flex flex-column md:flex-row align-items-center justify-content-between gap-3 mb-4 bg-white p-3 border-round-xl shadow-1 border-1 border-50">
              {/* Contextual Local Search Bar Field */}
              <span className="p-input-icon-left w-full md:w-20rem">
                <i className="pi pi-search" />
                <InputText 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vouchers in this view..." 
                  className="w-full text-sm p-inputtext-sm" 
                />
              </span>

              <div className="flex align-items-center justify-content-between w-full md:w-auto gap-3">
                {/* Sort Dropdown Selector */}
                <div className="flex align-items-center gap-2">
                  <span className="text-sm text-secondary">Sort by:</span>
                  <Dropdown 
                    value={sortBy}
                    options={sortOptions} 
                    onChange={(e) => setSortBy(e.value)}
                    placeholder="Recommended" 
                    className="border-none text-sm p-0" 
                  />
                </div>

                {/* View Layout Display Toggle Switches */}
                <div className="flex gap-2">
                  <Button 
                    icon="pi pi-th-large" 
                    size="small" 
                    text={viewMode !== 'grid'} 
                    onClick={() => setViewMode('grid')}
                  />
                  <Button 
                    icon="pi pi-list" 
                    size="small" 
                    severity="secondary" 
                    text={viewMode !== 'list'} 
                    onClick={() => setViewMode('list')}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-content-center py-6">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} />
              </div>
            ) : error ? (
              <Message severity="error" text={error} className="w-full" />
            ) : filteredAndSortedVouchers.length === 0 ? (
              <div className="text-center py-6 bg-white border-round-xl shadow-1 border-1 border-50">
                <i className="pi pi-filter-slash text-4xl text-400 mb-3" />
                <p className="text-secondary m-0">No vouchers match your current filtering selections.</p>
              </div>
            ) : (
              /* Layout Grid/List Switcher Frame */
              <div className="grid">
                {filteredAndSortedVouchers.map((voucher) => (
                  <div 
                    className={viewMode === 'grid' ? "col-12 md:col-6 lg:col-4 mb-4" : "col-12 mb-3"} 
                    key={voucher._id}
                  >
                    <Card 
                      className="home-voucher h-full shadow-1 border-none"
                      style={{ overflow: 'hidden' }}
                      bodyClassName="p-0"
                    >
                      <div className={`flex ${viewMode === 'list' ? 'flex-column sm:flex-row align-items-stretch' : 'flex-column'}`}>
                        <div 
                          className={`cursor-pointer flex-1 w-full flex ${viewMode === 'list' ? 'flex-column sm:flex-row align-items-center gap-4' : 'flex-column'}`} 
                          onClick={() => navigate(`/vouchers/${voucher._id}`)}
                        >
                          <div 
                            className="home-voucher__image-wrap" 
                            style={viewMode === 'list' ? { width: '100%', sm: '200px', maxWidth: '200px', height: '140px', flexShrink: 0, position: 'relative' } : { position: 'relative' }}
                          >
                            <img
                              alt={voucher.title}
                              className="home-voucher__image"
                              src={voucher.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div 
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)',
                                pointerEvents: 'none'
                              }}
                            />
                            <Tag
                              className="home-voucher__badge"
                              value={formatVoucherValue(voucher.points)}
                              severity="warning"
                              rounded
                            />
                            <div className="home-voucher__brand" style={{ zIndex: 2 }}>
                              <i className={`pi ${categoryIcons[formatCategoryName(voucher)] || categoryIcons.General}`} />
                              <span>{formatCategoryName(voucher)}</span>
                            </div>
                          </div>

                          {/* Text Informational Body */}
                          <div className={`w-full ${viewMode === 'list' ? 'px-3 sm:px-0 py-3' : 'p-3'}`}>
                            <h3 className="home-voucher__title mt-0 mb-1 text-lg font-bold text-900 hover:text-primary transition-colors">
                              {voucher.title}
                            </h3>
                            <p className="home-voucher__desc text-sm line-height-3 mb-2 text-secondary">
                              {voucher.description || 'Enjoy premium dining and exclusive flavors.'}
                            </p>
                            
                            <div className="flex align-items-center gap-2 m-0">
                              <i className="pi pi-star-fill text-yellow-500 text-xs" />
                              <span className="text-xs font-bold">4.8</span>
                              <span className="text-xs text-secondary">(1.2k reviews)</span>
                            </div>
                          </div>
                        </div>

                        {/*Action Footer*/}
                        <div 
                          className={
                            viewMode === 'list' 
                              ? 'w-full sm:w-16rem p-4 border-none border-left-1 border-100 flex flex-row sm:flex-column align-items-center justify-content-center sm:justify-content-center gap-3 bg-gray-50' 
                              : 'home-voucher__footer flex align-items-center justify-content-between pt-3 px-3 pb-3 w-full border-top-1 border-50'
                          }
                        >
                          <span className="text-xl font-bold text-900 sm:mb-1">
                            {formatVoucherValue(voucher.points)}
                          </span>
                          <Button 
                            label="Redeem Now" 
                            size="small" 
                            className={viewMode === 'list' ? 'w-full' : ''} 
                            onClick={(e) => {
                              e.stopPropagation(); 
                              askRedeemConfirmation(voucher);
                            }} 
                          />
                        </div>

                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Dialog: Misclick Confirmation Guard */}
      <Dialog
        header="Confirm Redemption"
        visible={confirmVisible}
        style={{ width: '28rem' }}
        onHide={() => setConfirmVisible(false)}
        footer={
          <div>
            <Button label="Cancel" icon="pi pi-times" text onClick={() => setConfirmVisible(false)} />
            <Button label="Confirm" icon="pi pi-check" loading={processing} onClick={handleConfirmedRedeem} autoFocus />
          </div>
        }
      >
        <p className="m-0">
          Are you sure you want to spend <strong>{pendingVoucher && formatVoucherValue(pendingVoucher.points)}</strong> to instantly redeem <strong>{pendingVoucher?.title}</strong>?
        </p>
      </Dialog>

      {/* Dialog: Transaction Feedback Result Layout */}
      <Dialog
        visible={resultVisible}
        onHide={() => setResultVisible(false)}
        footer={orderSuccess ? successDialogFooter : failureDialogFooter}
        closable={false}
        style={{ width: '32rem' }}
        contentStyle={{ textAlign: 'center', padding: '2rem' }}
      >
        {orderSuccess ? (
          <>
            <div className="flex align-items-center justify-content-center border-circle mx-auto mb-4" style={{ width: '6rem', height: '6rem', background: '#dcfce7' }}>
              <i className="pi pi-check-circle" style={{ fontSize: '3.5rem', color: '#16a34a' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Redemption Successful!</h2>
            <p style={{ color: '#6c757d', lineHeight: 1.6 }}>
              Your voucher code <strong className="font-mono">{redemptionCode}</strong> is ready.
            </p>
          </>
        ) : (
          <>
            <div className="flex align-items-center justify-content-center border-circle mx-auto mb-4" style={{ width: '6rem', height: '6rem', background: '#fee2e2' }}>
              <i className="pi pi-times-circle" style={{ fontSize: '3.5rem', color: '#dc2626' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Redemption Failed</h2>
            <p style={{ color: '#6c757d', lineHeight: 1.6 }}>{txError || "We couldn't process your transaction."}</p>
          </>
        )}
      </Dialog>

      {/* ---------- Footer (Same as Home) ---------- */}
      <footer className="home-footer">
        <div className="home-footer__inner grid">
          <div className="col-12 md:col-5">
            <span className="home-brand">
              <i className="pi pi-ticket mr-2" />
              VouchWise Redeem
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
          Copyright 2026 VouchWise Redeem Web App Voucher Management.
        </div>
      </footer>
    </div>
  );
}

export default VoucherCategory;