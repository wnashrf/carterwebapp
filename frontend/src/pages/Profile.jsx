import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { getCart } from '../api/cart';
import { fetchProfileData, modifyProfileData } from '../api/auth';
import './Home.css';

const navItems = [
  { label: 'Explore', path: '/home' },
  { label: 'Categories', path: '/categories/all' },
  { label: 'Wallet', path: '/wallet' }
];

const profileImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBSuIxUxfHg4wgNs3r-LO4qo6VNboOmg9Kb3aXO51jImuiyOFvXuTrd1wLc7zuGzCYjXZ5uW-DcC-AM0Dx6_HcT74tKyPAwBRGp9jf4ENR6pu1lD2E_6w-CWtUcsf33qMmCjPjGRar-Zs9Ux64NQXcqqYWPA6KLkOYxYtkNHGbhGV1nufUeRWL1bJjpYyc06lh1E3ZH_apHor12onMvLgo1q_GTHEL_AAjC1AMDXJ4yvYmKVbneaw-U35QqqQp0k0tHC7X_odbbPf5';

const recentActivity = [
  { id: 1, icon: 'pi-check-circle', color: '#22c55e', label: 'Redeemed Starbucks RM10 Voucher', pts: '-1,000 pts', date: 'Today, 10:32 AM' },
  { id: 2, icon: 'pi-gift', color: '#3b82f6', label: 'Earned points from login bonus', pts: '+500 pts', date: 'Yesterday, 8:00 AM' },
  { id: 3, icon: 'pi-shopping-cart', color: '#f59e0b', label: 'Added GrabFood voucher to cart', pts: '', date: '12 Jun 2026' },
  { id: 4, icon: 'pi-check-circle', color: '#22c55e', label: 'Redeemed Shopee RM50 Gift Card', pts: '-5,000 pts', date: '10 Jun 2026' },
];

