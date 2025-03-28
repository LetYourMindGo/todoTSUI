import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

const NavBar = () => {
    const auth = useContext(AuthContext);
    const username = localStorage.getItem('username');

    return (
        <div className='navbar-container'>
            <p>Logo</p>
            {auth?.userID && username &&
            <div className='navbar-loggedin'>
                <h2 className='navbar-titel'>Welcome, {username}!</h2>
                <button className='navbar__logout-button' onClick={auth?.logout}>Log Out</button>
            </div>
            }
        </div>
    );
};

export default NavBar