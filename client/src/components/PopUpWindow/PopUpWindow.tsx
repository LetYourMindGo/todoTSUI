import { useState } from 'react';
import axios from 'axios';
import { PopUpProps } from '../../types/types';
import './PopUpWindow.css';

const PopUpWindow = ({ userID, listID, setShowModal, action }: PopUpProps) => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const [userInput, setUserInput] = useState<string>('');
    const username = localStorage.getItem('username');

    const handleCreateList = async () => {
        if (!userInput.trim()) return;

        try {
            await axios.post(`${baseUrl}/todoLists`, {
                ownerID: userID,
                listName: userInput,
            });

            setShowModal(false);
            setUserInput('');
            window.location.reload();
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };

    const handleShareList = async (listid: number | null) => {
        if (!listID) return;
        if (!userInput.trim()) return;
        if (userInput === username) return;

        try {
            await axios.post(`${baseUrl}/todoLists/share/${listid}`, {
                username: userInput,
            });

            setShowModal(false);
            setUserInput('');
            
        } catch (error) {
            console.error("Error sharing the list:", error);
        };
    };

    return (
        <div className='pop-up-container'>
            <div className='pop-up-container___window'>
                {action === 'create' ?
                    <>
                        <h3 className='window__header'>Create new list</h3>
                        <input className='window__input'
                            type="text" 
                            value={userInput} 
                            onChange={(e) => setUserInput(e.target.value)} 
                            placeholder="Enter list name"
                        />
                        <div className='window__buttons'>
                            <button className='buttons__action'
                                onClick={handleCreateList}>Create</button>
                            <button className='buttons__action'
                                onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </> : null
                }
                {action === 'share' ?
                    <>
                        <h3 className='window__header'>Share list with the user</h3>
                        <input className='window__input'
                            type="text" 
                            value={userInput} 
                            onChange={(e) => setUserInput(e.target.value)} 
                            placeholder="Enter username"
                        />
                        <div className='window__buttons'>
                            <button className='buttons__action'
                                onClick={() => handleShareList(listID)}>Share</button>
                            <button className='buttons__action'
                                onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </> : null
                }
            </div>
        </div>
    )
}

export default PopUpWindow