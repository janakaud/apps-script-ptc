var HOST = 'members.mybrowsercash.com';
var BASE = 'http://' + HOST + '/';
var BONUS_URL = BASE + 'click_bonus.php';
var C4C = BASE + 'c4c.php';
var SHOW_ID = BASE + 'c4c_show.php?aid=';
var HANDLER_ID = BASE + 'inc/c4c_handler.php?aid=';
var WHEEL = BASE + 'games/prizewheel';

function MBCReset() {
	ScriptProperties.setProperty('MBCWheel', 0);
}

function MBCWheel() {
	if(ScriptProperties.getProperty('MBCWheel') != 0)
		return;
	
	//login and get cookies
	var cookie = MBCLogin('__username__', '__password__');

	//prepare for spinning
	var options = {
		method: 'GET',
		host: HOST,
		headers: {
			'cookie': cookie,
			'referer': WHEEL
		}
	};
	
	var response, data, credits, result = '';
	do {
		credits = 0;
		try {
			//spin prize wheel
			response = UrlFetchApp.fetch(WHEEL + '/ajax/ajax_calls.php', options);
			data = JSON.parse(response.getContentText());
			credits = data['credits_total'];
			result += '\n' + data['credits_won'];
		}
		catch(e) { }
	}
	while(credits > 0);
	//while we have more credits

//	sendTweet('MBC Wheel' + result);

	//mark as done
	ScriptProperties.setProperty('MBCWheel', 1);
}

function MBCAds() {
	//login and get cookies
	var cookie = MBCLogin('__username__', '__password__');
	if(!cookie)
		return;

	//prepare for spinning
	var options = {
		method: 'GET',
		host: HOST,
		headers: {
			'cookie': cookie,
			'referer': C4C
		}
	};
	
	var response, page, pos, url, result, text, innerPos, curTime, endTime, errors, errorHtml = '', bonusHtml = '', cnt = 0, bonusCode;
	do {
//		Logger.log('-------- new round ---------');
		response = UrlFetchApp.fetch(C4C, options);
		page = response.getContentText();
		pos = page.indexOf(SHOW_ID);
		
		//stop when there are no more ads
		if(pos < 0)
			break;
		
		errors = 0;

		//while we have more ads
		while(pos > 0) {
			url = page.substring(pos, page.indexOf('"', pos));
//			Logger.log(url);
			
			//get ad page and wait
			text = UrlFetchApp.fetch(url, options).getContentText();
			if (text.match(/claim|code/ig))
				bonusHtml += '\n' + url + '\n' + text;
			
			//calculate sleep end time									TODO try to eliminate sleep
			//innerPos = text.indexOf('startCountDown');
			//endTime = new Date().getTime() + parseInt(text.substring(innerPos + 15, text.indexOf(',', innerPos))) * 1000;
			
			//claim bonus
			innerPos = text.indexOf('claim code <b>') + 14;
			if (innerPos > 14) {
				bonusCode = text.substring(innerPos, text.indexOf('</b>', innerPos));
				result = UrlFetchApp.fetch(BASE + 'inc/mainhandler.php?action=claimclickbonus&code=' + bonusCode, {
					host: HOST,
					headers: {
						'cookie': cookie,
						'referer': BONUS_URL
					}
				}).getContentText();
//				if (result != 'success')
				bonusHtml += '\n' + bonusCode + ' => ' + result;
			}
			
			//sleep over remaining time
			//curTime = new Date().getTime();
			//if (curTime < endTime)
			//	Utilities.sleep(endTime - curTime);
			
			//confirm
			innerPos = text.indexOf(HANDLER_ID);
			response = UrlFetchApp.fetch(text.substring(innerPos, text.indexOf('"', innerPos)), {
				host: HOST,
				headers: {
					'cookie': cookie,
					'referer': url
				}
			});

			result = response.getContentText();
			if(result.indexOf('>Credited<') < 0) { //problem
				errors++;
				errorHtml += '\n' + url + '\n' + result;
			}
			if (result.match(/claim|code/ig))
				bonusHtml += '\n' + url + '\n' + result;
			cnt++;
			
			//delay before next ad
			Utilities.sleep(15000);
			
			//next ad
			pos = page.indexOf(SHOW_ID, pos + 1);
		}
		
		if(errors > 0)
			GmailApp.sendEmail('__email__', 'MBC Error: not credited (' + errors + ')', '', {
				attachments: [Utilities.zip([Utilities.newBlob(errorHtml)], 'errorHtml.zip')]
			});
	}
	while(true);
	
	//check if we have any click bonuses
	response = UrlFetchApp.fetch(BONUS_URL, options);
	page = response.getContentText();
	pos = page.indexOf('You Have No Unclaimed Click Bonuses.');
	
	//stop when there are no more ads
	if(pos < 0)
		GmailApp.sendEmail('__email__', 'MBC Click Bonuses! 30 minutes to expire', '', {
			attachments: [Utilities.zip([Utilities.newBlob(page + '\n\n' + bonusHtml)], 'bonusHtml.zip')]
		});
}

function MBCLogin(username, password) {
	//call login.php and get cookies
	var aUrl = BASE + 'login.php';
	var response;
	try {
		response = UrlFetchApp.fetch(aUrl);
	}
	catch(e) {
		return null;
	}
	
	//remove extra data from cookies
	var cookie = response.getAllHeaders()['Set-Cookie'];
	var parse = '';
	if (!(cookie instanceof Array))
		cookie = [cookie];
	parse += cookie[0].substring(0, cookie[0].indexOf(';'));
	for(var i = 1; i < cookie.length; i++) {
		parse += '; ' + cookie[i].substring(0, cookie[i].indexOf(';'));
	}
	
	//login
	var options = {
		method: 'POST',
		host: HOST,
		payload: {
			'username': username,
			'password': password,
			'pin': '0',
			'Submit': 'Submit'
		},
		headers: {
			'cookie': parse,
			'referer': aUrl
		},
		followRedirects: false
	};
	try {
		response = UrlFetchApp.fetch(aUrl, options);
	}
	catch(e) {
		return null;
	}

	//add new cookies to cookie string
	cookie = response.getAllHeaders()['Set-Cookie'];
	if(!cookie)
		return null;
	
	for(var i = 0; i < cookie.length; i++) {
		parse += '; ' + cookie[i].substring(0, cookie[i].indexOf(';'));
	}
	
	return parse;
}