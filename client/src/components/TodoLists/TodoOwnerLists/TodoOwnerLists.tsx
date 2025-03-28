import axios from 'axios';
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router';
import { TodoOwnerListsProps } from '../../../types/types';
import './TodoOwnerLists.css'

const TodoOwnerLists = ({ ownerLists, username, setShowModal, setAction, setListID }: TodoOwnerListsProps) => {
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const [editingListId, setEditingListId] = useState<number | null>(null);
        const [newListName, setNewListName] = useState<string>('');
        const [disableTransition, setDisableTransition] = useState<boolean>(false);
        const paramsListID = Number(useParams().listid);

        const navigate = useNavigate();

    const handleUpdateListName = async (listid: number) => {
        if (!newListName.trim()) return;

        try {
            await axios.put(`${baseUrl}/todoLists/${listid}`, {
                newListName: newListName,
            });

            setEditingListId(null);
            setNewListName('');
            window.location.reload();
        } catch (error) {
            console.error('Error updating list name:', error);
        };
    };

    const handleListDelete = async (listid: number) => {
        try {
            await axios.delete(`${baseUrl}/todoLists/${listid}`);
            if (listid === paramsListID) {
                navigate(`/${username}`);
            };
            window.location.reload();
        } catch (error) {
            console.error("Error deleting list:", error);
        };
    };

    const handleCancel = () => {
        setDisableTransition(true);
        setEditingListId(null)

        setTimeout(() => {
            setDisableTransition(false);
          }, 50);
    };

    return (
        <div className='list__owner-lists'>
            <div className='owner-lists__header'>
                <h3>Your lists</h3>
            </div>
            {ownerLists.map(list => (
                <div key={list.listid}>
                    {editingListId === list.listid ? (
                        <div className='list__edit-list-name'>
                            <input className='edit-list-name__input'
                                type="text"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                autoFocus
                            />
                            <div className={`edit-list-name__buttons ${disableTransition ? "no-transition" : ""}`}>
                                <button className='buttons__button-save' onClick={() => handleUpdateListName(list.listid)}>Save</button>
                                <button className='buttons__button-cancel' onClick={handleCancel}>Cancel</button>
                            </div>
                        </div>
                        ) : (
                        <div className='list__list-card'>
                            <Link className='list-card__list-name' to={`/${username}/${list.listid}`}>{list.listname}</Link>
                            <div className={`list-card__buttons ${disableTransition ? "no-transition" : ""}`}>
                                <button className='buttons__button-item' title='Edit list name' onClick={() => {
                                    setEditingListId(list.listid);
                                    setNewListName(list.listname);
                                    setDisableTransition(true);
                                }}>✏️</button>
                                <button className='buttons__button-item' title='Share with an user' onClick={() => {
                                    setShowModal(true);
                                    setAction('share');
                                    setListID(list.listid);
                                }}>➕</button>
                                <button className='buttons__button-item' title='Delete list' onClick={() => handleListDelete(list.listid)}>❌</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default TodoOwnerLists