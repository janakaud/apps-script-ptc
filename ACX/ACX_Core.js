HOST = 'adclickxpress.is';
BASE = 'http://' + HOST + '/';
LOGIN = BASE + 'login';
TRAFFIC = BASE + 'members/traffic-exchange/viewer';
MEDIAX = BASE + 'members/media-exchange';

ADPACKS = BASE + 'members/adpacks';
DASH_AJAX = 'members/dashboard/ajax.php?from_ajax=1';
MONITOR = 'members/dashboard/money_monitor.php';

var ADS = 0, MEDIA = 1;

function ACX_Check(username, password, key) {
	//skip if already completed
	var status = ScriptProperties.getProperty(key);
	if(status == "done")
		return;
	
	//call ACX and get cookies
	var result = fetch(LOGIN, {});
	if(result == null) //failure
		return;

	var msg = '';

	//POST newurl with cookies
	var header = {
		referer: LOGIN,
		cookie: result.cookie
	};

	var next = status == "one" ? DASH_AJAX : MONITOR;
	result = fetch(LOGIN, {
		method: 'POST',
		host: HOST,
		headers: header,
		payload: {
			//force value refresh before fetch
			next: next,
			submitted: '1',
			identifier: username,
			password: password,
			submit:	'SUBMIT',
		},
		followRedirects: false
	});
	if(result == null) //failure
		return;

	var response = result.response;
	var cookie = result.cookie;
	header = {
		referer: status == "one" ? LOGIN : ADPACKS,
		cookie: cookie,
        "X-Requested-With": "XMLHttpRequest"
	};

	//for Ad/Media systems
	var prices = [10, 5];
	var wallets = ['wallet', 'platinumwallet'];
	var triplers = ['tripler', 'platinumtripler'];
	var xsWallets = ['xswallet', 'xsplatinumwallet'];
	var ttids = ['1/', '1'];
	var floodprotectStrs = ['floodprotect_id = ', 'floodprotect_id='];
	var floodprotectOffsets = [19, 17];
	var reqViews = [{1: 1, 4: 3, 21: 6, 101: 10, 501: 15, 1001: 20},
									{1: 2, 4: 6, 21: 12, 101: 20, 501: 30, 1001: 40}];
	
	//switch to ad system if in media
	if(ScriptProperties.getProperty(username + '_mode') == MEDIA)
		switchMode(username, header, ADS);
	
	//for Ad and Media systems
	for(var m = 0; m < 2; m++) {

		//fetch required ad views
		response = fetch(BASE + next, {
			method: 'GET',
			headers: header,
			followRedirects: false
		}, true).response;
		if(!response) {
			return;
		}

		var str = response.getContentText();
		var values;
		try {
			values = JSON.parse(str);
		}
		catch(e) {
			GmailApp.sendEmail(Session.getActiveUser().getEmail(), 'ACX Dash', str);
			return;
		}
		
		//decide no. of ads to be viewed
		var views = 0;
		if(status == 'one') {
			views = parseInt(values['requiredviews']);
		}
		else {
			var active = parseInt(values['total_active_adpacks']);
			var prevI = 0;
			for(var i in reqViews[m]) {
				if(active < i) {
					views = reqViews[m][prevI] || 0;
					break;
				}
				prevI = i;
			}
		}
		
		if(m == ADS)
			//view required no. of ads
			viewAds({
				referer: TRAFFIC,
				cookie: cookie
			}, views);
		else if(m == MEDIA)
			//view required no. of media
			viewMedia({
				referer: MEDIAX, //BASE + 'members/prime-advertising/banners',
				cookie: cookie
			}, views);
		
		//run twice by 2-stage key update
		if(status == 'one') {
			//fetch balances
			var options = {
				method: 'GET',
				headers: header
			};
			
			response = fetch(BASE + 'members/wallet/ajax.php', options, true).response;
			if(!response) {
				return;
			}

			str = response.getContentText();
			values = JSON.parse(str);
			
			var balance = parseFloat(values['triplerbalance']);
			var wBalance = parseFloat(values['walletbalance']);
			var xsBalance = parseFloat(values['xswalletbalance']);
			var refBalance = parseFloat(values['referralbalance']);
			var basic = parseFloat(values['pcbasicbalance']);
			var premium = parseFloat(values['pcpremiumbalance']);
			
			//price (Ad/Media?)
			var price = prices[m];
			var pnt2 = price * 0.2;
			var pnt3 = price * 0.3;
			var pnt7 = price * 0.7;
			var pnt8 = price * 0.8;
			//nos. of packs from wallet balance
			var wPaxAt7 = parseInt(wBalance/pnt7);
			var wPaxAt8 = parseInt(wBalance/pnt8);
			//nos. of packs from tripler balance
			var tPaxAt7 = parseInt(balance/pnt7);
			var tPaxAt8 = parseInt(balance/pnt8);
			
			msg += '' + balance;
			
			if(refBalance >= price)
				msg += '\nBuy:Referral [manual]';
			if(xsBalance >= price)
				msg += '\nBuy:XSWallet';
			
			//can buy packs?
			if(xsBalance >= price || balance >= price || wBalance >= price/* ||
				 (wBalance >= pnt8 && basic >= pnt2 * wPaxAt8) || (wBalance >= pnt7 && premium >= pnt3 * wPaxAt7) ||
				 (balance >= pnt8 && basic >= pnt2 * tPaxAt8) || (balance >= pnt7 && premium >= pnt3 * tPaxAt8)*/) {
					
				//override popup page
				response = fetch(BASE + 'members/adpacks/buy', options).response;
				if(!response) {
					return;
				}

				str = response.getContentText();
				var pos = str.indexOf('members/adpacks/buy?');
				if(pos > 0) {
					str = str.substring(pos, str.indexOf('\"', pos));
					response = fetch(BASE + str, options).response;
					if(!response) {
						return;
					}
					str = response.getContentText();
				}
				
				pos = str.indexOf(floodprotectStrs[m]);
				if(pos > 0) {
					pos += floodprotectOffsets[m];
					str = str.substring(pos, str.indexOf('\'', pos));
					
					var source1 = triplers[m], source2;
					var quantity = 1;
					/*if(wBalance >= pnt7 && premium >= pnt3 * wPaxAt7) {
						quantity = wPaxAt7;
						source1 = wallets[m];
						source2 = 'PCPremium';
					}
					else if(wBalance >= pnt8 && basic >= pnt2 * wPaxAt8) {
						quantity = wPaxAt8;
						source1 = wallets[m];
						source2 = 'PCBasic';
					}
					else if(balance >= pnt7 && premium >= pnt3 * tPaxAt7) {
						quantity = tPaxAt7;
						source2 = 'PCPremium';
					}
					else if(balance >= pnt8 && basic >= pnt2 * tPaxAt8) {
						quantity = tPaxAt8;
						source2 = 'PCBasic';
					}
					else */if(xsBalance >= price) {
						quantity = parseInt(xsBalance/price);
						source1 = xsWallets[m];
						source2 = '';
					}
					else if(wBalance >= price) {
						quantity = parseInt(wBalance/price);
						source1 = wallets[m];
						source2 = '';
					}
					else if(balance >= price) {
						quantity = parseInt(balance/price);
						source2 = '';
					}
					
					response = fetch(BASE + 'members/adpacks/buy/ajax.php', {
						method: 'POST',
						headers: header,
						payload: {
							from_ajax: '1',
							source: source1,
							quantity: '' + quantity,
							ttid: ttids[m],
							use_pc_funds: (source2 == '' ? 'off': 'on'),
							'source2': source2,
							id: str
						}
					}, true).response;
					if(!response) {
						return;
					}
					
					var result = JSON.parse(response.getContentText());
					if(result.success) {
						msg += '\nBought:' + quantity;
						//view needed no. of ads/media
						if(m == ADS)
							viewAds(header, result.need_view);
						else if(m == MEDIA)
							viewMedia(header, result.need_view);
						views += parseInt(result.need_view);
					}
				}
			}
	 
			msg += '\nViewed:' + views + '\n';
		}
		
		switchMode(username, header, 1 - m);
	}
	
	//mark as done when both steps finished
	if(status == 'one') {
		ScriptProperties.setProperty(key, 'done');
		sendTweet('ACX ' + username + '\n' + msg);
	}
	else
		ScriptProperties.setProperty(key, 'one');
}

