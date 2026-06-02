import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const userJson = params.get('user');

        console.log('OAuth Callback Params:', { token: !!token, user: !!userJson });

        if (token) {
            localStorage.setItem('token', token);
            if (userJson) {
                localStorage.setItem('user', decodeURIComponent(userJson));
            }
            console.log('Settings stored. Redirecting to dashboard...');
            // Using window.location.href for a clean reset
            window.location.href = '/dashboard';
        } else {
            console.error('No token found in callback URL');
            window.location.href = '/?error=auth_failed';
        }
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#0f172a',
            color: 'white'
        }}>
            <div className="spinner" style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(255,255,255,0.1)',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
            }} />
            <p>Finalizing your login...</p>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
