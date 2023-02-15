//$(function(){
//	/*
//	$('.div_body').append("<div id='left_panel' class='panel'></div>");
//	var html= new Array();
//	html.push('<div class="menu_panel_userinfo">');
//	html.push('<div class="div_menu">');
//	html.push('<div class="div_menu_img"><img id="myface" style="width:40px;height:40px;margin-left:10px;margin-top:20px;border:0px;"></div>');
//	html.push('<div class="div_menu_title"><span id="desk_uname"></span></div>');
//	html.push('</div>');
//	html.push('</div>');
//	html.push('<div class="menu_panel_menus" id="div_menus">');
//	html.push('<div id="sysmenus">');
//	html.push('</div>');
//	html.push('</div>');
//	html.push('<div class="menu_panel_setting">');
//	html.push('<div class="home">');
//	html.push('<img src="../img/desk.png" style="width:30px;height:30px;" onclick="gotoDesk();"/>');
//	html.push('</div>');
//	html.push('<div class="exit">');
//	html.push('<img src="../img/exit.png" style="width:30px;height:30px;" onclick="tuichu();"/>');
//	html.push('</div>');
//	html.push('</div>');
//	$("#left_panel").html(html.join(''));
//	*/
//	if (window.localStorage) {  
//        //var str = window.localStorage["menuStr"];
//        var str = window.localStorage.getItem("menuStr");
//	    var menuStr = eval(str);
//		var html = parseMenu(menuStr);
//		$("#sysmenus").append(html);
//		//设置滚动
//		var scr_menus = null;
//		$("#div_menus").height(window.innerHeight - 160);  	
//	    scr_menus = new iScroll("div_menus",{click:true}); 
//	    sys_autoTextarea(scr_menus);	
//    } else {  
//    	sys_alert("您的手机不支持html5的本地存储功能");
//    } 
//	
//	//获取个人头像
//	sys_ajaxGet("/jstx/default.do?method=getUserInfo",{yhid:curid},function(json){
//		$("#desk_uname").text(json.yhxm);
//		$("#myface").attr("src",json.grtx);
//	});
//	
//	$('#left_panel').panel({
//        contentWrap: $('.div_whole'),
//        swipeClose: false,
//        position:'left'
//    });
//	
//	// 通过滑动显示菜单
//	$('.div_body').swipeRight(function(e){
//		$('#left_panel').panel('toggle', 'reveal');
//	});
//	
//	$('.panel').panel('toggle', 'reveal');
//});
//
//function parseMenu(menu){
//	var html= new Array();
//	if(menu){
//		for(i=0;i<menu.length;i++){
//			var title=menu[i].title;
//			//if(title=="待办事宜"||title=="待阅事宜"||title=="站内邮件"){
//			//	html.push('<div class="div_menu2">');
//			//	html.push('<div class="div_menu_img2"><img src="'+getImg(menu[i].iconUrl)+'" style="width:30px;height:30px;margin-top:10px;"></div>');
//			//	html.push('<div class="div_menu_title2"><a href="javascript:void(0);" onclick="gotoMenu(\''+menu[i].url+'\');">'+menu[i].title+'（'+menu[i].msgCount+'）</a></div>');
//			//	html.push('</div>');
//			//}else{
//				html.push('<div class="div_menu2">');
//				html.push('<div class="div_menu_img2"><img src="'+getImg(menu[i].iconUrl)+'" style="width:30px;height:30px;margin-top:10px;"></div>');
//				html.push('<div class="div_menu_title2"><a href="javascript:void(0);" onclick="gotoMenu(\''+menu[i].url+'\');">'+menu[i].title+'</a></div>');
//				html.push('</div>');
//			//}
//		}
//	}
//	
//	return html.join('');
//}
//
//function getImg(img){
//	var retVal = "../img/menu/"+img.substring(img.lastIndexOf("/")+1);
//	if(retVal.indexOf("_android")>0){
//	 	retVal = retVal.replace(/_android/g,"");
//	}
//	return retVal;
//}
//
//function gotoMenu(url){
//	sys_goURL(url);
//}
//
//function gotoDesk(){
//	sys_goURL("../desk/desk.html");
//}
//
//function tuichu(){
//	if(isAndriod){
//		window.webview.exit();
//	} else if(isIphone){
//		window.location.href='obj-c://exitIos';
//	}
//}
//
//
//function loadjscssfile(filename,filetype,id){
//    if(filetype == "js"){
//        var fileref = document.createElement('script');
//        fileref.setAttribute("type","text/javascript");
//        fileref.setAttribute("src",filename);
//    }else if(filetype == "css"){
//    
//        var fileref = document.createElement('link');
//        fileref.setAttribute("rel","stylesheet");
//        fileref.setAttribute("type","text/css");
//        fileref.setAttribute("href",filename);
//        fileref.setAttribute("id",id)
//    }
//   if(typeof fileref != "undefined"){
//        document.getElementsByTagName("head")[0].appendChild(fileref);
//    }
//    
//}
//
//