function switchMode(username, header, mode) {
	var keyName = username + '_mode';
	var response = fetch(BASE + 'members/switch.php', {
		method: 'POST',
		headers: header,
		payload: {
			from_ajax: '1',
			agreed: '1',
			system_check: mode
		}
	}).response;
	if(!response) {
		return;
	}
	ScriptProperties.setProperty(keyName, response.getContentText().indexOf('Ad ') > 0 ? ADS : MEDIA);
}

function viewAds(header, count) {
	var start;
	for(var i = 0; i < count; i++) {
		//get token
		var response = fetch(TRAFFIC, {
			method: 'GET',
			headers: header
		}).response;
		if(!response) {
			return;
		}
		var str = response.getContentText();
		
		start = str.indexOf('value=') + 7;
		str = str.substring(start, str.indexOf('"', start + 1));
		
		//send token and get viewer page
		response = fetch(TRAFFIC, {
			method: 'POST',
			headers: header,
			payload: {
				token: str,
				dataType: 'json'
			}
		}).response;
		if(!response) {
			return;
		}

		str = response.getContentText();
		start = str.indexOf('TrafficExchangePassKey = ') + 26;
		str = str.substring(start, str.indexOf('"', start + 1));
		
		//wait 12s
		Utilities.sleep(12000);
		
		//post passkey to complete view
		response = fetch(TRAFFIC, {
			method: 'POST',
			headers: header,
			payload: {
				_action: str,
				dataType: 'json'
			}
		}).response;
	}

	//get paid
	fetch(BASE + 'members/get-paid/earnings_popup?tt=noheaderfooter', {headers: header});
}

