import nconf = require('nconf');
import I = require('../Interfaces');

class Settings implements I.Settings {
	get initTimerMs(): number {
		return nconf.get('initTimerMs');
	}
	get gameServerUri(): string {
		return nconf.get('gameServerUri');
	}
	get timeoutForRequestPost(): number {
		return nconf.get('timeoutForRequestPost');
	}
	get gameDurationMs(): number {
		return nconf.get('gameDurationMs');
	}
	get playerStatsUri(): string {
		return nconf.get('playerStatsUri');
	}
	get graylog2(): I.Graylog2 {
		return nconf.get('graylog2');
	}
}

let defaultSettings: I.Settings = {
	initTimerMs: 1000,
	gameDurationMs: 70000, 
	gameServerUri: "http://127.0.0.1",
	playerStatsUri: "http://127.0.0.1:10500/v1",
	timeoutForRequestPost: 60000,
	graylog2: {
		name: "Graylog",
		level: "debug",
		graylog: {
			servers: [{
				host: "analytics.beta.maestrosgame.com",
				port: 12201
			}],
			facility: "MockUdkServer",
		},
        staticMeta: { shard: 'local' }
	}
};

nconf.file('./config/settings.json')
    .defaults(defaultSettings);

let settings: I.Settings = new Settings();
export = settings;