"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = require("os");
const http_1 = __importDefault(require("http"));
const indexModule = __importStar(require("./index"));
const createServer = indexModule.createServer;
const numCPUs = (0, os_1.cpus)().length - 1;
const BASE_PORT = 4000;
if (cluster_1.default.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    let currentWorker = 0;
    const workerPorts = new Map();
    const loadBalancer = http_1.default.createServer((req, res) => {
        const workers = cluster_1.default.workers;
        if (!workers) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('No workers available');
            return;
        }
        const workerIds = Object.keys(workers).map(Number);
        if (workerIds.length === 0) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('No workers available');
            return;
        }
        const workerIndex = currentWorker % workerIds.length;
        const workerId = workerIds[workerIndex];
        const workerPort = workerPorts.get(workerId);
        if (!workerPort) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Worker not ready');
            return;
        }
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
        currentWorker = (currentWorker + 1) % workerIds.length;
    });
    loadBalancer.listen(BASE_PORT, () => {
        console.log(`Load balancer listening on port ${BASE_PORT}`);
    });
    for (let i = 0; i < numCPUs; i++) {
        const worker = cluster_1.default.fork();
        worker.on('message', (msg) => {
            if (msg.port) {
                workerPorts.set(worker.id, msg.port);
            }
        });
    }
    cluster_1.default.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        workerPorts.delete(worker.id);
        const newWorker = cluster_1.default.fork();
        newWorker.on('message', (msg) => {
            if (msg.port) {
                workerPorts.set(newWorker.id, msg.port);
            }
        });
    });
}
else {
    const server = createServer();
    server.listen(0, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
            console.log(`Worker ${process.pid} is listening on port ${address.port}`);
            if (process.send) {
                process.send({ port: address.port });
            }
        }
    });
}
