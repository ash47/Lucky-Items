// Checks if number is a valid integer
exports.isNumber = function(number) {
	var regex = /^\d+$/;
	if ( regex.test( number ) )
		return true;
	return false;
}

// Returns a number between 0 and number
exports.getRandomNumber = function(number) {
	return Math.floor( Math.random() * number );
}

// Returns a number between 1 and number
exports.getRandomNumberExcludeZero = function(number) {
	return Math.floor( Math.random() * number ) + 1;
}

// Checks whether a flag exists in a bitmask
exports.containsFlag = function(flags, flag) {
    return (flags & flag) === flag;
}

// Converts Minutes to Seconds 5:00 to 300
exports.convertMinutesToSeconds = function(input) {
    var parts = input.split(':'),
        minutes = +parts[0],
        seconds = +parts[1];
    return (minutes * 60 + seconds);
}

exports.convertSecondsToMinutes = function(a) {
	var b = Math.floor( a / 60);
	a %= 60;
	return ( 10 > b ? "0" + b : b ) + ":" + ( 10 > a ? "0" + a : a );
}

// Selects a random element out of an array
exports.randomElement = function(input) {
    return input[Math.floor(Math.random() * input.length)];
}

exports.flipNumber = function(number) {
	return (Math.round(Math.random()) === 0 ? -number : number);
}

exports.shuffle = function(o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

exports.capitaliseFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


exports.getConnectedPlayerIDs = function(teamID) {
	var playing = [];
	for (var i = 0; i < server.clients.length; ++i)
	{
		var client = server.clients[i];
		if (client === null)
			continue;

		if (!client.isInGame())
			continue;

		var playerID = client.netprops.m_iPlayerID;
		if (playerID === -1)
			continue;

		if (!teamID)
			playing.push(playerID);
		else {
			if (client.netprops.m_iTeamNum === teamID)
				playing.push(playerID);
		}
	}
	return playing;
}

exports.objToString = function(obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + ': ' + obj[p] + ' ';
        }
    }
    return str;
}