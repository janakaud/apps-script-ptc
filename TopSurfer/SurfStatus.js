//check balance and account status
function SurfBalance(email, password) {
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
	var response = UrlFetchApp.fetch("http://topsurfer.com/getstats.php?" + new Date().getTime(), options);
	var str = response.getContentText();
	Logger.log(str);
	return str;
}

//check Solo Ads count for today
function SoloCount(email, password) {
	//try login; quit if failed
	var cookie = SurfLogin(email, password);
	if(!cookie) {
		return;
	}
	
	var options = {
		"method": "GET",
		"host": "topsurfer.com",
		"headers": {
			"cookie": cookie
		}
	};
	var response = UrlFetchApp.fetch("http://topsurfer.com/member.php", options);
	var text = response.getContentText();

	var value = text.match(/>\d+<\/div/);
	if(value) {
		text = value[0];
		value = text.substring(1, text.indexOf("<"));
		Logger.log(value);
	}
	return value;
}