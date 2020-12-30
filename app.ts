import express = require('express');
import morgan = require('morgan');
let bodyParser = require('body-parser');
import http = require('http');
import path = require('path');
import request = require('request');
import Q = require('q');

import I = require('./Interfaces');
import MockUdkServer = require('./MockUdkServer');

let logger = require('./logger');

let settings: I.Settings = require('./config/settings');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));

function successResponseHandler(responsePayload: any, res: express.Response) {
	res.json(responsePayload);
	res.status(200);
}

function failResponseHandler(err: any, res: express.Response) {
	logger.error(err);
	res.json(err);
	res.status(404);
}

app.post('/connectPlayer', (req, res) => {
	Q.fcall(() => {
		return mockUdkServer.connectPlayer(req.body);
	}).then((responsePayload: any) => {
		successResponseHandler(responsePayload, res);
	}).catch((error: any) => {
		failResponseHandler(error, res);
	});
});

process.on('uncaughtException', function (err: any) {
	logger.error(err.stack);
	logger.info("Node NOT Exiting...");
	debugger;
});

let gameArgs: Array<string> = process.argv[3].split("?");

let gameGUID: string;
let jobID: string;
let nodeLocalPort: string;
let playerStatsMethod: string;
let portString: string;
let gameGUIDKey: string = "gameGUID=";
let jobIDKey: string = "jobID=";
let nodeLocalPortKey: string = "nodeLocalPort=";
let playerStatsMethodKey: string = "playerStatsMethod=";
let portKey: string = "PORT=";

for (let i: number = 0; i < gameArgs.length; i++) {
	if (gameArgs[i].startsWith(gameGUIDKey)) {
		gameGUID = gameArgs[i].substring(gameGUIDKey.length);
	}
	if (gameArgs[i].startsWith(jobIDKey)) {
		jobID = gameArgs[i].substring(jobIDKey.length);
	}
	if (gameArgs[i].startsWith(nodeLocalPortKey)) {
		nodeLocalPort = gameArgs[i].substring(nodeLocalPortKey.length);
	}
	if (gameArgs[i].startsWith(playerStatsMethodKey)) {
		playerStatsMethod = gameArgs[i].substring(playerStatsMethodKey.length);
	}
}
for (let i: number = 0; i < process.argv.length; i++) {
	if (process.argv[i].startsWith(portKey)) {
		portString = process.argv[i].substring(portKey.length);
	}
}

let port: number = Number.parseInt(portString, 10);

if (port == null) {
    logger.error("There was an error parsing the port:" + portString + ", exiting...");
    process.exit();
}

logger.info("Listening on port: " + port);

app.listen(port);

logger.info("MockUdkServer has started");
let printableSettings: any = settings;
logger.info(JSON.stringify(printableSettings.__proto__, null, 2));

let mockUdkServer: MockUdkServer = new MockUdkServer(gameGUID, jobID, nodeLocalPort, playerStatsMethod);
mockUdkServer.init();