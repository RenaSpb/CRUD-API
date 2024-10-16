import http from 'http';
import dotenv from 'dotenv';
import { getAllUsers, getUserById, createUser } from './users';
import { validate as uuidValidate } from 'uuid';

dotenv.config();

const PORT = process.env.PORT || 3000;

const sendJsonResponse = (res: http.ServerResponse, statusCode: number, data: any) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const handleGetAllUsers = (res: http.ServerResponse) => {
    const users = getAllUsers();
    sendJsonResponse(res, 200, users);
};

const handleCreateUser = (req: http.IncomingMessage, res: http.ServerResponse) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const userData = JSON.parse(body);
            if (!userData.username || !userData.age || !Array.isArray(userData.hobbies)) {
                sendJsonResponse(res, 400, { message: 'Missing required fields' });
                return;
            }
            const newUser = createUser(userData);
            sendJsonResponse(res, 201, newUser);
        } catch (error) {
            sendJsonResponse(res, 400, { message: 'Invalid JSON in request body' });
        }
    });
};

const handleGetUserById = (res: http.ServerResponse, userId: string) => {
    if (!uuidValidate(userId)) {
        sendJsonResponse(res, 400, { message: 'Invalid userId format' });
        return;
    }
    const user = getUserById(userId);
    if (user) {
        sendJsonResponse(res, 200, user);
    } else {
        sendJsonResponse(res, 404, { message: 'User not found' });
    }
};

const requestListener = (req: http.IncomingMessage, res: http.ServerResponse) => {
    const url = req.url;
    const method = req.method;
    const urlParts = url?.split('/') || [];
    const userId = urlParts[3];

    if (url === '/api/users' && method === 'GET') {
        handleGetAllUsers(res);
    } else if (url === '/api/users' && method === 'POST') {
        handleCreateUser(req, res);
    } else if (method === 'GET' && urlParts[2] === 'users' && userId) {
        handleGetUserById(res, userId);
    } else {
        sendJsonResponse(res, 404, { message: 'Not Found' });
    }
};

const server = http.createServer(requestListener);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
