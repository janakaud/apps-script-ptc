function SurfBar(email, password, username) {
	var key = username + '_sb';
	var i = parseInt(ScriptProperties.getProperty(key));
	if (i >= 200)
		return;

	//try login; quit if failed
	var cookie = SurfLogin(email, password);
	if(!cookie) {
		return;
	}
	
	var options = {
		"method": "GET",
		"host": "topsurfer.com",
		"headers": {
			"referer": "http://topsurfer.com/sb.php",
			"cookie": cookie
		}
	};
	var response, str, arr;
	
	//try as many ads as possible, up to daily limit (200)
	while(i < 200) {
		//get next ad
		response = UrlFetchApp.fetch("http://topsurfer.com/nextsb.php?u=" + username + "&tt=" + new Date().getTime(), options);
		
		Utilities.sleep(15000);
		
		//validate
		arr = response.getContentText().split('***||***');
		i++;
		ScriptProperties.setProperty(key, i);
		response = UrlFetchApp.fetch("http://topsurfer.com/recordsb.php?e=" + arr[0] + "&" + new Date().getTime(), options);
		
		str = response.getContentText().substring(0, 30);
		Logger.log(str);
		if(str.indexOf("time") >= 0) { //error
			GmailApp.sendEmail("__email__", username + " SurfBar " + str, username + " SurfBar " + str);
		}
	}
}