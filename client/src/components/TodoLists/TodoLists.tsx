import { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { ListData } from '../../types/types';
import PopUpWindow from '../PopUpWindow/PopUpWindow';
import './TodoLists.css';
import TodoOwnerLists from './TodoOwnerLists/TodoOwnerLists';
import TodoSharedLists from './TodoSharedLists/TodoSharedLists';

const TodoLists = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const userID = Number(localStorage.getItem('userID'));
    const username = localStorage.getItem('username');

    const [listData, setListData] = useState<ListData[]>([]);
    const ownerLists = listData.filter(list => list.role === 'owner');
    const sharedLists = listData.filter(list => list.role === 'shared');

    const [showModal, setShowModal] = useState<boolean>(false);

    const [action, setAction] = useState<string>('');
    const [listID, setListID] = useState<number | null>(null);
    

    useEffect(() => {
        const getListData = async () => {
            const response: AxiosResponse = await axios.get<ListData[]>(`${baseUrl}/userLists/${userID}`);
            setListData(response.data)
        }

        getListData()
    }, [userID]);

    return (
        <div className='todoLists-container'>
            <button className='header__button' onClick={() => {
                setShowModal(true)
                setAction('create');
            }}>Create New List</button>
            {listData.length === 0 ? (
                <h3 className='todoLists-container__placeholder'>No lists yet...</h3>
            ) : (
                <div className='todoLists-container__list'>
                    {ownerLists.length > 0 && (
                        <TodoOwnerLists
                            ownerLists={ownerLists}
                            username={username}
                            setShowModal={setShowModal}
                            setAction={setAction}
                            setListID={setListID}
                        />
                    )}
                    {sharedLists.length > 0 && (
                        <TodoSharedLists 
                            sharedLists={sharedLists}
                            username={username}
                            userID={userID}
                        />
                    )}
                </div>
            )}
            {showModal && <PopUpWindow userID={userID} listID={listID} setShowModal={setShowModal} action={action} />}

        </div>
    )
};

export default TodoLists;