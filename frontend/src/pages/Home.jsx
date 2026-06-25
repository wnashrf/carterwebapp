import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { getVouchers } from '../api/vouchers';
import { getCart } from '../api/cart';
import './Home.css';

const navItems = [
  { label: 'Explore', path: '/home' },
  { label: 'Categories', path: '/categories/all' },
  { label: 'Wallet', path: '/wallet' }
];

// Map backend category names to PrimeIcons
const categoryIcons = {
  'Food & Beverage': 'pi-apple',
  Shopping: 'pi-shopping-bag',
  Travel: 'pi-send',
  Health: 'pi-heart',
  Entertainment: 'pi-video',
  Lifestyle: 'pi-star',
  General: 'pi-gift'
};

const spotlightImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD0wAMAnPyn4S21lOE8d2JuvT1AZrYDw63TbmPklZh-s9t3tgKrFXGjAc5OiSPKOl2fyhr4c9JP0dJXFeu7t7MhwFci-55HCxcScWpHI48CkowOBZv_Ickp9ND8eNVozTzJD1zrmx84psO3gl0kV9Eb3TYkENhghwg0gN90MZtE_i3veK1SQlWZF2-C3qA2MlcliVgnmtc2gtZ7NHHorIHxclN8r4G1xtlEEkKP5FamxngWqPilu9YEs3Km4P_mmI70WOzeRc_pfwch';

const profileImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBSuIxUxfHg4wgNs3r-LO4qo6VNboOmg9Kb3aXO51jImuiyOFvXuTrd1wLc7zuGzCYjXZ5uW-DcC-AM0Dx6_HcT74tKyPAwBRGp9jf4ENR6pu1lD2E_6w-CWtUcsf33qMmCjPjGRar-Zs9Ux64NQXcqqYWPA6KLkOYxYtkNHGbhGV1nufUeRWL1bJjpYyc06lh1E3ZH_apHor12onMvLgo1q_GTHEL_AAjC1AMDXJ4yvYmKVbneaw-U35QqqQp0k0tHC7X_odbbPf5';

function formatCategoryName(voucher) {
  return voucher.category_id?.name || 'General';
}

function formatVoucherValue(points) {
  return `${Number(points || 0).toLocaleString()} pts`;
}

