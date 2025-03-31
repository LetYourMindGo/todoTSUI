import { Server as HttpServer } from 'http';
import { Task } from "../types/types";
import { pool } from "../dbconfig/dbconfig";
import { Server, Socket } from "socket.io";

export const initTodoSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
	 	origin: '*',
       		methods: ['GET', 'POST']
	},
	transports: ['websocket', 'polling']
    });
    const lists: Record<string, Task[]> = {};
    let listName: string = '';

    io.on('connection', (socket: Socket) => {
        console.log('User has connected:', socket.id);

        socket.on('joinList', async (listID, userID) => {
            socket.join(listID);
            console.log(`User ${socket.id} wants to join list ${listID}`);

            try {
                const listCheck = await pool.query(
                    'SELECT 1 FROM todolists WHERE listID = $1',
                    [listID]
                );
                if (listCheck.rowCount === 0) {
                    socket.emit('error', `List with ID ${listID} does not exist.`);
                    return;
                };

                const accessCheck = await pool.query(
                    'SELECT \
                        CASE \
                            WHEN EXISTS ( \
                                SELECT 1 \
                                FROM todoLists l \
                                WHERE l.listID = $1 AND l.ownerID = $2 \
                            ) OR EXISTS ( \
                                SELECT 1 \
                                FROM shared_lists sl \
                                WHERE sl.listID = $1 AND sl.userID = $2 \
                            ) \
                            THEN true \
                            ELSE false \
                        END AS access',
                        [listID, userID]
                );
                if (!accessCheck.rows[0].access) {
                    socket.emit('error', `No access for user with ID ${userID} to list with ID ${listID}`);
                    return;
                }

                const listNameData = await pool.query(
                    'SELECT listName FROM todolists WHERE listID = $1',
                    [listID]
                );
                listName = listNameData.rows[0].listname;
                
                const listUsersData = await pool.query(
                    "SELECT \
                        u.username, \
                        'owner' AS role \
                    FROM todoLists l \
                    JOIN users u ON l.ownerID = u.userID \
                    WHERE l.listID = $1 \
                    UNION \
                    SELECT \
                        u.username, \
                        'guest' AS role \
                    FROM shared_lists s \
                    JOIN users u ON s.userID = u.userID \
                    WHERE s.listID = $1",
                    [listID]
                );
                const listUsers = listUsersData.rows;

                const tasksResult = await pool.query(
                    'SELECT * FROM tasks WHERE listID = $1',
                    [listID]
                );
                if (!lists[listID]) {
                    lists[listID] = tasksResult.rows;
                };

                io.to(listID).emit('loadTasks', listName, tasksResult.rows);
                io.to(listID).emit('loadListUsers', listUsers)
            } catch (error) {
                console.error('Error fetching tasks:', error);
                socket.emit('error', 'Failed to load tasks');
            }
        });
    
        socket.on('addTask', async (userID, data) => {
            const { description, listID } = data.task;
            
            try {
                const accessCheck = await pool.query(
                    'SELECT \
                        CASE \
                            WHEN EXISTS ( \
                                SELECT 1 \
                                FROM todoLists l \
                                WHERE l.listID = $1 AND l.ownerID = $2 \
                            ) OR EXISTS ( \
                                SELECT 1 \
                                FROM shared_lists sl \
                                WHERE sl.listID = $1 AND sl.userID = $2 \
                            ) \
                            THEN true \
                            ELSE false \
                        END AS access',
                        [listID, userID]
                );
                if (!accessCheck.rows[0].access) {
                    socket.emit('error', `No access for user with ID ${userID} to list with ID ${listID}`);
                    return;
                }

            const result = await pool.query(
                'INSERT INTO tasks (listID, description) VALUES ($1, $2)\
                RETURNING *',
                [listID, description]
            );

            const listData = await pool.query(
                'SELECT listName FROM todolists WHERE listID = $1',
                [listID]
            );
            listName = listData.rows[0].listname;

            const newTask = result.rows[0];
    
            lists[listID].push(newTask);
            console.log('listName:', listName);
            io.to(listID).emit('loadTasks', listName, lists[listID]);
            } catch (err) {
            console.error('Error while adding the task:', err);
            }
        });
    
        socket.on('updateTaskStatus', async (data) => {
        const { taskID, isDone, listID } = data;
    
        try {
            await pool.query(
                'UPDATE tasks SET isDone = $1 WHERE taskID = $2',
                [isDone, taskID]
            );

            const updatedTasks = await pool.query(
                "SELECT * FROM tasks WHERE listid = $1",
                [listID]
            );

            console.log('updatedTAsks:', updatedTasks);

            const listNameData = await pool.query(
                'SELECT listName FROM todolists WHERE listID = $1',
                [listID]
            );
            listName = listNameData.rows[0].listname;

            io.to(listID).emit('loadTasks', listName, updatedTasks.rows);
        } catch (err) {
            console.error('Error while updating the task:', err);
        }
        });
    
        socket.on('deleteTask', async (data) => {
            const { taskID, listID } = data;
        
            try {
                await pool.query('DELETE FROM tasks WHERE taskid = $1', [taskID]);

                const listNameData = await pool.query(
                    'SELECT listName FROM todolists WHERE listID = $1',
                    [listID]
                );
                listName = listNameData.rows[0].listname;

                lists[listID] = lists[listID].filter(task => task.taskid !== taskID);
        
                io.to(listID).emit('loadTasks', listName, lists[listID]);
            } catch (err) {
                console.error('Error while deleting the task:', err);
            }
        });

        socket.on('kickUser', async (data) => {
            const { listID, username } = data;

            try {
                await pool.query(
                    'DELETE \
                    FROM shared_lists \
                    WHERE listID = $1 AND \
                        userID = (SELECT userID \
                                    FROM users \
                                    WHERE username = $2)',
                    [listID, username]
                );

                const listUsersData = await pool.query(
                    "SELECT \
                        u.username, \
                        'owner' AS role \
                    FROM todoLists l \
                    JOIN users u ON l.ownerID = u.userID \
                    WHERE l.listID = $1 \
                    UNION \
                    SELECT \
                        u.username, \
                        'guest' AS role \
                    FROM shared_lists s \
                    JOIN users u ON s.userID = u.userID \
                    WHERE s.listID = $1",
                    [listID]
                );
                const listUsers = listUsersData.rows;

                io.to(listID).emit('loadListUsers', listUsers)
            } catch (err) {
                console.error('Error while deleting the task:', err);
            }
        });
    
        socket.on('disconnect', () => {
        console.log('User has left:', socket.id);
        });

    });

};
