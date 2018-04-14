var parse;

function neobux() {
  var url = 'https://www.neobux.com/m/l/';
  var response = UrlFetchApp.fetch(url);
  var cookie = response.getAllHeaders()['Set-Cookie'];
  
  parse = cookie[0].substring(0, cookie[0].indexOf(";"));
  for(var i = 1; i < cookie.length; i++) {
    if(i >= 2 && i < 10)
      continue;
    parse += "; " + cookie[i].substring(0, cookie[i].indexOf(";"));
  }
  
  var body = response.getContentText();

  var start = body.indexOf('{ts');
  if(start > 0) {
    parse += "; dh=" + vergeral() + ",1138x640," + body.substring(start, body.indexOf('}', start) + 1);
    Logger.log(parse);
  }
  
  var header = {
    "cookie" : parse,
    "referer": url
  };

  var userCookie = muc();
  response = UrlFetchApp.fetch('https://d5nxst8fruw4z.cloudfront.net/atrk.gif?frame_height=288&frame_width=1138&iframe=0&title=NeoBux%20-%20Login&time='
  + new Date().getTime() + '&time_zone_offset=-330&screen_params=1138x640x24&java_enabled=1&cookie_enabled=1&ref_url=&host_url=https%3A%2F%2Fwww.neobux.com%2Fm%2Fl%2F&random_number='
  + Math.round(Math.random() * 21474836747) + '&sess_cookie=' + sess_cookie(userCookie) + '&sess_cookie_flag=0&user_cookie=' + user_cookie(userCookie) + '&user_cookie_flag=0&dynamic=true&domain=neobux.com&account=__account__&jsv=20121002', {
    "method" : "GET",
    "Host": "www.neobux.com",
    "headers" : header,
    "muteHttpExceptions": true,
    "followRedirects": false
  });
  
  Logger.log(response.getAllHeaders());
  Logger.log(response.getContentText());

  header = {
    "cookie" : setIncapCookie(encodeURIComponent("navigator=object,navigator.vendor=,opera=ReferenceError: opera is not defined,ActiveXObject=ReferenceError: ActiveXObject is not defined,navigator.appName=Netscape,plugin=dll,webkitURL=ReferenceError: webkitURL is not defined,navigator.plugins.length==0=false")),
    "referer": url
  };

  response = UrlFetchApp.fetch('https://www.neobux.com/_Incapsula_Resource?SWKMTFSR=1&e=' + Math.random(), {
    "method" : "GET",
    "Host": "www.neobux.com",
    "headers" : header,
    "muteHttpExceptions": true,
    "followRedirects": false
  });
  
  Logger.log(response.getAllHeaders());
  Logger.log(response.getContentText());
  
  //restore
//  parse = parse.substring(0, parse.indexOf("__auc") - 2);
  header = {
    "cookie" : parse,
    "referer": url
  };
  
  start = body.indexOf('form');
  body = body.substring(start);
  
  var names = [], values = [];
  
  start = body.indexOf('lg1');
  
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
  
  values.push('__username__');
  values.push('__password__');
  values.push('');
  values.push('');
  values.push('1');
  
  var payload = '{"' + names[0] + '":"' + values[0] + '"';
  for(var i = 1; i < 6; i++)
    payload += ',"' + names[i] + '":"' + values[i] + '"';
  payload += '}';
  
//  url += '?' + names[0] + '=' + values[0];
//  for(var i = 1; i < 6; i++)
//    url += '&' + names[i] + '=' + values[i];
//  Logger.log(url);
  
  payload = JSON.parse(payload);
  
  options = {
    "method" : "POST",
    "Host": "www.neobux.com",
    "headers" : header,
    "payload" : payload,
    "muteHttpExceptions": true,
    "followRedirects": false
  };
  
  Logger.log(UrlFetchApp.getRequest(url, options));
  
  response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getContentText());
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

function U(a) {
  return a * 10;
}

function u0(a) {
  return String.fromCharCode(U(a));
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

function sess_cookie(user_cookie_v) {
  return gc("__asc", user_cookie_v, "sess_cookie");
}

function user_cookie(user_cookie_v) {
  return gc("__auc", user_cookie_v, "user_cookie");
}

function r() {
  return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

function muc() {
  return r() + r() + (new Date).getTime().toString(16) + r() + r();
}

function gc(a, b, c) {
  var e = "",
      f = 0;
  try {
    e = gbc(a);
  } catch (g) {}
  if (e == null || e.length == 0) {
    e = b;
    f = 1;
  }
  sbc(a, e);
  return e + "&" + c + "_flag=" + f;
}

function ue(a) {
  try {
    return encodeURIComponent(a);
  } catch (b) {
    return escape(a);
  }
}

function gbc(a) {
  var b = parse,
      c = a + "=",
        d = b.indexOf("; " + c),
          e;
  if (d == -1) {
    d = b.indexOf(c);
    if (d != 0) return null;
  } else {
    d += 2;
  }
  e = b.indexOf(";", d);
  if (e == -1) {
    e = b.length;
  }
  return ue(b.substring(d + c.length, e));
}

function sbc(a, b) {
  parse += "; " + a + "=" + escape(b);
}

function getSessionCookies() {
  cookieArray = new Array();
  var cName = /^\s?incap_ses_/;
  var c = parse.split(";");
  for (var i = 0; i < c.length; i++) {
    key = c[i].substr(0, c[i].indexOf("="));
    value = c[i].substr(c[i].indexOf("=") + 1, c[i].length);
    if (cName.test(key)) {
      cookieArray[cookieArray.length] = value;
    }
  }
  return cookieArray;
}

function setIncapCookie(vArray) {
  try {
//    pos = parse.indexOf("incap_ses");
//    incap = parse.substr(pos, parse.indexOf(";", pos));
//    incapValue = parse.substr(incap.indexOf("=") + 2, incap.length);
    cookies = getSessionCookies();
    digests = new Array(cookies.length);
    for (var i = 0; i < cookies.length; i++) {
      digests[i] = simpleDigest((vArray) + cookies[i]);
    }
    res = vArray + ",digest=" + (digests.join());
  } catch (e) {
    res = vArray + ",digest=" + (encodeURIComponent(e.toString()));
  }
  
  //new cookie
  return parse + "; ___utmvc=" + res;
}

function simpleDigest(mystr) {
  var res = 0;
  for (var i = 0; i < mystr.length; i++) {
    res += mystr.charCodeAt(i);
  }
  return res;
}
