import { useParams } from 'react-router';
import TodoLists from '../TodoLists/TodoLists';
import Todo from '../Todo/Todo';
import './Home.css';
import RootRedirect from '../RootRedirect';

const Home = () => {
    const username = localStorage.getItem('username');
    const listID = Number(useParams().listid);

    return (
        <div className='home-container'>
            {username ? (
                <>
                    <TodoLists />
                    {listID ? <Todo key={listID} listID={listID} /> : <div className='todo_container__placeholder'>Chose a list...</div>}
                </>
            ) : (<RootRedirect />)
            }  
        </div>
    );
};

export default Home;