function Profile() {
  const navigate = useNavigate();
  const toast = useRef(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ vouchersRedeemed: '0', totalSaved: 'RM 0', memberSince: '---' });
  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', username: '' });

  useEffect(() => {
    let active = true;

    async function initProfileView() {
      try {
        const [cartRes, profileRes] = await Promise.all([getCart(), fetchProfileData()]);
        if (!active) return;

        if (Array.isArray(cartRes)) setCartCount(cartRes.length);

        const profilePayload = profileRes.data || profileRes;
        if (profilePayload?.user) {
          setUser(profilePayload.user);
          setStats(profilePayload.stats);
          setActivities(profilePayload.activity);
          setFormData({
            fullName: profilePayload.user.fullName || '',
            email: profilePayload.user.email || '',
            phone: profilePayload.user.phone || '',
            username: profilePayload.user.username || ''
          });
        }
      } catch (err) {
        console.error('Initialization breakdown error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    initProfileView();
    return () => { active = false; };
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await modifyProfileData(formData);
      toast.current.show({ severity: 'success', summary: 'Profile Updated', detail: 'Your alterations have been saved successfully.', life: 3000 });
      
      // Update local baseline username text elements dynamically
      setUser(prev => ({ ...prev, ...formData }));
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Update Failed', detail: err.response?.data?.message || 'Error occurred.', life: 3000 });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="home-shell">
      <Toast ref={toast} />

      {/* Header */}
      <header className="home-topbar">
        <div className="home-topbar__inner">
          <div className="flex align-items-center gap-4">
            <span className="home-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>
              <i className="pi pi-ticket mr-2" />
              Carter Redeem
            </span>
            <nav className="home-nav hidden lg:flex gap-3">
              {navItems.map((item) => (
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
              <Badge value={cartCount} severity="danger" className="home-cart-badge" />
            </Button>
            <Avatar
              image={profileImage}
              shape="circle"
              size="large"
              style={{ cursor: 'pointer', outline: '2px solid var(--primary-color)', outlineOffset: '2px' }} 
            />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Page title */}
        <div className="flex align-items-center justify-content-between mb-4">
          <div className="flex align-items-center gap-3">
            <Button icon="pi pi-arrow-left" text onClick={() => navigate('/home')} />
            <h1 className="text-2xl font-bold m-0">My Profile</h1>
          </div>
          <Button
            label="Logout"
            icon="pi pi-sign-out"
            severity="danger"
            outlined
            onClick={handleLogout}
          />
        </div>

        <div className="grid">

          {/* Left column: avatar + stats */}
          <div className="col-12 lg:col-4">
            <Card className="shadow-1 border-none mb-4 text-center">
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                <Avatar image={profileImage} shape="circle" size="xlarge" style={{ width: '6rem', height: '6rem' }} />
                <Button icon="pi pi-camera" rounded size="small" style={{ position: 'absolute', bottom: 0, right: 0, width: '2rem', height: '2rem' }} />
              </div>
              <h2 className="text-xl font-bold mb-1">{user?.fullName || user?.username || 'Valued User'}</h2>
              <p className="text-sm mb-3" style={{ color: '#6c757d' }}>{user?.email}</p>
              <Tag value={user?.role === 'admin' ? 'Administrator' : 'Premium Member'} severity="warning" rounded />
            </Card>

            <Card className="shadow-1 border-none mb-4" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f6b45 100%)', color: '#fff' }}>
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-star-fill" style={{ color: '#fbbf24' }} />
                <span className="font-semibold text-sm" style={{ opacity: 0.85 }}>Available Balance</span>
              </div>
              <p className="font-bold mb-3" style={{ fontSize: '2.25rem', lineHeight: 1 }}>{user?.points?.toLocaleString() || 0}</p>
              <Button label="Redeem Points" icon="pi pi-arrow-right" iconPos="right" size="small" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }} onClick={() => navigate('/home')} />
            </Card>

            <Card className="shadow-1 border-none" bodyClassName="p-3">
              <h3 className="font-bold mb-3 mt-0" style={{ fontSize: '1.2rem' }}>Activity Stats</h3>
              <div className="flex flex-column gap-3">
                {[
                  { label: 'Vouchers Redeemed', value: stats.vouchersRedeemed, icon: 'pi-ticket', color: '#8b5cf6' },
                  { label: 'Member Since', value: stats.memberSince, icon: 'pi-calendar', color: '#3b82f6' },
                ].map(stat => (
                  <div key={stat.label} className="flex align-items-center gap-3">
                    <div className="flex align-items-center justify-content-center border-circle" style={{ width: '2.5rem', height: '2.5rem', background: `${stat.color}20`, flexShrink: 0 }}>
                      <i className={`pi ${stat.icon}`} style={{ color: stat.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p className="text-sm m-0" style={{ color: '#6c757d' }}>{stat.label}</p>
                    </div>
                    <span className="font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column: edit form + activity */}
          <div className="col-12 lg:col-8">
            <Card className="shadow-1 border-none mb-4">
              <h2 className="text-xl font-bold mb-4">Personal Information</h2>
              <div className="grid">
                <div className="col-12 md:col-6 field">
                  <label className="font-semibold text-sm block mb-2" style={{ color: '#6c757d' }}>Full Name</label>
                  <span className="p-input-icon-left w-full">
                    <i className="pi pi-user pl-2" style={{ left: '0.75rem', paddingRight: '0.5rem' }} />
                    <InputText name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full pl-5" />
                  </span>
                </div>
                <div className="col-12 md:col-6 field">
                  <label className="font-semibold text-sm block mb-2" style={{ color: '#6c757d' }}>Email Address</label>
                  <span className="p-input-icon-left w-full">
                    <i className="pi pi-envelope pl-2" style={{ left: '0.75rem', paddingRight: '0.5rem' }} />
                    <InputText name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-5" />
                  </span>
                </div>
                <div className="col-12 md:col-6 field">
                  <label className="font-semibold text-sm block mb-2" style={{ color: '#6c757d' }}>Phone Number</label>
                  <span className="p-input-icon-left w-full">
                    <i className="pi pi-phone pl-2" style={{ left: '0.75rem', paddingRight: '0.5rem' }} />
                    <InputText name="phone" value={formData.phone} onChange={handleInputChange} className="w-full pl-5" />
                  </span>
                </div>
                <div className="col-12 md:col-6 field">
                  <label className="font-semibold text-sm block mb-2" style={{ color: '#6c757d' }}>Username Handle</label>
                  <span className="p-input-icon-left w-full">
                    <i className="pi pi-at pl-2" style={{ left: '0.75rem', paddingRight: '0.5rem' }} />
                    <InputText name="username" value={formData.username} onChange={handleInputChange} className="w-full pl-5" />
                  </span>
                </div>
              </div>      
              <div className="flex justify-content-end gap-2 mt-2">
                <Button label="Cancel" outlined severity="secondary" onClick={() => navigate('/home')} />
                <Button label="Save Changes" icon="pi pi-check" loading={saving} onClick={handleSave} />
              </div>
            </Card>

            {/* Dynamic Activity List View */}
            <Card className="shadow-1 border-none">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div 
                style={{ 
                  height: '255px',
                  overflowY: 'auto',
                  paddingRight: '0.5rem'
                }}
              >
                <div className="flex flex-column">
                  {activities.length === 0 ? (
                    <div className="text-center py-6 text-sm" style={{ color: '#6c757d' }}>
                      No historical items logged yet.
                    </div>
                  ) : (
                    activities.map((item, idx) => (
                      <div key={item.id}>
                        <div className="flex align-items-center gap-3 py-3">
                          <div className="flex align-items-center justify-content-center border-circle" style={{ width: '2.75rem', height: '2.75rem', background: `${item.color}20`, flexShrink: 0 }}>
                            <i className={`pi ${item.icon}`} style={{ color: item.color }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p className="font-semibold m-0 text-sm">{item.label}</p>
                            <p className="text-xs mt-1 m-0" style={{ color: '#6c757d' }}>{item.date}</p>
                          </div>
                          {item.pts && (
                            <span className="font-bold text-sm" style={{ color: item.pts.startsWith('-') ? '#dc2626' : '#16a34a' }}>
                              {item.pts}
                            </span>
                          )}
                        </div>
                        {idx < activities.length - 1 && <Divider className="my-0" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
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
            <p className="mt-2 text-sm opacity-70">A modern voucher platform powered by React and MongoDB.</p>
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

export default Profile;
