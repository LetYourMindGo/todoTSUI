import { Route, Routes } from 'react-router';
import './App.css';
import SignUp from './components/SignUp/SignUp';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import RootRedirect from './components/RootRedirect';
import NavBar from './components/Navbar/NavBar';

const App = () => {

    return (
        <div className='todo-app'>
            <div className='todo-app__main-container'>
                <NavBar />
                <Routes>
                    <Route path='/' element={<RootRedirect />}/>
                    <Route path='/:username' element={<Home />} />
                    <Route path='/:username/:listid' element={<Home />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/signup' element={<SignUp />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;