function Home() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);

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
        if (!active) {
          return;
        }

        setError(err.message || 'Failed to load vouchers');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadVouchers();

    return () => {
      active = false;
    };
  }, []);

  const totalPoints = vouchers.reduce(
    (sum, voucher) => sum + (Number(voucher.points) || 0),
    0
  );

  const categories = Array.from(
    new Map(
      vouchers.map((voucher) => {
        const name = formatCategoryName(voucher);

        return [
          name,
          {
            name,
            icon: categoryIcons[name] || categoryIcons.General
          }
        ];
      })
    ).values()
  );

  const trendingVouchers = vouchers.slice(0, 4);
  const featureVoucher = vouchers[0];
  const latestVoucher = vouchers[vouchers.length - 1];
  const topValueVoucher = [...vouchers].sort(
    (left, right) => Number(right.points || 0) - Number(left.points || 0)
  )[0];

  return (
    <div className="home-shell">
      {/* ---------- Top bar ---------- */}
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
                  className={`home-nav__link${index === 0 ? ' is-active' : ''}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex align-items-center gap-3">
            <Button
              icon="pi pi-shopping-cart"
              rounded
              text
              severity="secondary"
              aria-label="Cart"
              onClick={() => navigate('/cart')}
            >
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

      <main className="home-main" id="main-content">
        {/* ---------- Hero ---------- */}
        <section
          className="home-hero"
          style={{ backgroundImage: `url(${spotlightImage})` }}
        >
          <div className="home-hero__overlay" />
          <div className="home-hero__content">
            <Tag value="Flash Deal" severity="warning" rounded className="mb-3" />
            <h1 className="home-hero__title">Unlock Premium Rewards Today</h1>
            <p className="home-hero__text">
              Manage, redeem, and discover exclusive vouchers from your favorite
              brands — all in one place.
            </p>

            <div className="flex flex-wrap gap-4 my-4">
              <div className="home-stat">
                <span>Total vouchers</span>
                <strong>{loading ? '...' : vouchers.length}</strong>
              </div>
              <div className="home-stat">
                <span>Total voucher pts value</span>
                <strong>{loading ? '...' : totalPoints.toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button label="Explore Now" icon="pi pi-arrow-right" iconPos="right" />
              <Button label="Learn More" severity="contrast" outlined />
            </div>
          </div>
        </section>

        {/* ---------- Categories ---------- */}
        <section className="home-section">
          <div className="home-section__heading">
            <div>
              <h2>Browse Categories</h2>
            </div>
            <Button label="View All"
            link
            className="p-0"
            onClick={() => navigate('/categories/all')}/>
          </div>

          <div className="grid">
            {(categories.length
              ? categories
              : [{ name: 'General', icon: categoryIcons.General }]
            ).map((category) => (
              <div className="col-6 md:col-4 lg:col-2" key={category.name}>
                <div 
                  className="home-category" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const URLFriendlyName = category.name.toLowerCase().replace(/ & /g, '_');
                    navigate(`/categories/${URLFriendlyName}`);
                  }}
                >
                  <span className="home-category__icon">
                    <i className={`pi ${category.icon}`} />
                  </span>
                  <span className="home-category__name">{category.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Trending vouchers ---------- */}
        <section className="home-section">
          <div className="home-section__heading">
            <div>
              <h2>Trending Vouchers</h2>
            </div>
            <Button icon="pi pi-filter" rounded text severity="secondary" />
          </div>

          {loading ? (
            <div className="flex justify-content-center py-6">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            </div>
          ) : null}

          {error ? (
            <Message severity="error" text={error} className="w-full justify-content-start" />
          ) : null}

          {!loading && !error && trendingVouchers.length === 0 ? (
            <Message severity="info" text="No vouchers found yet." className="w-full justify-content-start" />
          ) : null}

          {!loading && !error && trendingVouchers.length > 0 ? (
            <div className="grid">
              {trendingVouchers.map((voucher, index) => (
                <div className="col-12 md:col-6 lg:col-3" key={voucher._id}>
                  <Card className="home-voucher h-full p-0">
                    
                    {/* 🖱️ Clickable Area Wrapper for Details Redirection */}
                    <div 
                      className="cursor-pointer w-full"
                      onClick={() => navigate(`/vouchers/${voucher._id}`)}
                    >
                      <div className="home-voucher__image-wrap">
                        <img
                          alt={voucher.title}
                          className="home-voucher__image"
                          src={voucher.image || spotlightImage}
                        />
                        <Tag
                          className="home-voucher__badge"
                          value={
                            index === 0 ? 'Trending' : formatVoucherValue(voucher.points)
                          }
                          severity={index === 0 ? 'warning' : 'info'}
                          rounded
                        />
                        <div className="home-voucher__brand">
                          <i className={`pi ${categoryIcons[formatCategoryName(voucher)] || categoryIcons.General}`} />
                          <span>{formatCategoryName(voucher)}</span>
                        </div>
                      </div>

                      <h3 className="home-voucher__title mt-3 px-3">{voucher.title}</h3>
                      <p className="home-voucher__desc px-3">
                        {voucher.description || 'No description available for this voucher yet.'}
                      </p>
                    </div>

                    {/* Action Footer (Kept independent) */}
                    <div className="home-voucher__footer px-3 pb-3">
                      <span className="home-voucher__points">
                        {formatVoucherValue(voucher.points)}
                      </span>
                      <Button 
                        label="View Details" 
                        size="small" 
                        onClick={() => navigate(`/vouchers/${voucher._id}`)}
                      />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* ---------- Bento highlights ---------- */}
        <section className="home-section">
          <h2 className="mb-3">Fresh on Carter Redeem</h2>
          <div className="grid">
            <div className="col-12 lg:col-6">
              <div className="home-bento home-bento--feature h-full">
                <div>
                  <Tag value="Exclusive Access" severity="success" className="mb-2" />
                  <h3>{featureVoucher?.title || 'Your first voucher will appear here'}</h3>
                  <p>
                    {featureVoucher?.description ||
                      'Once your backend has vouchers, this card spotlights the newest reward.'}
                  </p>
                </div>
                <div className="flex align-items-center justify-content-between mt-3">
                  <strong className="home-bento__value">
                    {featureVoucher ? formatVoucherValue(featureVoucher.points) : '0 pts'}
                  </strong>
                  <Button icon="pi pi-arrow-up-right" rounded />
                </div>
              </div>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
              <div className="home-bento home-bento--accent h-full">
                <h3>Latest Drop</h3>
                <p>{latestVoucher?.title || 'Waiting for a new voucher'}</p>
                <Tag
                  value={latestVoucher ? formatCategoryName(latestVoucher) : 'General'}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
              <div className="flex flex-column gap-3 h-full">
                <div className="home-bento home-bento--dark flex-1">
                  <i className="pi pi-bolt home-bento__icon" />
                  <h4>Most Valuable</h4>
                  <p>{topValueVoucher?.title || 'No vouchers yet'}</p>
                </div>
                <div className="home-bento home-bento--light flex-1">
                  <i className="pi pi-chart-line home-bento__icon" />
                  <h4>Points Snapshot</h4>
                  <p>{loading ? '...' : `${totalPoints.toLocaleString()} total points`}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="home-footer">
        <div className="home-footer__inner grid">
          <div className="col-12 md:col-5">
            <span className="home-brand">
              <i className="pi pi-ticket mr-2" />
              Carter Redeem
            </span>
            <p className="mt-2">
              A modern voucher home page powered by your React frontend and MongoDB
              backend.
            </p>
          </div>
          <div className="col-6 md:col-2">
            <strong>Company</strong>
            <a href="#main-content">About Us</a>
            <a href="#main-content">Contact Us</a>
          </div>
          <div className="col-6 md:col-2">
            <strong>Support</strong>
            <a href="#main-content">Help Center</a>
            <a href="#main-content">Redemption Guide</a>
          </div>
          <div className="col-6 md:col-3">
            <strong>Legal</strong>
            <a href="#main-content">Privacy Policy</a>
            <a href="#main-content">Terms of Service</a>
          </div>
        </div>
        <div className="home-footer__bottom">
          Copyright 2026 Carter Redeem Web App Voucher Management.
        </div>
      </footer>

      <Button
        icon="pi pi-plus"
        rounded
        className="home-fab"
        aria-label="Add voucher"
      />
    </div>
  );
}

export default Home;
