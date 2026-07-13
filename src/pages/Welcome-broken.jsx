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
      backgroundColor: '#667eea',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '30px',
      padding: '40px 20px'
    }}>
      <h1 style={{
        fontSize: '4rem',
        fontWeight: 800,
        color: 'white',
        margin: 0,
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        SAFE TALK
      </h1>
      
      <p style={{
        fontSize: '1.3rem',
        color: 'white',
        margin: 0,
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        An Intelligent Platform That Understands You Beyond Words
      </p>
      
      <div style={{
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => {
            console.log('Login button clicked');
            navigate('/login');
          }}
          style={{
            backgroundColor: '#4A90E2',
            color: 'white',
            border: 'none',
            padding: '15px 40px',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.8'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
        >
          Login
        </button>
        
        <button
          onClick={() => {
            console.log('Register button clicked');
            navigate('/register');
          }}
          style={{
            backgroundColor: 'white',
            color: '#4A90E2',
            border: 'none',
            padding: '15px 40px',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.8'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Welcome;
};

export default Welcome;
