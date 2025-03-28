import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router';
import './Login.css';

const Login = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const auth = useContext(AuthContext);
    const [dbUserID, setDbUserID] = useState<number | null>(null);
    const [usernameInput, setUsernameInput] = useState<string>('');
    const [passwordInput, setPasswordInput] = useState<string>('');

    const navigate = useNavigate();

    useEffect(() => {
        if (auth && dbUserID) {
            auth.login(dbUserID, usernameInput);
        };
    }, [dbUserID]);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        if (auth && usernameInput) {
            const response = await axios.post(`${baseUrl}/users/${usernameInput}`, { password: passwordInput });
            const responseUserID: number = response.data;
            setDbUserID(responseUserID);
        };
    };

    const onClick = () => navigate('/signup')

    return (
        <div className='login-container'>
            <h2>Log In</h2>
            <form className='login-container__form' onSubmit={handleLogin}>
                <input className='form__username'
                    required type='text' 
                    value={usernameInput}
                    placeholder='Username...'
                    onChange={(e) => setUsernameInput(e.target.value)} />
                <input className='form__password'
                    required type='password'
                    value={passwordInput}
                    placeholder='Password...'
                    onChange={(e) => setPasswordInput(e.target.value)}/>
                <button className='form__button' type='submit'>LogIn</button>
                {dbUserID === -1 ?
                    <p className='form__incorrect'>Username or password is incorrect</p> : <p></p>}
            </form>
            <p className='login-container__no-account'>
                <button className='no-account__to-login' onClick={onClick}>SignUp</button>
                if you don't have an account yet!
            </p>
        </div>
    );
};

export default Login;