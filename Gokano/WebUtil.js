function doGet(request) {
	props = PropertiesService.getScriptProperties();

	if(request.parameters.tweet) {
		result = sendAlert("" + request.parameters.tweet);

	} else if(request.parameters.username) {
		result = addUser("" + request.parameters.username, "" + request.parameters.password, props);
	}

	return ContentService.createTextOutput(result);
}

function addUser(username, password, props) {
	users = JSON.parse(props.getProperty("users")) || [];
	users.push(["" + username, "" + password]);
	props.setProperty("users", JSON.stringify(users));
	ScriptApp.newTrigger("runGokano").timeBased().everyHours(12).create();
	return users.length;
}
