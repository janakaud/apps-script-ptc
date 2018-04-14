function test() {
  var token = "d033713778fd95c12f115762a64290c5";
  var z = ["0.3765248411800", "0.2441281478386", "0.0078102783299"];
  var obj = {
    "x": 0,
    "ver": "1075",
    "log_id": token,
    "useragent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36",
    "refer": "",
    "ident": 0,
    "flash": 0,
    "scresw": 1366,
    "scresh": 768,
    "wbresw": 1366,
    "wbresh": 293,
    "mobile": 0,
    "mobile_os": "No"
  };
  var action = [9, 5, 23];
  for(var j = 0; j < 3; j++) {
    obj.action = action[j];
    obj.x = j > 0 ? 1 : 0;
    obj.z = z[j];
    obj.hash = hex_md5(obj["log_id"] + "-" + obj["ver"] + "-" + obj["action"] + "-" + obj["x"] + "-" + obj["z"] + "-" + obj["ident"] + "cyr3Aw3ç9$jgs^AS#E3CaS*B{CFS^2m!");
    Logger.log(JSON.stringify(obj));
    Logger.log(wop(Utilities.base64Encode(JSON.stringify(obj))));
  }
}

function adFly() {
  var url = "http://adf.ly/__url__";
  var req = UrlFetchApp.fetch(url, {followRedirects: false});
  var cookies = req.getAllHeaders()["Set-Cookie"];
  var cookie = cookies[0].substring(0, cookies[0].indexOf(";"));
  for (var i = 1; i < cookies.length; i++) {
    cookie += "; " + cookies[i].substring(0, cookies[i].indexOf(";"));
  }
  
  var page = req.getContentText();
  var pos = page.indexOf("log_token");
  if (pos < 0)
    return;
  pos += 13;
  var token = page.substring(pos, page.indexOf("'", pos));

  var obj = {
    "x": 0,
    "ver": "1075",
    "log_id": token,
    "useragent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36",
    "refer": "",
    "ident": 0,
    "flash": 0,
    "scresw": 1366,
    "scresh": 768,
    "wbresw": 1366,
    "wbresh": 361,
    "mobile": 0,
    "mobile_os": "No"
  };

  var action = [9, 5, 23];
  var wait = [3000, 2000, 4000];
  
  for(var j = 0; j < 3; j++) {
    Utilities.sleep(wait[j]);
    obj.action = action[j];
    obj.z = new String(Math.random()).substring(0, 15);
    obj.hash = hex_md5(obj["log_id"] + "-" + obj["ver"] + "-" + obj["action"] + "-" + obj["x"] + "-" + obj["z"] + "-" + obj["ident"] + "cyr3Aw3ç9$jgs^AS#E3CaS*B{CFS^2m!");
    
    var params = {
      "method": "POST",
      "host": "adf.ly",
      "headers": { "cookie": cookie, "referer": url },
      "payload": { "hithere": wop(Utilities.base64Encode(JSON.stringify(obj))) }
    };
    req = UrlFetchApp.fetch("http://adf.ly/callback/" + token, params);
    obj.x = 1;
  }
}

function hex_md5(str) {
  var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, str, Utilities.Charset.UTF_8);
  var hash = "";
  for (i = 0; i < signature.length; i++) {
    var byte = signature[i];
    if (byte < 0)
      byte += 256;
    var byteStr = byte.toString(16);
    // Ensure we have 2 chars in our byte, pad with 0
    if (byteStr.length == 1) byteStr = '0' + byteStr;
    hash += byteStr;
  } 
  return hash;
}

function wop(A) {
    var p = "";
    while (A.lastIndexOf("=") == A.length - 1) {
        A = A.substr(0, A.length - 1);
        p += "=";
    }
    var V = A.length;
    if (V % 2 != 0) {
        A = A.substr(Math.floor(V/2) + 1, V) + A.charAt(Math.floor(V/2)) + A.substr(0, Math.floor(V/2));
    } else {
        A = A.substr(Math.floor(V/2), V) + A.substr(0, Math.floor(V/2));
    }
    var I = "",
        y = 0,
        G = V - 1;
    for (var e = 0; e < V; e++) {
        if (e % 2 == 0) {
            I += A.charAt(y);
            y++;
        } else {
            I += A.charAt(G);
            G--;
        }
    }
    return I + p;
}