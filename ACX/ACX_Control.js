function ACX_User1() {
	ACX_Check('__user1__', '__pass1__', 'acx_user1');
}

function ACX_User2() {
	ACX_Check('__user2__', '__pass2__', 'acx_user2');
}

function ACX_Reset() {
	ScriptProperties.setProperty('acx_user1', '');
	ScriptProperties.setProperty('acx_user2', '');
}

function ip() {
	var response = UrlFetchApp.fetch("http://www.ipchicken.com/");
	var content = response.getContentText();
	var msg = Utilities.formatDate(new Date(), "IST", "HH:mm:ss");

	var i = 0;
	i = content.indexOf("Address:", i) + 8;
	msg += "\n" + content.substring(i, content.indexOf("</", i)).replace('.google.com', '').trim();
	i = content.indexOf("Port:", i) + 5;
	msg += "\n" + content.substring(i, content.indexOf("</", i)).trim();
	
	sendTweet(msg);
}