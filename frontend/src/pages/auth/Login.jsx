import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoverMode, setRecoverMode] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoveryKeyword, setRecoveryKeyword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login, recoverPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in. Please check your credentials.');
      console.error(err);
    }
  };

  const handleRecoverSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!recoverEmail || !recoveryKeyword || !newPassword) {
      setError('Please provide your email, recovery keyword, and a new password.');
      return;
    }

    try {
      await recoverPassword(recoverEmail, recoveryKeyword, newPassword);
      setSuccessMessage('Password updated successfully. You can now log in with your new password.');
      setRecoverMode(false);
      setRecoverEmail('');
      setRecoveryKeyword('');
      setNewPassword('');
      setEmail(recoverEmail);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset your password. Please verify your recovery details.');
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '5rem' }}>
      <form onSubmit={recoverMode ? handleRecoverSubmit : handleSubmit} className="form-container">
        <h2>{recoverMode ? 'Recover Password' : 'Login'}</h2>
        {error && <p style={{ color: 'var(--accent-danger)' }}>{error}</p>}
        {successMessage && <p style={{ color: 'var(--accent-success)' }}>{successMessage}</p>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={recoverMode ? recoverEmail : email}
            onChange={(e) => {
              if (recoverMode) {
                setRecoverEmail(e.target.value);
              } else {
                setEmail(e.target.value);
              }
            }}
            required
          />
        </div>

        {!recoverMode ? (
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="recoveryKeyword">Recovery Keyword</label>
              <input
                type="text"
                id="recoveryKeyword"
                value={recoveryKeyword}
                onChange={(e) => setRecoveryKeyword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary">
          {recoverMode ? 'Reset Password' : 'Login'}
        </button>

        {!recoverMode ? (
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setRecoverMode(true);
                setError('');
                setSuccessMessage('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', padding: 0, cursor: 'pointer' }}
            >
              Forgot password?
            </button>
          </p>
        ) : (
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setRecoverMode(false);
                setError('');
                setSuccessMessage('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', padding: 0, cursor: 'pointer' }}
            >
              Back to login
            </button>
          </p>
        )}

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
