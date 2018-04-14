PROPS = PropertiesService.getScriptProperties();

function gokano(email, password) {
	var user = email.substring(0, email.indexOf("@"));

	var nav = new Navigator.Navigator("https://www.gokano.com");
	nav.setSaveCookies(true);
	nav.setCookieUsername(email);
	nav.setLoginPath("login");
	nav.setLoginPayload({
		email: email,
		password: password
	});
	nav.setLogoutIndicator("password_reset");
	nav.setRefetchOnLogin(true);

	// starting points
	var str = nav.doGet("daily");
	if (str.indexOf("Get daily GN now") > 0) {
		str = nav.doGet("daily");
		if (str.indexOf("Get daily GN now") > 0) {
			sendTweet("Gokano\n" + user + "\nDaily GN failed");
		}
	}
	var points = getPoints(str);
/*
	// new messages?
	var pos = str.indexOf("<h1");
	if (pos < 0) { // error
		sendTweet("Gokano\nPosts missing");
	}
	pos = str.indexOf(">", pos) + 1;
	var head = str.substring(pos, str.indexOf("</h1>", pos));
	pos = str.indexOf(">", str.indexOf("<span", pos)) + 1;
	var date = str.substring(pos, str.indexOf("</span>", pos));
	pos = str.indexOf(">", str.indexOf("<p", pos)) + 1;
	var text = str.substring(pos, str.indexOf("</p>", pos));
	var msg = date + "\n" + head + "\n" + text;
	if (msg != PROPS.getProperty("gokano_latest")) { // changed!
		sendAlert("Gokano\n" + msg);
		PROPS.setProperty("gokano_latest", msg);
	}
*/
	for (var i = 1; i < 1000; i++) {
		// mission page
		var body = nav.doGet("missions/daily?page=" + i);
		var pos = body.indexOf("non-completed") + 1;
		while (pos > 0) {
			// POST URL
			var inPos = body.indexOf("response/", pos);
			var postUrl = body.substring(inPos, body.indexOf('"', inPos));

			// generate multipart payload
			var sep = "---------------------------9324880991440388881281901329";
			var payload = "--" + sep + "\n";

			payload += 'Content-Disposition: form-data; name="_token"\n\n';
			inPos = body.indexOf('value=', inPos) + 7;
			payload += body.substring(inPos, body.indexOf('"', inPos)); // token

			payload += "\n--" + sep + '\nContent-Disposition: form-data; name="response"\n\n';
			inPos = body.indexOf('value=', inPos) + 7;	 // first answer
			if (Math.random() > 0.5) {
				inPos = body.indexOf('value=', inPos) + 7; // sometimes pick second answer
			}
			payload += body.substring(inPos, body.indexOf('"', inPos));

			payload += "\n--" + sep + "--";

			var resp = nav.doPost(postUrl, payload, {contentType: "multipart/form-data; boundary=" + sep});
			points = getPoints(resp);
			pos = body.indexOf("non-completed", pos) + 1; // next question
		}

		if (body.indexOf("answered already") > 0 || body.indexOf("expired") > 0) { // expired list reached
			break;
		}
	}

	var pointKey = "gokano_points_" + email;
	if (parseInt(points) >= parseInt(PROPS.getProperty(pointKey)) + 2) {
		PROPS.setProperty("gokano_" + email, true);
		PROPS.setProperty(pointKey, points);
		if (user.match("__main user ID__")) {
//			sendTweet("Gokano\n" + user + "\n" + points);
		}
	}
}

function getPoints(text) {
	var inPos = text.indexOf("<div>", text.indexOf("your points:")) + 5;
	var points = text.substring(inPos, text.indexOf("</div>", inPos));
	inPos = text.indexOf("<div>", inPos) + 5;
	points += "\n" + text.substring(inPos, text.indexOf("</div>", inPos));
	return points;
}
