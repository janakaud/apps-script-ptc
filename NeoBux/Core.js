function viewAds(username, password, turn) {
	var tryLogin = login(username, password, true);
	if (!tryLogin)
		return;
	
	var parse = tryLogin.parse;
	var adsUrl = tryLogin.adsUrl;
	var doc = tryLogin.doc;
	
	//get z
	var start = doc.indexOf("z=") + 3;
	var z = doc.substring(start, doc.indexOf('\';', start));
	
	var options = {
		method: "GET",
		Host: "www.neobux.com",
		headers: {
			cookie: parse,
			referer: adsUrl
		}
	};
	
	var pos = 0, views = 0, prizeSet = false, response, text, page, sleep, param, array, ad, res, loc, i, j, a, s, O, I;
	var msg = "", adUrl = "";
	
	pos = doc.indexOf("sVL") + 5;
	var sVL = doc.substring(pos, doc.indexOf("\'", pos));

	//3 sets of ads
	for(i = 0; pos > -1; i++) {
		
		//extract ad detail array
		//WARNING: preserve value of pos across iterations!
		pos = doc.indexOf("dr_c('", pos + 1);
		if(pos == -1) //not found
			break;
		
		loc = doc.indexOf("dr_c(", pos + 1);
		if(loc < 0)
			break; //skip expired array
		else
			text = doc.substring(pos, doc.indexOf("dr_c(", pos + 1));

		array = text.match(/\[.*?\](?=\);)/g);
		
		//for each ad in array
		for(j = 0; j < array.length; j++) {
			try {
				ad = eval(array[j]);
				
				//if second turn, check if not viewed today
				if(turn == 0 || !text.match(new RegExp("tp\\(" + ad[0] + ",[^\\)]+\\)", 'g'))) {
					I = '';
					O = ad[0];
					if(ad[6] == 0)
						s = 0;
					if (z.indexOf(',') >= 0) {
						for (a = 0; a < 9; a++)
							z = z.replace(new RegExp('\\' + ",-+@/. ;_".charAt(a), 'g'), "NTj2M10AO".charAt(a));
						z = w(z);
					};
					
					for (a = ((O - 1) * 128); a < (O * 128); a++) {
						I += String.fromCharCode(z.slice(a * 2, (a + 1) * 2));
					}
					adUrl = "http://www.neobux.com/v/?a=l&l=" + I + "&vl=" + sVL;

					//fetch ad page
					response = UrlFetchApp.fetch(adUrl, options);
					page = response.getContentText();
					
					//stop for required time
					loc = page.indexOf("t1=") + 3;
					if(loc < 3) {
						msg += "e";
						continue;
					}
					sleep = parseInt(page.substring(loc, page.indexOf(";", loc)))*100;
					Utilities.sleep(sleep);
					
					//locate Flash parameter
					loc = page.indexOf("df('") + 4;
					if(loc < 4) {
						msg += "e";
						continue;
					}
					param = page.substring(loc, page.indexOf("\'", loc));
					
					var adOptions = {
						method: "GET",
						Host: "www.neobux.com",
						headers: {
							cookie: parse,
							referer: adUrl
						}
					};
					
					//validate
					response = UrlFetchApp.fetch("http://www.neobux.com/v/v1/?s=" + I + "&y=" + param + "&noCache=" + new Date().getTime(),
						adOptions);
					
					//validate2
					response = UrlFetchApp.fetch("http://www.neobux.com/v/v2/?s=" + I + "&y=" + param + "&noCache=" + new Date().getTime(),
						adOptions);
					page = response.getContentText();
					res = page.match(/[.\d]+/g);
					views++;

					//decide response
					if(res && res.length > 1) {
						if(parseFloat(res[1]) > 0) {
							msg += "k";
							if (!prizeSet) {
								PropertiesService.getScriptProperties().setProperty(username + '_pendingAdPrize', true);
								prizeSet = true;
							}
						}
						else
							msg += res[1];
					}
					else
						msg += "e";
				}
			}
			catch(err) {
				msg += "E";
			}
		}
	}
	
	if(turn == 0 && msg.length > 0/* && username == '__preferred user__'*/) {
		msg = username + "\nnbx\n" + views + '\n' + msg;
		sendTweet(msg);
	}
}

