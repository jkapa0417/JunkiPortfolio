import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAuthToken } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

const AuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
            setAuthToken(token);
            refreshUser().then(() => {
                // Redirect to previous page or home
                const returnTo = sessionStorage.getItem('auth_return_to') || '/';
                sessionStorage.removeItem('auth_return_to');
                navigate(returnTo, { replace: true });
            });
        } else if (error) {
            console.error('Auth error:', error);
            navigate('/', { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    }, [searchParams, navigate, refreshUser]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="glass-card p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-white/60">Completing authentication...</p>
            </div>
        </div>
    );
};

export default AuthCallbackPage;
