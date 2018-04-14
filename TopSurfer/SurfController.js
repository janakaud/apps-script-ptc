function SurfBar__user() {
	SurfBar("__username__", "__password__", "__user ID__");
}

function SoloAds__user() {
	SoloAds("__username__", "__password__", "__user ID__");
}

function Reset__user() {
	Reset("__username__", "__password__", "__user ID__");
}

function SurfBalance__user() {
	SurfBalance("__username__", "__password__");
}

function SoloCount__user() {
	SoloCount("__username__", "__password__");
}

function Reporter() {
	sendTweet("TopSurfer\n" + ScriptProperties.getProperty("__user ID___sb") + "\n" + ScriptProperties.getProperty("__user ID___sa") + 
		"\n\n" + SurfBalance("__username__", "__password__").split("~||~").join("\n") + "\n\n" + 
		SoloCount("__username__", "__password__"));
}