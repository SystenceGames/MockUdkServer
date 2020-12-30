export interface Settings {
	initTimerMs: number;
	gameServerUri: string;
	playerStatsUri: string;
	timeoutForRequestPost: number;
	gameDurationMs: number;
	graylog2: Graylog2;
}

export interface Graylog2 {
	name: string;
	level: string;
	graylog: any;
    staticMeta: any;
}

export interface ConnectPlayerRequest {
	playerName: string;
	allyId: number;
}

export interface ConnectPlayerResponse {
	gameDurationMs: number;
}

export interface Player {
	playerName: string;
	allyId: number;
}

export interface ProcessEndGameStatsPlayer {
	PlayerName: string;
	Outcome: string;
	Commander: string;
	Race: string;
	AllyId: number;
	IsBot: boolean;
	Kills: number;
	Deaths: number;
	Assists: number;
}

export interface ProcessEndGameStatsRequest {
	MapName: string;
	GameLengthSeconds: number;
	GameLengthRealSeconds: number;
	NumHumanPlayers: number;
	NumBots: number;
	ExitCondition: string;
	PlayerStats: Array<ProcessEndGameStatsPlayer>;
	GameGUID: string;
}

export interface ProcessEndGameStatsPlayer {
	PlayerName: string;
	Outcome: string;
	Commander: string;
	Race: string;
	AllyId: number;
	IsBot: boolean;
	Kills: number;
	Deaths: number;
	Assists: number;
}
