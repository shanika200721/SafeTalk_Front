import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    console.log('📄 Welcome component rendered');
  }, []);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 0,
      }} />
      
      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        color: 'white',
        padding: '40px 20px',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '5rem',
          fontWeight: 800,
          margin: '0 0 20px 0',
          background: 'linear-gradient(135deg, #4A90E2 30%, #50E3C2 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          SAFE TALK
        </h1>
        
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'white',
          marginBottom: '20px'
        }}>
          An Intelligent Platform That Understands You Beyond Words
        </h2>
        
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '40px'
        }}>
          Empowering mental health support through advanced assessment
        </p>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, #4A90E2, #50E3C2)',
              color: 'white',
              border: 'none',
              padding: '15px 40px',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Login
          </button>
          
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '15px 40px',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
