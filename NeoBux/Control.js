function nb___user___0() {
//	viewAds('__user__', '__pass__', 0);
}

function nb___user___1() {
//	viewAds('__user__', '__pass__', 1);
}

function nbap___user__() {
//	adPrize('__user__', '__pass__');
}

function buy___user__() {
//	buyRefs('__user__', '__pass__');
}


function newTrigger() {
	ScriptApp.newTrigger('dummy').timeBased().after(10000).create();
}

function dummy() {
	var props = PropertiesService.getScriptProperties();
	var keys = ['__user__'];
	for(var i in keys) {
		var key = keys[i] + '_pendingAdPrize';
//		props.setProperty(key, true);
//		props.deleteProperty(key);
		Logger.log(key + '=' + props.getProperty(key));
	}
}