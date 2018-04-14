function temp() {
	header =
		{
			"referer" : "http://m.facebook.com/l.php?u=http%3A%2F%2Fwww.paidtoclick.in%2Findex.php%3Fref%3D__username__&h=uAQHZChP1&s=1",
			"user-agent" : "Opera/9.80 (J2ME/MIDP; Opera Mini/6.1.25403/25.842; U; en) Presto/2.5.25 Version/10.54",
			"Accept-Language" : "en-US,en;q=0.9",
			"Accept-Encoding" : "gzip, deflate",
			"Cache-Control" : "no-cache",
			"Connection" : "Keep-Alive",
			"X-Opera-Info" : "ID=411, p=0, f=15, sw=1366, sh=728",
			"X-Opera-ID" : "449696d3d4c5cd3d0181c31652adbf503885d5a99ce672520ea228586ec36ac6",
			"X-Opera-Host" : "s20-15:12425",
			"X-OA" : "1657 2bdf1dc1266c58140f10e5af172e5717577cbb9e4a08f540e1a24f6dc9d858b9",
			"X-OB" : "evenes"
		};
	options =
		{
			"headers" : header
//				"payload" : { "url" : "http://www.paidtoclick.in/index.php?view=join&ref=__username__&" }
		};

	response = UrlFetchApp.fetch("http://www.geopeeker.com/fetch/?url=http://www.paidtoclick.in/index.php?view=join&ref=__username__");
	str = response.getContentText();
	p = str.indexOf("id\" value=\"");
	id = str.substring(p + 11, str.indexOf("\"", p + 12));
	Logger.log(id);
	
	for(i = 2; i < 9; i++) {
		response = UrlFetchApp.fetch("http://node" + i + ".geopeeker.com/node.php?url=http%3A%2F%2Fwww.paidtoclick.in%2Findex.php%3Fview=join%26ref=__username__&mode=render&id=" + id, options);
		Logger.log(response.getContentText());
	}
}