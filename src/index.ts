import http from 'http';
import dotenv from 'dotenv';
import { getAllUsers, getUserById } from './users';
import { validate as uuidValidate } from 'uuid';

dotenv.config();

const PORT = process.env.PORT || 3000;

const requestListener = (req: http.IncomingMessage, res: http.ServerResponse) => {
    const url = req.url;
    const method = req.method;
    const urlParts = url ? url.split('/') : [];
    const userId = urlParts[3];

    if (url === '/api/users' && method === 'GET') {
        const users = getAllUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    } else if (method === 'GET' && urlParts[2] === 'users' && userId) {
        if (!uuidValidate(userId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid userId format' }));
            return;
        }

        const user = getUserById(userId);
        console.log('User found:', user); // Это поможет понять, что возвращает функция
        if (user) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User not found' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
};

const server = http.createServer(requestListener);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
