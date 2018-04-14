//view Solo Ads incrementally (requires SoloReset() and SurfLogin())
function SoloAds(email, password, username) {
	var key = username + "_sa";
	if(parseInt(ScriptProperties.getProperty(key)) != 0) {
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
		
		//get message list
		var response = UrlFetchApp.fetch("http://topsurfer.com/mmessages.cgi", options);
		var text = response.getContentText();
		if (text.indexOf('Your Messages') < 0)
			return;
		
		var pos, cnt = 0, loc = 0, url = "", innerText = "";
		
		//place where the script stopped last time
		var prev = parseInt(ScriptProperties.getProperty(key));
		if(prev <= 0) //just after reset
			prev = 0;
		
		for(pos = 0; (pos = text.indexOf("http://topsurfer.com/mviewsolo.cgi?", pos)) > 0; pos++) {
			//ignore previously viewed messages
			if(cnt++ < prev) {
				continue;
			}
			
			//get message
			url = text.substring(pos, text.indexOf("\"", pos));
			response = UrlFetchApp.fetch(url, options);
			innerText = response.getContentText();
			
			//get ad page
			loc = innerText.indexOf("http://topsurfer.com/soload.cgi?");
			url = innerText.substring(loc, innerText.indexOf("\"", loc));
			response = UrlFetchApp.fetch(url, options);
			innerText = response.getContentText();
			
			Utilities.sleep(15000);
//			Logger.log(innerText);
			
			//validate
			loc = innerText.indexOf("recordsa.php?");
			if(loc > 0) {
				url = innerText.substring(loc, innerText.indexOf("\"", loc));
				response = UrlFetchApp.fetch("http://topsurfer.com/" + url, options);
				innerText = response.getContentText().substring(0, 30);
				
				if(innerText != "moneysuccess") { //error
					GmailApp.sendEmail("__email__", username + " SoloAds " + innerText, username + " SoloAds " + innerText);
				}
			}
			else {
				GmailApp.sendEmail("__email__", username + " SoloAds error: recordsa not found", username + " SoloAds error: recordsa not found");
				break;
			}
			
			ScriptProperties.setProperty(key, cnt);
		}
		
		//if all completed successfully, reset stop position
		ScriptProperties.setProperty(key, "0");
	}
}