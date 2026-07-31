import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryKeyword, setRecoveryKeyword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (recoveryKeyword.trim().length < 3) {
      setError('Recovery keyword must be at least 3 characters long.');
      return;
    }
    try {
      await register(email, password, recoveryKeyword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. The email might already be in use.');
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '5rem' }}>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>Register</h2>
        {error && <p style={{ color: 'var(--accent-danger)' }}>{error}</p>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="recoveryKeyword">Recovery Keyword</label>
          <p style={{fontSize: '0.8rem', margin: 0, color: 'var(--text-secondary)'}}>
            This keyword is used to reset your password if you forget it. Keep it safe!
          </p>
          <input
            type="text"
            id="recoveryKeyword"
            value={recoveryKeyword}
            onChange={(e) => setRecoveryKeyword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
