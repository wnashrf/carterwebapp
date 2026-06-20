import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';
import './Login.css';

// 1. Defensive check for environment variables to prevent ReferenceErrors
// 2. Provide a fallback URL for local development
const API_BASE = (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : null) || 
                 'http://localhost:5000/api';

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

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password, username: formData.username };

    try {
      // Ensure no double slashes in the URL construction
      const cleanBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
      const url = `${cleanBase}${endpoint}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (isLogin) {
        if (data.token) {
          localStorage.setItem('token', data.token);
          navigate('/Home'); 
        } else {
          throw new Error('Login successful, but no token was received.');
        }
      } else {
        alert('Account created! Please sign in.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card p-4 sm:p-6">
        <div className="text-center mb-5">
          <i className="pi pi-ticket login-logo" />
          <div className="login-title">{isLogin ? 'Welcome Back' : 'Join VouchWise'}</div>
          <span className="login-subtitle">
            {isLogin
              ? 'Sign in to access your voucher vault'
              : 'Create an account to start redeeming'}
          </span>
        </div>

        {error ? (
          <Message severity="error" text={error} className="w-full mb-4 justify-content-start" />
        ) : null}

        <form onSubmit={handleSubmit}>
          {!isLogin ? (
            <div className="field mb-4">
              <label htmlFor="username" className="login-label">
                Full Name
              </label>
              <span className="p-input-icon-left w-full">
                <i className="pi pi-user" />
                <InputText
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full"
                  required
                />
              </span>
            </div>
          ) : null}

          <div className="field mb-4">
            <label htmlFor="email" className="login-label">
              Email
            </label>
            <span className="p-input-icon-left w-full">
              <i className="pi pi-envelope" />
              <InputText
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@vouchwise.com"
                className="w-full"
                required
              />
            </span>
          </div>

          <div className="field mb-2">
            <div className="flex align-items-center justify-content-between">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              {isLogin ? (
                <a href="#forgot" className="login-forgot">
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
              inputClassName="w-full"
              className="w-full"
              required
            />
          </div>

          <Button
            type="submit"
            label={loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
            icon={classNames('pi', { 'pi-sign-in': isLogin, 'pi-user-plus': !isLogin })}
            className="w-full mt-4"
            loading={loading}
          />
        </form>

        <Divider align="center" className="my-4">
          <span className="login-divider-text">OR</span>
        </Divider>

        <div className="grid">
          <div className="col-6">
            <Button
              type="button"
              label="Google"
              icon="pi pi-google"
              severity="secondary"
              outlined
              className="w-full"
            />
          </div>
          <div className="col-6">
            <Button
              type="button"
              label="Apple"
              icon="pi pi-apple"
              severity="secondary"
              outlined
              className="w-full"
            />
          </div>
        </div>

        <div className="text-center mt-5">
          <span className="login-subtitle">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <Button
            type="button"
            label={isLogin ? 'Create account' : 'Sign in'}
            link
            className="login-toggle p-0"
            onClick={handleToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
