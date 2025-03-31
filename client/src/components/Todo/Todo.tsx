import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Task, NewTask, TodoProps, ListUsers } from '../../types/types';
import './Todo.css';

const Todo = ({ listID }: TodoProps) => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    const [taskData, setTaskData] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState<string>('');
    const [listName, setListName] = useState<string>('');
    const [listUsers, setListUsers] = useState<ListUsers[]>([]);
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    const userID = Number(localStorage.getItem('userID'));

    useEffect(() => {
        if (!listID) return;
        
        socket.off('loadTasks');
        socket.off('loadListUsers');

        socket.emit('joinList', listID, userID);

        socket.on('loadTasks', (listName: string, tasksData: Task[]) => {
            setListName(listName);
            setTaskData(tasksData);
        });

        socket.on('loadListUsers', (listUsers: ListUsers[]) => { 
            setListUsers(listUsers);
        });

        return () => {
            socket.off('loadTasks');
            socket.off('loadListUsers');
        };
    }, [listID]);

    const handleAddTask = () => {
        if (newTask.trim()) {
            const task: NewTask = {
                description: newTask,
                listID: listID,
            };

            socket.emit('addTask', userID, { task });
            setNewTask('');
        }
    };

    const handleToggleTask = (taskID: number, isDone: boolean) => {
        socket.emit('updateTaskStatus', { taskID, isDone, listID })
    }

    const handleDeleteTask = (taskID: number) => {
        return(event: React.MouseEvent) => {
            socket.emit('deleteTask', { taskID, listID });
            event.preventDefault();
        };
    };

    const handleKickUser = (username: string) => {
        return(event: React.MouseEvent) => {
            socket.emit('kickUser', { listID, username });
            event.preventDefault();
        }
    }
    
    return (
        <div className='todo-container'>
            <div className='todo-container__header'>
                <h3 className='header__list-name'>{listName}</h3>
                <ul className='header__user-list'>
                    <p className='user-list__header'>Participants:</p>
                    {listUsers.map(user => (
                        <div className='user-list__item' key={user.username}>
                            <li className='user-list__user'>
                                {user.username} ({user.role})
                            </li>
                            <button className='user-list__kick-user-button' onClick={handleKickUser(user.username)}>❌</button>
                        </div>
                    ))}
                </ul>
            </div>
            <div className='todo-container__new-task'>
                <input className='new-task__input'
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="New task..."
                />
                <button className='new-task__action-button' onClick={handleAddTask}>Add</button>
            </div>
            {taskData.length === 0 ? (
                <h3 className='todo-container__placeholder'>Add your first task</h3>
            ) : (
                <ul className='todo-container__task-list'>
                    {taskData.map(task => (
                        <li className={`task-list__item ${task.isdone ? 'done' : ''}`}
                         key={task.taskid}>
                            <input className='item__checkbox'
                                    type='checkbox'
                                    checked={task.isdone}
                                    onChange={() => handleToggleTask(task.taskid, !task.isdone)}
                            />
                            <p className='item__text'>{task.description}</p>
                            <button className='item__remove-task-button' onClick={handleDeleteTask(task.taskid)}>❌</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Todo;
