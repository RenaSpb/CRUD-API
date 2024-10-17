import http from 'http';
import dotenv from 'dotenv';
import { getAllUsers, getUserById, createUser, updateUser, isValidUUID, deleteUser } from './users';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

dotenv.config();

const PORT = process.env.PORT || 3000;

const sendJsonResponse = (res: http.ServerResponse, statusCode: number, data: any) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const handleServerError = (res: http.ServerResponse, error: Error) => {
    console.error('Server error:', error);
    sendJsonResponse(res, 500, { message: 'Internal server error' });
};

const handleGetAllUsers = (res: http.ServerResponse) => {
    try {
        const users = getAllUsers();
        sendJsonResponse(res, 200, users);
    } catch (error) {
        handleServerError(res, error as Error);
    }
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
            handleServerError(res, error as Error);
        }
    });
};

const handleGetUserById = (res: http.ServerResponse, userId: string) => {
    try {
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
    } catch (error) {
        handleServerError(res, error as Error);
    }
};

const handleUserUpdate = (req: http.IncomingMessage, res: http.ServerResponse, userId: string) => {
    if (!isValidUUID(userId)) {
        sendJsonResponse(res, 400, { message: 'Invalid userId format' });
        return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const userData = JSON.parse(body);
            const updatedUser = updateUser(userId, userData);
            if (updatedUser) {
                sendJsonResponse(res, 200, updatedUser);
            } else {
                sendJsonResponse(res, 404, { message: 'User not found' });
            }
        } catch (error) {
            handleServerError(res, error as Error);
        }
    });
};

const handleDeleteUser = (res: http.ServerResponse, userId: string) => {
    try {
        if (!isValidUUID(userId)) {
            sendJsonResponse(res, 400, { message: 'Invalid userId format' });
            return;
        }

        const userDeleted = deleteUser(userId);
        if (userDeleted) {
            res.writeHead(204);
            res.end();
        } else {
            sendJsonResponse(res, 404, { message: 'User not found' });
        }
    } catch (error) {
        handleServerError(res, error as Error);
    }
};

const requestListener = (req: http.IncomingMessage, res: http.ServerResponse) => {
    try {
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
        } else if (method === 'PUT' && urlParts[2] === 'users' && userId) {
            handleUserUpdate(req, res, userId);
        } else if (method === 'DELETE' && urlParts[2] === 'users' && userId) {
            handleDeleteUser(res, userId);
        } else {
            sendJsonResponse(res, 404, { message: 'Endpoint not found' });
        }
    } catch (error) {
        handleServerError(res, error as Error);
    }
};

export const server = http.createServer(requestListener);

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
