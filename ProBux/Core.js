function probux(username, password, plugins, turn) {
//  sendTweet(username + "_" + turn + " started");
  var response, header, payload, options, cookie;
  var msg = "";
  
  //call login.php and get cookies
  var aUrl = "https://www.probux.com/login.php";
  response = UrlFetchApp.fetch(aUrl);
  
  //remove extra data from cookies: assuming PHPSESSID and __cfduid
  cookie = response.getAllHeaders()["Set-Cookie"];
  var parse = "";
  parse += cookie[0].substring(0, cookie[0].indexOf(";"));
  for(var i = 1; i < cookie.length; i++) {
    parse += "; " + cookie[i].substring(0, cookie[i].indexOf(";"));
  }
  
  options = {
    "method": "POST",
    "payload": {
      "username": username,
      "password": password
    },
    "headers": {
      "cookie": parse
    },
    "followRedirects": false
  };
  
  response = UrlFetchApp.fetch(aUrl, options);
  //login complete
  
  //get user specific cookies CHA, CHU, CHE
  cookie = response.getAllHeaders()["Set-Cookie"];
  for(var i = 0; i < cookie.length; i++) {
    if(cookie[i].indexOf("CHA") >= 0 || cookie[i].indexOf("CHU") >= 0 || cookie[i].indexOf("CHE") >= 0)
      parse += "; " + cookie[i].substring(0, cookie[i].indexOf(";"));
  }
  
  header = {
    "cookie": parse
  };
  
  options = {
    "headers": header
  };
  
  //get ads page
  response = UrlFetchApp.fetch("http://www.probux.com/viewads.php", options);
  var doc = response.getContentText();
  
  var pos = doc.length, text, array, ad, loc, i, j;

  //3 sets of ads
  for(i = 0; i < 3; i++) {
    
    //extract ad detail array
    //WARNING: preserve value of pos across iterations!
    pos = doc.lastIndexOf("[[", pos - 1);
    
    if(pos == -1) //not found
      break;
    
    text = doc.substring(pos, doc.indexOf("]]", pos) + 2);
    array = eval(text);
    
    //for each ad in array
    for(j = 0; j < array.length; j++) {
      try {
        ad = array[j];
        
        //if second turn, check if not viewed today
        if(turn == 0 || ad[10] != 1) {
          
          //fetch ad page
          response = UrlFetchApp.fetch("http://www.probux.com/viewad.php?a=" + ad[3] + "&ne=1", options);
          text = response.getContentText();
          
          //stop for required time
          Utilities.sleep(ad[7] * 1000);
          
          //locate FlashVars parameter
          loc = text.indexOf("FlashVars=") + 13;
          
          payload = {
            "aa": text.substring(loc, text.indexOf("\"", loc)),
            "sw": "1366",
            "sh": "768",
            "saw": "1366",
            "sah": "728",
            "scd": "24",
            "tz": "-330",
            "bp": plugins,
            "hf": "1"
          };
          
          options = {
            "method": "POST",
            "headers": header,
            "payload": payload
          };
          
          //locate avoid_cache parameter
          loc = text.indexOf("\'", text.indexOf("avoid_cache")) + 1;
          
          //post ad clicked data
          response = UrlFetchApp.fetch("http://www.probux.com/ajax/viewclick.php?avoid_cache="
                                       + text.substring(loc, text.indexOf("\'", loc)) + "&cap=0", options);
          text = response.getContentText();
          
          //decide response
          if(text == "ok")
            msg += "k";
          else if(text.indexOf("already") >= 0)
            msg += "v";
          else if(text.indexOf("captcha") >= 0)
            msg += "c";
          else if(text == "error")
            msg += "e";
          else
            msg += text + "\n";
        }
      }
      catch(err) { }
    }
  }
  if(msg.length > 0)
    msg += "\n";
//  Logger.log(msg);

  if(turn == 1) {
    options = {
      "method": "GET",
      "headers": header,
    };
    
    //fetch account page
    response = UrlFetchApp.fetch("http://www.probux.com/account.php", options);
    text = response.getContentText();
    
    //balance
    loc = text.indexOf("$", text.indexOf("strong")) + 1;
    var balance = parseFloat(text.substring(loc, text.indexOf("<", loc)));
    msg += balance;
               
    //try new purchase
    var list = [3, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];
    
    //find largest possible package
    for(var x = 0; x < list.length; x++)
      if(list[x] * 0.2 > balance)
        break;
    x--;
    if(x >= 0) {// && username != '__user__') {             //temporarily blocked for user
      //can purchase packs
      
      response = UrlFetchApp.fetch("http://www.probux.com/refspack.php", options);
      var content = response.getContentText();
      if(content.indexOf("You can rent again in exactly") == -1) {
        //no recent purchases; can proceed
        
        //count referrals to see if it exceeds 200
        var count = 0;
        
        //direct referrals
        loc = text.indexOf("Direct Referrals</a>");
        if(loc > 0) {
          loc = text.indexOf("acc-right", loc) + 11;
          count += parseInt(text.substring(loc, text.indexOf("<", loc)).trim());
        }
        //rented referrals
        loc = text.indexOf("Rented Referrals</a>");
        if(loc > 0) {
          loc = text.indexOf("acc-right", loc) + 11;
          count += parseInt(text.substring(loc, text.indexOf("<", loc)).trim());
        }
        
        if(count < 200) {
          //limit not exceeded; can proceed
          
          loc = content.indexOf("\"", content.indexOf("token") + 6) + 1;
          var token = content.substring(loc, content.indexOf("\"", loc));

          options = {
            "method": "POST",
            "headers": header,
            "payload": {
              "i1": "" + list[x],
              "token": token
            }
          };
          
          response = UrlFetchApp.fetch("http://www.probux.com/refspack.php", options);
          content = response.getContentText();
          if(content.indexOf("The referrals have") > 0) //purchase successful!
            msg += "\n" + list[x] + " new refs";
        }
        else //notify user to go premium
          GmailApp.sendEmail(Session.getActiveUser().getEmail(), username + " has 200 referrals!", username + " has 200 referrals!");
      }
    }
    
    //my clicks
    loc = text.indexOf("acc-right", text.indexOf("Ads clicked")) + 11;
    var myClicks = text.substring(loc, text.indexOf("&", loc)).trim();
    var myClickCnt = parseInt(myClicks);
    myClickCnt -= parseInt(ScriptProperties.getProperty(username + 'OwnClicks'));
    ScriptProperties.setProperty(username + 'OwnClicks', myClicks);
    ScriptProperties.setProperty(username + 'LastClicks', myClickCnt);
    msg += "\n" + myClickCnt;
    
    //referral clicks
    loc = text.indexOf("Referral clicks");
    if(loc > 0) {
      loc = text.indexOf("acc-right", loc) + 11;
      var refClicks = text.substring(loc, text.indexOf("&", loc)).trim();
      var refClickCnt = parseInt(refClicks);
      refClickCnt -= parseInt(ScriptProperties.getProperty(username + 'RefClicks'));
      ScriptProperties.setProperty(username + 'RefClicks', refClicks);
      msg += "\n" + refClickCnt;
    }
    
    //send tweet notification
    text = username + "\npbx\n" + msg;
    if(text.length > 140)
      text = text.substring(0, 140); //truncate
    sendTweet(text);
  }
  
  //save report
  ScriptProperties.setProperty(username + 'Log', ScriptProperties.getProperty(username + 'Log') + '\n' + msg);
}

function sendTweet(tweet){
  // Tweet must be URI encoded in order to make it to Twitter safely
  var encodedTweet = encodeURIComponent(tweet).replace(/!|\*|\(|\)|'/g, '');
  
  // Set up Twitter oAuth parameters
  var oauthConfig = UrlFetchApp.addOAuthService("twitter");
  oauthConfig.setAccessTokenUrl("https://api.twitter.com/oauth/access_token");
  oauthConfig.setRequestTokenUrl("https://api.twitter.com/oauth/request_token");
  oauthConfig.setAuthorizationUrl("https://api.twitter.com/oauth/authorize");
  oauthConfig.setConsumerKey('__key__');
  oauthConfig.setConsumerSecret('__secret__');
  
  var requestData = {
    "method": "POST",
    "oAuthServiceName": "twitter",
    "oAuthUseToken": "always"
  };
  
  try {
    var result = UrlFetchApp.fetch("https://api.twitter.com/1.1/statuses/update.json?status=" + encodedTweet, requestData);
  } catch (e) {
  }
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
  
  return msg;
}