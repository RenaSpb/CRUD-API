import http from 'http';
import cluster from 'cluster';
import os from 'os';
import dotenv from 'dotenv';
import { getAllUsers, getUserById, createUser, updateUser, isValidUUID, deleteUser } from './users';
import { validate as uuidValidate } from 'uuid';

dotenv.config();

const PORT = 4000;
const NUM_CPUS = os.cpus().length;

const sendJsonResponse = (res: http.ServerResponse, statusCode: number, data: any) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const handleServerError = (res: http.ServerResponse, error: unknown) => {
    sendJsonResponse(res, 500, { message: 'Internal server error' });
};

const handleGetAllUsers = (res: http.ServerResponse) => {
    try {
        const users = getAllUsers();
        sendJsonResponse(res, 200, users);
    } catch (error) {
        handleServerError(res, error);
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
            handleServerError(res, error);
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
        handleServerError(res, error);
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
            handleServerError(res, error);
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
        handleServerError(res, error);
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
        handleServerError(res, error);
    }
};

const createWorkerServer = (port: number): http.Server => {
    const server = http.createServer(requestListener);
    server.listen(port, () => {
        console.log(`Worker server is running on port ${port}`);
    });
    return server;
};

const createLoadBalancer = (workers: number[]): http.Server => {
    let current = 0;
    const server = http.createServer((req, res) => {
        const workerPort = workers[current];
        current = (current + 1) % workers.length;

        const options: http.RequestOptions = {
            hostname: 'localhost',
            port: workerPort,
            path: req.url,
            method: req.method,
            headers: req.headers
        };

        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode!, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        req.pipe(proxyReq, { end: true });
    });

    server.listen(PORT, () => {
        console.log(`Load balancer is running on port ${PORT}`);
    });

    return server;
};

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    const workerPorts: number[] = [];

    for (let i = 1; i < NUM_CPUS; i++) {
        const workerPort = PORT + i;
        cluster.fork({ PORT: workerPort });
        workerPorts.push(workerPort);
    }

    createLoadBalancer(workerPorts);

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    const workerPort = parseInt(process.env.PORT || '4001');
    createWorkerServer(workerPort);
}
