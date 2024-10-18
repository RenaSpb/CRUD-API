import cluster from 'cluster';
import { cpus } from 'os';
import http from 'http';
import * as indexModule from './index';

const createServer = indexModule.createServer;
const numCPUs = cpus().length - 1;
const BASE_PORT = 4000;

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    let currentWorker = 0;
    const workerPorts = new Map<number, number>();

    const loadBalancer = http.createServer((req, res) => {
        const workers = cluster.workers;
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

        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode!, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        req.pipe(proxyReq, { end: true });

        currentWorker = (currentWorker + 1) % workerIds.length;
    });

    loadBalancer.listen(BASE_PORT, () => {
        console.log(`Load balancer listening on port ${BASE_PORT}`);
    });

    for (let i = 0; i < numCPUs; i++) {
        const workerPort = BASE_PORT + i + 1;
        const worker = cluster.fork({ WORKER_PORT: workerPort });

        worker.on('message', (msg: { port: number }) => {
            if (msg.port) {
                workerPorts.set(worker.id, msg.port);
            }
        });
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        workerPorts.delete(worker.id);
        const newWorkerPort = BASE_PORT + worker.id; // Keep the port logic for new workers
        const newWorker = cluster.fork({ WORKER_PORT: newWorkerPort });
        newWorker.on('message', (msg: { port: number }) => {
            if (msg.port) {
                workerPorts.set(newWorker.id, msg.port);
            }
        });
    });
} else {
    const port = process.env.WORKER_PORT || 0;
    const server = createServer();
    server.listen(port, () => {
        console.log(`Worker ${process.pid} is listening on port ${port}`);
        if (process.send) {
            process.send({ port });
        }
    });
}
