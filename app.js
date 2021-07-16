const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const express = require("express");

const app = express();
const port = 8000;

cluster.schedulingPolicy = cluster.SCHED_RR;

if (cluster.isMaster) {
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Handles a Cluster Crash
    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker %d died with code/signal %s. Restarting worker...', worker.process.pid, signal || code);
        cluster.fork();
    });

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    console.log(`Worker ${process.pid} started`);

    require("./config/mongoose");
    require('./api/services/cache');

    bodyParser = require("body-parser");

    const api = require("./api/api");

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
            "Access-Control-Allow-Methods",
            "OPTIONS, GET, POST, PUT, PATCH, DELETE"
        );
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, refresh-token");
        next();
    });

    app.use(api);

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}