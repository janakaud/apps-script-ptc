function Payloog() {
  var page = UrlFetchApp.fetch("http://hidemyass.com");
  var cookie = page.getAllHeaders()["Set-Cookie"];
  cookie = cookie.substring(0, cookie.indexOf(";"));

  var params = {
    "method": "POST",
    "headers": { "cookie": cookie },
    "payload": {
      "u": "http://payloog.com/?invite=__invite ID__",
      "ssl": "0",
      "server": "0",
      "obfuscation": "1"
    }
  };
  page = UrlFetchApp.fetch("http://hidemyass.com/process.php", params);
}