function adPrize(username, password) {
	var props = PropertiesService.getScriptProperties();
	if(!props.getProperty(username + '_pendingAdPrize'))
		return;
	
	var tryLogin = login(username, password, true);
	if (!tryLogin)
		return;
	
	var parse = tryLogin.parse;
	var adsUrl = tryLogin.adsUrl;
	var doc = tryLogin.doc;
	
	var options = {
		method: "GET",
		Host: "www.neobux.com",
		headers: {
			cookie: parse,
			referer: adsUrl
		}
	};
	
	var pos = 0, cnt = 0, adUrl = "", response, page;
	try {
		do {
			var mat = doc.match(/ap_dr\(\d+,/g);
			if(mat) {
				pos = doc.indexOf(mat[0]);
				pos = doc.indexOf('\'', pos) + 1;
				if(pos > 0) {
					var ap = doc.substring(pos, doc.indexOf('\'', pos));
					if(ap.length < 1)
						break;
					adUrl = 'http://www.neobux.com/v/?xc=' + ap + '&vl2=' + new Date().getTime();
					response = UrlFetchApp.fetch(adUrl, options);
					page = response.getContentText();
					
					//stop for required time
					Utilities.sleep(5000);
					
					var adOptions = {
						method: "GET",
						Host: "www.neobux.com",
						headers: {
							cookie: parse,
							referer: adUrl
						}
					};
					
					//validate
					response = UrlFetchApp.fetch("http://www.neobux.com/v/v1/?s=0&y=v&noCache=" + new Date().getTime(), adOptions);
					
					//validate2
					response = UrlFetchApp.fetch("http://www.neobux.com/v/v2/?s=0&y=v&noCache=" + new Date().getTime(), adOptions);
					page = response.getContentText();
					doc = page;
					cnt++;
				}
			}
		}
		while(mat);
	}
	catch(err) {}

	props.deleteProperty(username + '_pendingAdPrize');
//	sendTweet(username + "\nnb_ap\n" + cnt);
}

function buyRefs(username, password) {
	var tryLogin = login(username, password, false);
	if (!tryLogin)
		return;
	
	var parse = tryLogin.parse;
	var adsUrl = tryLogin.adsUrl;
	var refUrl = 'http://www.neobux.com/c/rar/';
	
	var response = UrlFetchApp.fetch(refUrl, {
		method: "GET",
		Host: "www.neobux.com",
		headers: {
			cookie: parse,
			referer: adsUrl
		}
	});
	var page = response.getContentText();
	var pos = page.indexOf('else if(o<=');
	if (pos < 0)
		return;
	
	pos += 11;
	var balance = page.substring(pos, page.indexOf(")", pos));
	
	pos = page.indexOf("document.location.href='/c/rar/?vl=");
	if (pos < 0)
		return;
	
	var refs = 0;
	var packs = [3, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];
	for (var i in packs) {
		if (balance/0.2 < packs[i])
			break;
		refs = packs[i];
	}
	
	pos += 31;
	var rentUrl = refUrl + page.substring(pos, page.indexOf("'", pos)) + refs;
	pos = page.indexOf("&bz=", pos);
	rentUrl += page.substring(pos, page.indexOf("'", pos));
	response = UrlFetchApp.fetch(rentUrl, {
		method: "GET",
		Host: "www.neobux.com",
		headers: {
			cookie: parse,
			referer: refUrl
		}
	});
	sendTweet(username + "\nnb_bal\n" + balance + "\nbuy\n" + refs);
}

function login(username, password, getAds) {
	var props = PropertiesService.getScriptProperties();
	var logUrl = 'https://www.neobux.com/m/l/';
	var adsUrl = '"http://www.neobux.com/m/v/?';

	var header = {};
	var parse = props.getProperty(username + '_cookie');
	if (parse) {
		header.cookie = parse;
	} else {
		parse = '';
	}
	
	var response = UrlFetchApp.fetch(logUrl, {
		method: 'GET',
		headers: header,
		followRedirects: false
	});
	
	var respHeaders = response.getAllHeaders();
	var cookie = respHeaders['Set-Cookie'];
	if (!(cookie instanceof Array))
		cookie = [cookie];
	
	var redir = respHeaders['Location'];
	if (!redir) {
		sendTweet(username + ' re-login');
		// check cookie list from rear end, eliminating duplicates
		for (var i = cookie.length - 1; i >= 0; i--) {
			var changes = ['NB1=', 'NB2=', 'CFID=', 'CFTOKEN='];
			var found = [false, false, false, false];
			for (var j in changes)
				if (cookie[i].indexOf(changes[j]) == 0) {
					if (!found[j])
						found[j] = true;
					else
						cookie[i] = null;
					break;
				}
		}
		parse = updateCookies(parse, cookie);

//		parse = cookie[10].substring(0, cookie[10].indexOf(";"));
//		parse += "; " + cookie[11].substring(0, cookie[11].indexOf(";"));
//		parse += "; " + cookie[0].substring(0, cookie[0].indexOf(";"));
//		parse += "; " + cookie[1].substring(0, cookie[1].indexOf(";"));
		
		var body = response.getContentText();
		var start = body.indexOf(logUrl);
		logUrl = body.substring(start, body.indexOf('"', start));
		
		start = body.indexOf('{ts');
		if(start > 0) {
			parse += "; dh=" + vergeral() + ",1366x768," + body.substring(start, body.indexOf('}', start) + 1);
		}
		
		start = body.indexOf('form');
		body = body.substring(start);
		start = body.indexOf('lg1');
		
		var names = [], values = [];
		var array = eval(w(body.substring(start + 5, body.indexOf("'", start + 5))));
		//interchange elements 2 and 3 to match their order in form
		var temp = array[2];
		array[2] = array[3];
		array[3] = temp;
		//fill first and last elements with blanks
		array[-1] = array[4] = '';
		
		start = body.indexOf('input');
		var pos = body.indexOf('value', start);
		values.push(body.substring(pos + 7, body.indexOf('"', pos + 7)));
		
		var i = -1;
		do {
			body = body.substring(start + 1);
			pos = body.indexOf('name');
			names.push(body.substring(pos + 6, body.indexOf('"', pos + 6)) + array[i]);
			start = body.indexOf('input');
			i++;
		}
		while(start >= 0);
		
		values.push(username);
		values.push(password);
		values.push('');
		values.push('');
		values.push('1');
		
		var payload = names[0] + '=' + values[0];
		for(var i = 1; i < 6; i++)
			payload += '&' + names[i] + '=' + values[i];
		
		response = UrlFetchApp.fetch(logUrl, {
			method: "POST",
			Host: "www.neobux.com",
			headers: {
				cookie: parse,
				referer: logUrl
			},
			payload: payload,
			followRedirects: false,
			escaping: false
		});
		
		var respHeaders = response.getAllHeaders();
		parse = updateCookies(parse, respHeaders['Set-Cookie']);
		redir = respHeaders['Location'];
	}

	if (redir) {
		response = UrlFetchApp.fetch('https://www.neobux.com' + redir, {
			method: "GET",
			Host: "www.neobux.com",
			headers: {
				cookie: parse,
				referer: logUrl
			}
		});
	}

	body = response.getContentText();
	if(body.indexOf("Your browser is not sending the correct data") > 0) {
		Logger.log("browser error");
		sendTweet(username + "\nnbx\nbrowser error");
		return;
	}
	else if(body.indexOf("An error occurred</div><div style=\"width:187px;padding:2px;font-family:") > 0) {
		Logger.log("not OK");
		sendTweet(username + "\nnbx\nnot OK");
		return;
	}

	if (getAds) {
		//get ads page
		start = body.indexOf(adsUrl) + 1;
		adsUrl = body.substring(start, body.indexOf('"', start));
		if(adsUrl.length < 1) { //default
			adsUrl = 'http://www.neobux.com/m/v/';
		}
		
		response = UrlFetchApp.fetch(adsUrl, {
			method: "GET",
			Host: "www.neobux.com",
			headers: {
				cookie: parse,
				referer: logUrl
			}
		});
		body = response.getContentText();
	}
	
	parse = updateCookies(parse, response.getAllHeaders()['Set-Cookie']);
	props.setProperty(username + '_cookie', parse);
	return {adsUrl: adsUrl, doc: body, parse: parse};
}

function w(i) {
	var k = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var o = '';
	var c1, c2, c3, e1, e2, e3, e4;
	var j = 0;
	i = i.replace(/[^A-Za-z0-9\+\/\=]/g, '');
	do {
		e1 = k.indexOf(i.charAt(j++));
		e2 = k.indexOf(i.charAt(j++));
		e3 = k.indexOf(i.charAt(j++));
		e4 = k.indexOf(i.charAt(j++));
		c1 = (e1 << 2) | (e2 >> 4);
		c2 = ((e2 & 15) << 4) | (e3 >> 2);
		c3 = ((e3 & 3) << 6) | e4;
		o = o + u0(c1 / 10);
		if (e3 != 64) o = o + u0(c2 / 10);
		if (e4 != 64) o = o + u0(c3 / 10);
	} while (j < i.length);
	return o;
}

function u0(a) {
	return String.fromCharCode(a * 10);
}

function vergeral() {
	var d = new Date();
	var dia = (d.getDate()).toString();
	if (dia.length == 1) dia = '0' + dia;
	var mes = (d.getMonth() + 1).toString();
	if (mes.length == 1) mes = '0' + mes;
	var hora = (d.getHours()).toString();
	if (hora.length == 1) hora = '0' + hora;
	var minuto = (d.getMinutes()).toString();
	if (minuto.length == 1) minuto = '0' + minuto;
	var segundo = (d.getSeconds()).toString();
	if (segundo.length == 1) segundo = '0' + segundo;
	var ano = (d.getFullYear()).toString();
	return (ano + mes + dia + hora + minuto + segundo);
}

function t() {
	viewAds('__user__', '__pass__', 1);
}

function updateCookies(parse, cookie) {
//var report = JSON.stringify(cookie) + '\n' + parse + '\n\n';
	if (!cookie)
		return parse;
	if (!(cookie instanceof Array)) {
		cookie = [cookie];
	}
	for (var i in cookie) {
		if (!cookie[i])
			continue;
		
		var cookieName = cookie[i].substring(0, cookie[i].indexOf('='));
		var pos = parse.indexOf(cookieName);
		if (pos >= 0) { // replace
			var fullCookie = cookie[i].substring(0, cookie[i].indexOf(';'));
			if (fullCookie.length > cookieName.length + 3) { // ignore =""
				var end = parse.indexOf(';', pos);
				parse = parse.substring(0, pos) + fullCookie + (end > -1 ? parse.substring(end) : '');
			}
		}
		else {					// append
			if (parse.length > 0)
				parse += '; ';
			parse += cookie[i].substring(0, cookie[i].indexOf(';'));
			var dynamicName = cookieName.match(/incap_ses_\d+_\d+|visid_incap_\d+/);
			if (dynamicName) {	// check for older versions
				var oldName = parse.match(new RegExp(cookieName.replace(/\d+/g, '\\d+'), 'g'));
				if (oldName) {		// remove existing cookie
					for (var j = 0; j < oldName.length - 1; j++) {
						pos = parse.indexOf(oldName[j]);
						parse = parse.substring(0, pos) + parse.substring(parse.indexOf(';', pos) + 2);
					}
				}
			}
		}
	}
//report += parse;
//GmailApp.sendEmail('__email__', 'updateCookie', report);
	return parse;
}