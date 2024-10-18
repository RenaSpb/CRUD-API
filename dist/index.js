"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = require("./users");
const uuid_1 = require("uuid");
dotenv_1.default.config();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
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
const createServer = () => {
    return http_1.default.createServer(requestListener);
};
exports.server = createServer();
if (require.main === module) {
    exports.server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
