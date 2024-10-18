"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = require("./users");
const uuid_1 = require("uuid");
dotenv_1.default.config();
const PORT = 4000;
const NUM_CPUS = os_1.default.cpus().length;
const sendJsonResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};
const handleServerError = (res, error) => {
    sendJsonResponse(res, 500, { message: 'Internal server error' });
};
const handleGetAllUsers = (res) => {
    try {
        const users = (0, users_1.getAllUsers)();
        sendJsonResponse(res, 200, users);
    }
    catch (error) {
        handleServerError(res, error);
    }
};
const handleCreateUser = (req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const userData = JSON.parse(body);
            if (!userData.username || !userData.age || !Array.isArray(userData.hobbies)) {
                sendJsonResponse(res, 400, { message: 'Missing required fields' });
                return;
            }
            const newUser = (0, users_1.createUser)(userData);
            sendJsonResponse(res, 201, newUser);
        }
        catch (error) {
            handleServerError(res, error);
        }
    });
};
const handleGetUserById = (res, userId) => {
    try {
        if (!(0, uuid_1.validate)(userId)) {
            sendJsonResponse(res, 400, { message: 'Invalid userId format' });
            return;
        }
        const user = (0, users_1.getUserById)(userId);
        if (user) {
            sendJsonResponse(res, 200, user);
        }
        else {
            sendJsonResponse(res, 404, { message: 'User not found' });
        }
    }
    catch (error) {
        handleServerError(res, error);
    }
};
const handleUserUpdate = (req, res, userId) => {
    if (!(0, users_1.isValidUUID)(userId)) {
        sendJsonResponse(res, 400, { message: 'Invalid userId format' });
        return;
    }
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const userData = JSON.parse(body);
            const updatedUser = (0, users_1.updateUser)(userId, userData);
            if (updatedUser) {
                sendJsonResponse(res, 200, updatedUser);
            }
            else {
                sendJsonResponse(res, 404, { message: 'User not found' });
            }
        }
        catch (error) {
            handleServerError(res, error);
        }
    });
};
const handleDeleteUser = (res, userId) => {
    try {
        if (!(0, users_1.isValidUUID)(userId)) {
            sendJsonResponse(res, 400, { message: 'Invalid userId format' });
            return;
        }
        const userDeleted = (0, users_1.deleteUser)(userId);
        if (userDeleted) {
            res.writeHead(204);
            res.end();
        }
        else {
            sendJsonResponse(res, 404, { message: 'User not found' });
        }
    }
    catch (error) {
        handleServerError(res, error);
    }
};
const requestListener = (req, res) => {
    try {
        const url = req.url;
        const method = req.method;
        const urlParts = (url === null || url === void 0 ? void 0 : url.split('/')) || [];
        const userId = urlParts[3];
        if (url === '/api/users' && method === 'GET') {
            handleGetAllUsers(res);
        }
        else if (url === '/api/users' && method === 'POST') {
            handleCreateUser(req, res);
        }
        else if (method === 'GET' && urlParts[2] === 'users' && userId) {
            handleGetUserById(res, userId);
        }
        else if (method === 'PUT' && urlParts[2] === 'users' && userId) {
            handleUserUpdate(req, res, userId);
        }
        else if (method === 'DELETE' && urlParts[2] === 'users' && userId) {
            handleDeleteUser(res, userId);
        }
        else {
            sendJsonResponse(res, 404, { message: 'Endpoint not found' });
        }
    }
    catch (error) {
        handleServerError(res, error);
    }
};
const createWorkerServer = (port) => {
    const server = http_1.default.createServer(requestListener);
    server.listen(port, () => {
        console.log(`Worker server is running on port ${port}`);
    });
    return server;
};
const createLoadBalancer = (workers) => {
    let current = 0;
    const server = http_1.default.createServer((req, res) => {
        const workerPort = workers[current];
        current = (current + 1) % workers.length;
        const options = {
            hostname: 'localhost',
            port: workerPort,
            path: req.url,
            method: req.method,
            headers: req.headers
        };
        const proxyReq = http_1.default.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });
        req.pipe(proxyReq, { end: true });
    });
    server.listen(PORT, () => {
        console.log(`Load balancer is running on port ${PORT}`);
    });
    return server;
};
if (cluster_1.default.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    const workerPorts = [];
    for (let i = 1; i < NUM_CPUS; i++) {
        const workerPort = PORT + i;
        cluster_1.default.fork({ PORT: workerPort });
        workerPorts.push(workerPort);
    }
    createLoadBalancer(workerPorts);
    cluster_1.default.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
}
else {
    const workerPort = parseInt(process.env.PORT || '4001');
    createWorkerServer(workerPort);
}
