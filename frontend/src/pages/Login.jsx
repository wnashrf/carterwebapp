import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';
import { loginUser, signupUser } from '../api/auth';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let data;
      if (isLogin) {
        data = await loginUser(formData.email, formData.password);
        if (data.token) {
          localStorage.setItem('token', data.token);
          navigate('/Home'); 
        } else {
          throw new Error('Login successful, but no token was received.');
        }
      } else {
        await signupUser(formData.username, formData.email, formData.password);
        alert('Account created! Please sign in.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ─── LEFT PANEL: THE MANUAL FORM PANELS ─── */}
      <div className="login-form-container">
        <div className="login-card-clean">
          <div className="mb-5">
            <div className="login-title-clean">{isLogin ? 'Welcome back' : 'Create account'}</div>
            <span className="login-subtitle-clean">
              {isLogin ? 'Please enter your details to sign in.' : 'Please fill in your detail parameters below.'}
            </span>
          </div>

          {error ? (
            <Message severity="error" text={error} className="w-full mb-4 justify-content-start" />
          ) : null}

          <form onSubmit={handleSubmit}>
            {!isLogin ? (
              <div className="field mb-4">
                <label htmlFor="username" className="login-label-clean">
                  Username
                </label>
                <InputText
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. jsmith23"
                  className="w-full p-inputtext-lg"
                  required
                />
              </div>
            ) : null}

            <div className="field mb-4">
              <label htmlFor="email" className="login-label-clean">
                Email address
              </label>
              <InputText
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@vouchwise.com"
                className="w-full p-inputtext-lg"
                required
              />
            </div>

            <div className="field mb-4">
              <div className="flex align-items-center justify-content-between mb-2">
                <label htmlFor="password" className="login-label-clean m-0">
                  Password
                </label>
                {isLogin ? (
                  <a href="#forgot" className="login-forgot-clean">
                    Forgot password?
                  </a>
                ) : null}
              </div>
              <Password
                inputId="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                toggleMask
                feedback={!isLogin}
                inputClassName="w-full p-inputtext-lg"
                className="w-full"
                required
              />
            </div>

            <Button
              type="submit"
              label={loading ? 'Authenticating...' : isLogin ? 'Sign in' : 'Create Account'}
              className="w-full p-button-lg p-button-teal mt-2"
              loading={loading}
            />
          </form>

          <div className="text-center mt-5 text-sm font-medium">
            <span className="text-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <Button
              type="button"
              label={isLogin ? 'Sign up' : 'Sign in'}
              link
              className="p-0 font-bold text-teal-600"
              onClick={handleToggle}
            />
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: PREMIUM TEAL BRANDING VISUAL ─── */}
      <div className="login-visual-panel">
        <div className="visual-splash-circle" />
        <div className="visual-content-wrapper text-center">
          <i className="pi pi-ticket visual-icon-frame" />
          <div className="visual-tagline">VouchWise Smart Rewards System</div>
          <p className="visual-description">
            Your single unified marketplace container to track, discover, and instantly redeem points for premium retail vouchers nationwide.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;