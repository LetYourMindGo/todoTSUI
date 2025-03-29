import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { createUser, getUserID } from './routes/users';
import { cancelShareList, createList, deleteList, getListData, getUserLists, shareList, updateListName } from './routes/lists';
import { initTodoSocket } from './sockets/todoSockets';
import { config } from 'dotenv';

config();
const PORT = 3000;
const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

app.post('/users/:username', getUserID);
app.post('/users', createUser);

app.get('/todoLists/:listID', getListData);
app.get('/userLists/:userID', getUserLists);
app.put('/todoLists/:listID', updateListName);
app.post('/todoLists', createList);
app.post('/todoLists/share/:listID', shareList);
app.delete('/todoLists/share/:listID', cancelShareList);
app.delete('/todoLists/:listID', deleteList);

initTodoSocket(server);

server.listen(PORT, () => {
  console.log(`Server running at PORT: ${PORT}`);
});
