//reset counts (to start from beginning)
function Reset(email, password, username) {
	ScriptProperties.setProperty(username + "_sa", "-1");
	ScriptProperties.setProperty(username + "_sb", "0");
	sendTweet("TopSurfer\n" + username + "\n" + SurfBalance(email, password).split("~||~").join("\n"));
}

function SurfLogin(email, password) {
	//call login.php and get cookies
	var aUrl = "http://topsurfer.com/login.php";
	response = UrlFetchApp.fetch(aUrl);
	
	//remove extra data from cookies: currently only PHPSESSID
	var cookie = response.getAllHeaders()["Set-Cookie"];
	cookie = cookie.substring(0, cookie.indexOf(";"));
	
	var options = {
			method: "POST",
			payload: {
				username: email,
				password: password,
				next: "Log+In"
			},
			headers: {cookie : cookie}
		};
	for(var i = 0; i < 3; i++) {
		response = UrlFetchApp.fetch(aUrl, options);
		if(response.getContentText().indexOf("Cancel Your Account") > 0)
			return cookie;
	}
//	GmailApp.sendEmail("__email__", "TopSurfer login failed", JSON.stringify(response.getAllHeaders()) + '\n\n' + response.getContentText());
	return null;
}

function sendTweet(tweet){
	UrlFetchApp.fetch("__GAS tweet endpoint; see apps-script-misc/Twitter.js__?tweet=" + encodeURIComponent(tweet));
}

function authorize() {
	// Authorize to Twitter
	var oauthConfig = UrlFetchApp.addOAuthService("twitter");
	oauthConfig.setAccessTokenUrl("https://api.twitter.com/oauth/access_token");
	oauthConfig.setRequestTokenUrl("https://api.twitter.com/oauth/request_token");
	oauthConfig.setAuthorizationUrl("https://api.twitter.com/oauth/authorize");
	oauthConfig.setConsumerKey('__key__');
	oauthConfig.setConsumerSecret('__secret__');
}