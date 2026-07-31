import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);
  return <>
    <section className="hero-section"><div className="hero-copy"><p className="eyebrow">YOUR QUIET CORNER OF THE INTERNET</p><h1>Stuck somewhere?<br />MindWell is here<br /><em>to help.</em></h1><p className="hero-text">A private, anonymous space to share your feelings, tell your story, and make room for what matters.</p><div className="hero-actions"><Link className="button" to={user ? '/dashboard' : '/register'}>{user ? 'Go to your space' : 'Start your journey'}</Link></div></div><aside className="hero-note"><span>01</span><p>Your feelings are yours. Your stories stay private.</p></aside></section>
    {user && <section className="welcome-steps"><p className="eyebrow">A GENTLER WAY FORWARD</p><h2>Small steps can make space for a clearer mind.</h2><div className="step-grid"><article><b>01</b><h3>Track your feelings</h3><p>Notice how your emotional world shifts over time.</p></article><article><b>02</b><h3>Practice gratitude</h3><p>Give the good moments a place to land.</p></article><article><b>03</b><h3>Decompress</h3><p>Let your breath guide you back to the present.</p></article></div><p className="quiz-intro">Let’s start with a quiz to understand you more.</p></section>}
  </>;
};
export default Home;
