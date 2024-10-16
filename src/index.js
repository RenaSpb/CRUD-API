"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = require("./users");
const uuid_1 = require("uuid");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const requestListener = (req, res) => {
    const url = req.url;
    const method = req.method;
    const urlParts = url ? url.split('/') : [];
    const userId = urlParts[3];
    if (url === '/api/users' && method === 'GET') {
        const users = (0, users_1.getAllUsers)();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    }
    else if (method === 'GET' && urlParts[2] === 'users' && userId) {
        if (!(0, uuid_1.validate)(userId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid userId format' }));
            return;
        }
        const user = (0, users_1.getUserById)(userId);
        if (user) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User not found' }));
        }
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
};
const server = http_1.default.createServer(requestListener);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
