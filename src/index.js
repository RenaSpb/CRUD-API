"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = require("./users");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const requestListener = (req, res) => {
    if (req.url === '/api/users' && req.method === 'GET') {
        const users = (0, users_1.getAllUsers)();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
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
