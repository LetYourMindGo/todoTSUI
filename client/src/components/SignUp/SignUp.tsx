import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './SignUp.css'
import { useNavigate } from 'react-router';
import { AuthContext } from '../../context/AuthContext';

const SignUp = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;

    const auth = useContext(AuthContext);
    const [dbUserID, setDbUserID] = useState<number | null>(null);
    const [usernameInput, setUsernameInput] = useState<string>('');
    const [passwordInput, setPasswordInput] = useState<string>('');
    const [confirmedPasswordInput, setConfirmedPasswordInput] = useState<string>('');
    const [passwordMatch, setPasswordMatch] = useState<boolean>(true);

    const navigate = useNavigate();

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!usernameInput && !passwordInput && !passwordMatch) {
            return;
        };

        const response = await axios.post(
            `${baseUrl}/users/`,
        { username: usernameInput, password: passwordInput});
        console.log('response', response.data);
        const responseUserID: number = response.data;
        console.log('responseUserID', responseUserID);
        setDbUserID(responseUserID);
    };

    const onClick = () => navigate('/login');

    useEffect (() => {
        if (passwordInput !== confirmedPasswordInput) {
            setPasswordMatch(false);
        } else {
            setPasswordMatch(true);
        };
    }, [passwordInput, confirmedPasswordInput]);

    useEffect(() => {
        if (auth && dbUserID) {
            auth.login(dbUserID, usernameInput);
        };
    }, [dbUserID]);

    return (
        <div className='signup-container'>
            <h2>Sign Up</h2>
            <form className='signup-container__form' onSubmit={handleSignUp}>
                <input className='form__username'
                    required type='text'
                    value={usernameInput}
                    placeholder='Username...'
                    onChange={(e) => setUsernameInput(e.target.value)}
                />
                <input className='form__password'
                    required type='password'
                    value={passwordInput}
                    placeholder='Password...'
                    onChange={(e) => setPasswordInput(e.target.value)}
                />
                <input className='form__password'
                    required type='password'
                    value={confirmedPasswordInput}
                    placeholder='Confirm password...'
                    onChange={(e) => setConfirmedPasswordInput(e.target.value)}
                />
                <button className='form__button' type='submit'>SignUp</button>
                {passwordMatch ? <p></p>
                :
                <p className='form__incorrect'>Your passwords don't match!</p>
                }
                {dbUserID === -1 ?
                    <p className='form__incorrect'>Username is already taken</p> : <p></p>}
            </form>
            <p className='login__no-account'>
                <button className='no-account__to-login' onClick={onClick}>LogIn</button>
                if you already have an account!
            </p>
        </div>
    );
};

export default SignUp;