import { createContext, useState, useEffect, ReactNode, memo } from 'react';
import { useNavigate } from 'react-router';
import { AuthContextType } from '../types/types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userID, setUserID] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUserID = Number(localStorage.getItem('userID'));

        if (storedUserID) {
            setUserID(storedUserID);
        }
    }, []);

    const login = (userid: number, username: string) => {
        if (userid < 0) {
            return
        };
        console.log('Auth context', username, userid)
        setUserID(userid);
        localStorage.setItem('userID', String(userid));
        localStorage.setItem('username', String(username));
        navigate(`/${username}`);
    };

    const logout = () => {
        setUserID(null);
        localStorage.removeItem('userID');
        localStorage.removeItem('username');
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ userID, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default memo(AuthProvider);