function viewMedia(header, count) {
	var response, ad;
	
	for(var i = 0; i < count; i++) {
		//get ad details
		response = fetch(MEDIAX, {
			method: 'POST',
			headers: header,
			payload: {_action: 'viewmedia'}
		}, true).response;
		try {
			ad = JSON.parse(response.getContentText());
		} catch(e) {
			return;
		}

		//wait 6s
		Utilities.sleep(6000);
		
		//send token and get viewer page
		response = fetch(MEDIAX, {
			method: 'POST',
			headers: header,
			payload: {
				_action: 'mediaviewed',
				token: ad.token
			}
		}).response;
	}

	//get paid
	fetch(BASE + 'members/get-paid/earnings_popup?tt=noheaderfooter', {headers: header});
}

function fetch(url, options, json) {
	for(var j = 0; j < 3; j++) {
		var response = UrlFetchApp.fetch(url, options);
		var body = response.getContentText();
		if(body == "" && !(response.getAllHeaders()['Location']))
			continue;
		if(json) {
			try {
				JSON.parse(body);
			} catch(e) {
				continue;
			}
		}
		break;
	}
	if(j == 3) {
		GmailApp.sendEmail("__email__", "ACX Failed " + url, url + "\n\n" + 
			JSON.stringify(response.getAllHeaders()) + "\n\n" + response.getContentText());
		return {};
	}

	var cookieStr = '';
	if (options.headers && options.headers.cookie) {
		cookieStr = options.headers.cookie;
	}
	var document = {
		forms: [{
			submit: function() {}
		}],
		response: {}
	};
	
	if (body.indexOf('<body onload=') > 0) {
		var start = body.indexOf('eval(', body.indexOf('<script')) + 5;
		var secCheck = body.substring(start, body.indexOf('</script') - 1);
		var start = body.indexOf('onload=') + 8;
		var loadFun = body.substring(start, body.indexOf('"', start));

		//JS cookie data
		var window = {
			location: {
				reload: function() {}
			}
		};
		
//Logger.log(body);
		eval(eval('x=' + secCheck) + ';' + loadFun);
		
		if (document.response.action) { // form
			response = UrlFetchApp.fetch(url, {
				method: 'POST',
				headers: options.headers,
				payload: {
					'dataType': 'json',
					'token': '<body onload='
				}
			});
//Logger.log(response.getContentText());
//Logger.log(response.getAllHeaders());
		}
		
		document.cookie = document.cookie.replace(/\s+/g, '');
		
		//re-fetch with new cookie
		if (options.headers) {
			options.headers.cookie = appendCookie(options.headers.cookie, document.cookie);
		} else {
			options.headers = {cookie: appendCookie('', document.cookie)};
		}
		response = UrlFetchApp.fetch(url, options);
	}
	
	//generate cookie string
	var cookies = response.getAllHeaders()['Set-Cookie'];
	if (cookies) {
		cookieStr = appendCookie(cookieStr, cookies);
	}
	
	cookieStr = appendCookie(cookieStr, document.cookie);
	return {
		response: response,
		cookie: cookieStr
	};
}

function appendCookie(cookieStr, cookies) {
	if (!cookies) {
		return cookieStr;
	}
	
	if (!(cookies instanceof Array)) {
		cookies = [cookies];
	}
	
	for (var i = 0; i < cookies.length; i++) {
		//remove old cookies by same name
		var cookieName = cookies[i].substring(0, cookies[i].indexOf('='));
		var start = cookieStr.indexOf(cookieName);
		if (start >= 0) {
			var end = cookieStr.indexOf("; ", start) + 2;
			if (end < 2) {
				end = cookieStr.length;
			}
			cookieStr = cookieStr.substring(0, start) + cookieStr.substring(end, cookieStr.length);
		}
		cookieStr += (cookieStr.length > 0 ? '; ' : '') + cookies[i].substring(0, cookies[i].indexOf(';'));
	}
	return cookieStr;
}