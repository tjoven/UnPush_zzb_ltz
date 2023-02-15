var jstxPath = null;
var headPortraitPath = null;
$(function(){
	sys_ajaxPost("/jstx/default.do?method=getJstxPath",function(json){
		jstxPath = json.jstxPath.substring(3);
		headPortraitPath = json.headPortraitPath.substring(2);
	});
});
