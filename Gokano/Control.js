props = PropertiesService.getScriptProperties();

function runGokano() {
	user = next("GK");
	if (!props.getProperty("gokano_" + user[0])) {
		gokano(user[0], user[1]);
	}
}

function resetGokano() {
	users = JSON.parse(props.getProperty("users"));
	for (i in users) {
		props.deleteProperty("gokano_" + users[i][0]);
	}
}

function next(type) {
	users = JSON.parse(props.getProperty("users"));
	lock = LockService.getScriptLock();
	try {
		locked = lock.tryLock(1000);
		if (!locked) {
			throw {message: "Locking failed"};
		}
		pos = parseInt(props.getProperty(type)) || 0;
		pos++;
		if (pos == users.length) {
			pos = 0;
		}
		props.setProperty(type, pos);
		return users[pos];
	} finally {
		lock.releaseLock();
	}
}
