function bithits() {
  response = UrlFetchApp.fetch("http://www.bithits.info/index.php?ref=__ref ID__");
  
  //cookie data
  cookie = response.getAllHeaders()['Set-Cookie'];
  parse = new String(cookie);

  //POST newurl with cookies
  header = { "cookie" : parse };

  payload = 
    {
      "btcaddr" : "__BTC wallet__",
    };

  options =
    {
      "method" : "POST",
      "headers" : header,
      "payload" : payload
    };

  UrlFetchApp.fetch("http://www.bithits.info/submit.php", options);
}
