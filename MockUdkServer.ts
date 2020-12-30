import I = require('./Interfaces');
import request = require('request');
import settings = require('./config/settings');
import assert = require('assert');
import Q = require('q');

let logger = require('./logger');

class MockUdkServer {
	private gameGUID: string;
	private jobID: string;
	private nodeLocalPort: string;
	private playerStatsMethod: string;
	private connectedPlayers: Array<I.Player> = new Array<I.Player>();

	constructor(gameGUID: string, jobID: string, nodeLocalPort: string, playerStatsMethod: string) {
		this.gameGUID = gameGUID;
		this.jobID = jobID;
		this.nodeLocalPort = nodeLocalPort;
		this.playerStatsMethod = playerStatsMethod;
	}

	public init() {
		setTimeout(() => {
			this.sendStarted();
			this.scheduleEndGame();
		}, settings.initTimerMs);
	}

	public connectPlayer(request: any) {
		assert.ok(request.playerName != null, "connectPlayer missing playerName");
		assert.ok(request.allyId != null, "connectPlayer missing allyId");

		let connectPlayerRequest: I.ConnectPlayerRequest = {
			playerName: request.playerName,
			allyId: request.allyId
		};

		this.connectedPlayers.push({
			playerName: connectPlayerRequest.playerName,
			allyId: connectPlayerRequest.allyId
		});

		return {
			gameDurationMs: settings.gameDurationMs
		};
	}

	private scheduleEndGame() {
		setTimeout(() => {
			this.endGame();
		}, settings.gameDurationMs);
	}

	private endGame() {
        Q.fcall(() => {
            return this.sendProcessEndGameStats();
        }).then(() => {
            process.exit();
        }).catch((err: any) => {
            logger.error("ErrorProcessingEndGameStats", err)
            process.exit();
		});
	}

	private outcomeFromAllyId(allyId: number): string {
		if (allyId == 0) {
			return "Won";
		}

		return "Lost";
	}

	private buildPlayerStatsForGame(): I.ProcessEndGameStatsRequest {
		let processEndGameStatsPlayers: Array<I.ProcessEndGameStatsPlayer> = new Array<I.ProcessEndGameStatsPlayer>();
		for (let i: number = 0; i < this.connectedPlayers.length; i++) {
			let outcome: string = this.outcomeFromAllyId(this.connectedPlayers[i].allyId);
			let playerStats: I.ProcessEndGameStatsPlayer = {
				PlayerName: this.connectedPlayers[i].playerName,
				Outcome: outcome,
				Commander: "HiveLord",
				Race: "Alchemist",
				AllyId: this.connectedPlayers[i].allyId,
				IsBot: false,
				Kills: 1,
				Deaths: 2,
				Assists: 3
			};
			processEndGameStatsPlayers.push(playerStats);
		}

		let statsCall: I.ProcessEndGameStatsRequest = {
			MapName: "SacredArena",
			GameLengthSeconds: settings.gameDurationMs / 1000,
			GameLengthRealSeconds: settings.gameDurationMs / 1000,
			NumHumanPlayers: this.connectedPlayers.length,
			NumBots: 0,
			ExitCondition: "Normative",
			GameGUID: this.gameGUID,
			PlayerStats: processEndGameStatsPlayers
		};

		return statsCall;
	}

	private sendProcessEndGameStats(): Q.Promise<any> {
		let callingUrl: string = settings.playerStatsUri + '/' + this.playerStatsMethod;
        return this.call(callingUrl, { playerStats: JSON.stringify(this.buildPlayerStatsForGame()) });
	}

	private sendStarted(): Q.Promise<any> {
		let callingUrl: string = settings.gameServerUri + ":" + this.nodeLocalPort + '/GameInitialized'
		return this.call(callingUrl, { jobID: this.jobID });
	}

	private assertResponseIsValid(error: any, response: any, body: any, callingUrl: string) {
		if (error) {
			throw error;
			//throw  "Request Post to " + callingUrl + " has error in assertResponseIsValid()");
		}
		assert.ok(response != null, "Request Post to " + callingUrl + " has an empty response");
		assert.ok(body != null, "Request Post to " + callingUrl + " has an empty body");
		if (body.error) {
			throw new Error("Request to " + callingUrl + " Post Body has error in assertResponseIsValid(): " + body.error);
		}
	}

	private call(callingUrl: string, body: any): Q.Promise<any> {
		let deferred: Q.Deferred<any> = Q.defer<any>();
		logger.info("Sending request", { callingUrl: callingUrl, body: body });
		request.post({
			uri: callingUrl,
			timeout: settings.timeoutForRequestPost,
			strictSSL: false,
			json: true,
			form: body
		}, (error: any, response: any, body: any) => {
			try {
				this.assertResponseIsValid(error, response, body, callingUrl);
				deferred.resolve();
			} catch (err) {
				logger.error("MockUdkServerCallError", { callingUrl: callingUrl, body: body, response: response, error: err });
				deferred.reject(error);
				return;
			}
		});

		return deferred.promise;
	}
}
export = MockUdkServer;