import { useNavigate } from 'react-router';
import { useEffect } from 'react';

const RootRedirect = () => {
    const navigate = useNavigate();
  
    useEffect(() => {
        const storedUserID = localStorage.getItem('userID');
        const storedUsername = localStorage.getItem('username');
  
        if (storedUserID && storedUsername) {
            navigate(`/${storedUsername}`);
        } else {
            navigate('/login');
        }
    }, [navigate]);
  
    return null;
};

export default RootRedirect;