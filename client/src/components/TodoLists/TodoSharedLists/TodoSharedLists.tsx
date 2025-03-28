import axios from 'axios';
import { TodoSharedListsProps } from '../../../types/types';
import { Link, useNavigate, useParams } from 'react-router';
import './TodoSharedLists.css';

const TodoSharedLists = ({ sharedLists, username, userID }: TodoSharedListsProps) => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const paramsListID = Number(useParams().listid);

    const navigate = useNavigate();

    const handleListExit = async (userID: number, listid: number) => {
        try {
            await axios.delete(`${baseUrl}/todoLists/share/${listid}`, { 
                data: {userID: userID,}
            });
            if (listid === paramsListID) {
                navigate(`/${username}`);
            };
            window.location.reload();
        } catch (error) {
            console.error("Error leaving list:", error);
        };
    };

    return (
    <div className='list__shared-list'>
        <h3>Shared with you</h3>
        {sharedLists.map(list => (
            <div className='list__list-card' key={list.listid}>
                <Link className='list-card__list-name' to={`/${username}/${list.listid}`} key={list.listid}>
                {list.listname}
                </Link>
                <button className='buttons__leave-button' title='Leave' onClick={() => handleListExit(userID, list.listid)}>🚪</button>
            </div>
        ))}
    </div>
  )
}

export default TodoSharedLists