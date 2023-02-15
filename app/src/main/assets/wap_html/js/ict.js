var sys_expendRow = {};//是否扩展行
var sys_klbts={};//列表为空添加没有数据提示
$(function(){
	//修改select
	$("select").each(function(){
    	var me = $(this);
    	
    	var divId = "divselect_"+me.attr("id");
    	me.hide();
    	var tsText = '<span class="form_cell_palceholder">请选择</span>';
    	var selindex=this.selectedIndex;
    	if(selindex!=-1){
    		tsText= this.options[selindex].text;  
    	}
    	$('<div id="'+divId+'" class="form_cell_item">'+tsText+'</div>').insertAfter(me);
    	me.parent().parent().get(0).addEventListener("click",function(e){
	    		var selectId = me.attr("id").replace('divselect_','');
	    		//setTimeout(function(){
	    		renderSelectDiv(selectId);
	    		//},300)
    	},false,1);

    });

    
   	if(isPad){
		if($("#sys_left").length>0&&$("#sys_left").children().length==0){
			//$("#sys_left").append('<div onclick="testurl(1);">首页</div><div onclick="testurl(2);">产品</div><div onclick="testurl(3);">客户</div><div>营销</div><div>设置</div><div>退出</div>');
		}
	}else if(sys_addMeun&&$("#div_bottomMenu").length==0&&!isPad){
		if(sys_addMeun){
		var c_form_show = $(".c_form_show")
		var forms = $("form");
		if(c_form_show.length==0&&forms.length==0){
			var bottomMenu = '<DIV class="div_bottomMenu_blank"></DIV><div id="div_bottomMenu" class="div_bottomMenu div_bottomMenu_height">'
			for(var z in sys_bottomMenuURL){
				var json = sys_bottomMenuURL[z];
				bottomMenu = bottomMenu + '<div class="'+z+'" id="'+z+'">'+json.mc+'</div>';
			}
				bottomMenu = bottomMenu +'</div>';
			//bottomMenu = bottomMenu + '<div class="div_tuichu" id="div_tuichu">退出</div></div>';
			//'<div id="div_bottomMenu" class="div_bottomMenu div_bottomMenu_height"><div class="div_shouye" id="div_shouye">首页</div>';
			//bottomMenu = bottomMenu + '<div class="div_chanpinzs" id="div_chanpinzs">产品</div><div class="div_keshust" id="div_keshust">客户</div><div class="div_yinxiao" id="div_yinxiao">营销</div><div class="div_shezhi" id="div_shezhi">任务</div><div class="div_tuichu" id="div_tuichu">退出</div></div>';
			$("body").append(bottomMenu);
			renderBottomButton();
			bindBottomButton();
			msgNOreadnum();
		}
		}
	}
  
})
function renderSelectDiv(selId){
	var selectValue = $("#"+selId).val();
	var div_sys_outerSEL = $("#div_sys_outerSEL");
	var _innerscroll = null;
	if(div_sys_outerSEL.length==0){
		var div_sys_outerSEL = '<div id="div_sys_outerSEL" style="display: none;">';
		div_sys_outerSEL = div_sys_outerSEL +'<div id="select_toolbar"><span class="btn_bak" id="btn_select_cancel"></span><h1 class="toolbar_title">请选择</h1></div><div id="sys_selectScoll"></div></div>';
		//<div id="div_sys_select"></div>
		$("body").append(div_sys_outerSEL);
      	//选项少空白区域移动会显示后面内容
		document.getElementById("div_sys_outerSEL").addEventListener("touchmove", function(e){
      		e.preventDefault();
      	}, false);
     
     	/*$('#select_toolbar').toolbar().fix({
		    top: 0
		});*/
		$('#select_toolbar').toolbar({fixed:false});
		
		$('#btn_select_cancel').on('click',function(e){
			$("#div_sys_outerSEL").hide();
			if(_innerscroll){
				_innerscroll=null;
			}
		})
	}
	
	var s_height = 0;
	var div_search_bm = "";
	if(selId == 'org_bmid'){//增加搜索区域
		if($("#sys_search_bm").length ==0){
			div_search_bm ='<div id="sys_search_bm" style="border-bottom:1px solid #b2b2b2;width:100%;height:40px;"><input type="text" id="text_bm" name="text_bm" placeholder="请输入社区名或首字母" style="border:1px solid #E7E7E7;width:160px;height:30px;line-height:30px;margin-top:5px;"/><input type="button" style="margin-left:5px;width:40px;height:30px;font-size:15px;color: #ffffff;font-family: 微软雅黑;background-color: #9f0909;border:0px;" value="搜索" onClick="searchBm();"/></div>';
			$("#select_toolbar").after(div_search_bm);
		}else{
			$("#text_bm").val("");
		}
		s_height = 40;
	}else{
		if($("#sys_search_bm").length>0){
			$("#sys_search_bm").remove();
		}
	}
	
	var html = '<div id="div_sys_select">';
	$("#"+selId).children().each(function(){
		var me = $(this);

		if(me.val()){
			var checkedStr = selectValue==me.val()?'checked="checked"':""
			html = html + '<div class="option"><div class="optText">'+me.text()+'</div><div class="optSelected">'
			html = html + '<input type="radio" name="selectname_'+selId+'" value="'+me.val()+'" '+checkedStr+'/></div></div>';
		}
	});
	html =  html + '</div>';
	$("#sys_selectScoll").empty().html(html);
	$("#div_sys_outerSEL").show();
	//设置内滚动
    $("#sys_selectScoll").height(window.innerHeight-52-s_height);
    _innerscroll  = new iScroll("sys_selectScoll",{click:true});
    var options = document.getElementsByClassName('option');
    for(var i=0;i<options.length;i++){
    	var elem = options[i];
    	elem.addEventListener("click",function(e){
    		var me =  $(this);	
    		//setTimeout(function(){
	    	var name =me.find('input').eq(0).attr("name");
    		var selectId = name.replace("selectname_","");
    		var value = me.find('input').eq(0).val();
    		if(value){
		    	var text = me.find('.optText').eq(0).text();
				$("#divselect_"+selectId).empty().text(text);
				$("#"+selectId).val(value);
				$("#div_sys_outerSEL").hide();
				var callback = $("#"+selId).attr("onchange");
			   	if(callback){
			   	 	eval(callback);
			   	}
			}
			if(_innerscroll){
				_innerscroll=null;
			}
    	},false,2);
    }
    
}
/*
分页数据参数
	{
		table_list:{
			page_cur:1,  	当前页
			page_allPage:1  总页数
		}
	}
*/
var sys_pageData = {};
function sys_getPageNum(tableId,dir){
	if(dir=='up'){
		return 1;
	}
	if(sys_pageData[tableId]){
		var page_cur = parseInt(sys_pageData[tableId].page_cur);
		var page_allPage = parseInt(sys_pageData[tableId].page_allPage);
		if(page_cur>=page_allPage){
			//alert("已到最后一页！");
			return false;
		}
		return page_cur+1;
	}else{
		return 1;
	}
}
function sys_mask(){
//	var mask = $("#sys_mask");
//	if(mask.length==0){
//		var maskHTML = '<div id="sys_mask"><div id="sys_mask_inner"><div class="sys_mask_block" id="rotate_01"></div><div class="sys_mask_block" id="rotate_02"></div>';
//		maskHTML = maskHTML +'<div class="sys_mask_block" id="rotate_03"></div><div class="sys_mask_block" id="rotate_04"></div><div class="sys_mask_block" id="rotate_05"></div>';
//		maskHTML = maskHTML +'<div class="sys_mask_block" id="rotate_06"></div><div class="sys_mask_block" id="rotate_07"></div><div class="sys_mask_block" id="rotate_08"></div>';
//		maskHTML = maskHTML +'<div class="clearfix"></div></div> </div>';
//		$("body").append(maskHTML);
//	}
//	mask.css('display','-webkit-box');	
}
function sys_unmask(){
//	var mask = $("#sys_mask");
//	mask.css('display','none');	
}
$(document).on('ajaxError',function(e,xhr,options,error){
	sys_unmask();
	//alert(xhr.responseText);
	if(xhr.responseText.indexOf('login.do?method=exit')>-1){
		//sys_alert('登录状态异常，请重新登录!',function(){
			var baseURL = getBaseURL();
			//window.location.href=baseURL+'login.html'
			sys_goURL(baseURL+'login.html');	
		//});
		return ;
	}
	alert("请求失败");
});
function sys_ajaxGet(params,data,callback){
	if(!params){
		alert("请设置请求地址！");
	}
    if(isAndriod){//安卓ajax请求
		sys_ajax_andriod(params,data,callback);
		return ;
	}
	var dir = "down";
	var url = params
	if(typeof params !='string'){
		dir = params.dir;
		url = params.url;
	}
	url = sys_ctx+url+"&_getTime="+new Date().getTime();
	if(sys_ctx.indexOf("http://")==-1&&sys_ctx.indexOf("https://")==-1){
		sys_alert("请设置服务器地址！");
		return false;
	}
	sys_mask();
	if (callback===undefined){
		if (data===undefined){
			$.getJSON(url, function (json) {
				sys_unmask();
				bind(json,dir);
			});
		}else{
			if(typeof data == 'function'){
				$.getJSON(url,function(json){
					sys_unmask();
					data.call(this,json)
				});
			}else{
				$.getJSON(url,data,function (json) {
					sys_unmask();
					bind(json,dir);
				});
			}
		}
	}else{
		$.getJSON(url,data,function(json){
				sys_unmask();
				callback.call(this,json)
		});
	}
}
function sys_ajaxPost(params,data,callback){
	if(!params){
		sys_alert("请设置请求地址！");
	}
	if(isAndriod){//	安卓ajax请求
		sys_ajax_andriod(params,data,callback);
		return ;
	}
	var dir = "down";
	var url = params
	if(typeof params !='string'){
		dir = params.dir;
		url = params.url;
	}
	if(sys_ctx.indexOf("http://")==-1&&sys_ctx.indexOf("https://")==-1){
		sys_alert("请设置服务器地址！");
		return false;
	}
	sys_mask();
	if (callback===undefined){
		if (data===undefined){
			$.ajax({
				type: 'POST',
				url:sys_ctx+url,
				dataType: 'json',
				success:function(json){
					sys_unmask();
					bind(json,dir);
				}
			});
		}else{
			if(typeof data == 'function'){
				$.ajax({
					type: 'POST',
					url:sys_ctx+url,
					dataType:'json',
					success:function(json){
						sys_unmask();
						data.call(this,json,dir);
					}
				});
			}else{
				$.ajax({
					type: 'POST',
					data:data,
					url:sys_ctx+url,
					dataType:'json',
					success:function(json){
						sys_unmask();
						bind(json,dir);
					}
				});
			}
		}
	}else{
		$.ajax({
			type:'POST',
			data:data,
			url:sys_ctx+url,
			dataType:'json',
			success:function(json){
				sys_unmask();
				callback.call(this,json,dir);
			}
		});
	}
}

var sys_khdParams = {};//所有请求的匿名回调函数、参数
//安卓的请求，通过壳
function sys_ajax_andriod(params,data,callback){
	var url = params;
	var sys_timeStamp = new Date().getTime();
	if(typeof params !='string'){
		url = params.url;
		sys_khdParams['p'+sys_timeStamp] = params;
	}
	if(!url){return false;}
	if(sys_ctx.indexOf("http://")==-1&&sys_ctx.indexOf("https://")==-1){
		sys_alert("请设置服务器地址！");
		return false;
	}
	var postParams = "sys_timeStamp="+sys_timeStamp;
	if(data&&typeof data!='function'){
		var _unmask = data.unmask;
		if(!_unmask){
			sys_mask();
		}
		if(typeof data=='string'){
			postParams = postParams +"&"+data;
		}else{
			for(var k in data){
				var v = data[k];
				if(v instanceof Array){
					var v1 = "";
					for(var i=0;i<v.length;i++){
						v1 = v1+"~"+v[i];
					}
					v = v1.replace("~","");
				}
				postParams = postParams +"&"+k+"="+v;
			}
		}
	}else{
		sys_mask();
	}
	if(callback){
		sys_khdParams['c'+sys_timeStamp] = callback;
	}else{
		if(data&&typeof data=='function'){
			sys_khdParams['c'+sys_timeStamp] = data;
		}else{
			sys_khdParams['c'+sys_timeStamp] = bind;
		}
	}
	url = encodeURI(url);
	postParams = decodeURIComponent(postParams,true); 
	window.webview.asyncHttpRequest(url,postParams,''+sys_timeStamp,'execCallBack');
}
//壳上统一回调函数
function execCallBack(json,tempTimeStamp){
	sys_unmask();
	if(typeof json =="string"){
		json = eval("("+json+")");	
	}
	if(json.error&&json.error.indexOf('login.do?method=exit')>-1){
		//sys_alert('登录状态异常，请重新登录!',function(){
			var baseURL = getBaseURL();
			sys_goURL(baseURL+'login.html');	
		//});
		return ;
	}
	var callback = sys_khdParams['c'+tempTimeStamp];
	var params = sys_khdParams['p'+tempTimeStamp];
	delete sys_khdParams['c'+tempTimeStamp];
	delete sys_khdParams['p'+tempTimeStamp];
	if(callback){
		callback.call(this,json,params?params.dir:"");
	}
}
//壳上请求发生异常回调函数
function exceptionCallBack(){
	sys_unmask();
}

//oDir 有的绑定列表不需要去除格式调整，例如在后台添加字体等信息
function bind(json,oDir){
	sys_hideLoadMore = {};
	var dir = 'down';
	var removeStyle  = true;
	if(typeof oDir =='string'){
		dir = oDir;
	}else if(typeof oDir =='object'){
		dir = oDir.dir?oDir.dir:"down";
		removeStyle = (typeof(oDir.removeStyle)!='undefined')?oDir.removeStyle:true;
	}
	for(var k in json){
		switch(k){
			case "selectData":
				for(selk in json.selectData){
					bindSelect(selk,json.selectData[selk]);
				}
				break;
			case "formData":
				bindForm(json.formData);
				break;
			case "gridData":
				for(gridk in json.gridData){
					bindTable(gridk,json.gridData[gridk],dir,removeStyle);
				}
				break;
			default :
				commonBind(k,json[k]);
		}
	}
}
function bindSelect(k,v){
	var el = document.getElementById(k);
	if(!el){
		return ;
	}
	if (v instanceof Array){
		$("#"+k).empty();
		for(var i=0;i<v.length;i++){
			if ((i==0)&&(v[i].dm!="-")&&(v[i].dm!="+")){
				el.options.add(new Option("请选择","")); 
			}
			el.options.add(new Option(v[i].mc,v[i].dm));
		}
	}else{
		$("#"+k).val(v);
		bindSelectText(k);
	}
}
function bindSelectText(id){
	var obj = document.getElementById(id);
	var index = obj.selectedIndex; 
	if(index!=-1){
		var text = obj.options[index].text; 
		var value = obj.options[index].value; 
		if(value){
			$("#divselect_"+id).text(text);
		}
	}
}
function bindInput(eles,v){
	var obj= eles[0];	
	switch (obj.type) {
		case "text":
		case "hidden":
		case "password":
			v = formatTime(v); 
			obj.value=v; 
			break;
		case "radio" :
		case "checkbox" :
			for(var i=0;i<eles.length;i++){
				var val = eles[i].value;
				if(v.indexOf(val)>-1){
					 eles[i].checked = true;
				}else{
					 eles[i].checked = false;
				}
			}
			break;
	}
}
function bindForm(json){
	for(var k in json){
		commonBind(k,json[k]);
/*
		var ele = "";
		var eles = document.getElementsByName(k);
		if(eles.length==0){
			ele = document.getElementById(k);
			if(!ele){
				continue ;
			}
			eles[0] = ele;
		}else{
			ele = eles[0];
		}
		switch(ele.tagName){
			case "INPUT":
				bindInput(eles,json[k]);
			break;
			case 'TEXTAREA':
				ele.innerText = json[k];
			break;
			case "SELECT": 
				bindSelect(k,json[k]);
			break;
			case 'DIV': 
			case 'SPAN': 
			case 'TD':
			case 'LI':
				ele.innerHTML = json[k];
			break;
		}
*/
	}
}
function commonBind(k,v){
		var ele = "";
		var eles = document.getElementsByName(k);
		if(eles.length==0){
			ele = document.getElementById(k);
			if(!ele){
				return ;
			}
			eles[0] = ele;
		}else{
			ele = eles[0];
		}
		switch(ele.tagName){
			case "INPUT":
				bindInput(eles,v);
			break;
			case 'TEXTAREA':
				v = formatTime(v); 
				ele.innerText = v;
			break;
			case "SELECT": 
				bindSelect(k,v);
			break;
			case 'DIV': 
			case 'SPAN': 
			case 'TD':
			case 'LI':
				v = formatTime(v); 
				ele.innerHTML = v;
			break;
		}
}
/*
格式化时间
*/
function formatTime(v){
	var regtime = /(\d{1,2}:\d{1,2}:\d{1,2})(\.0)/;
	if(typeof v=='string'){
		return v.replace(regtime,'$1');
	}
	return v;
}
var sys_hideLoadMore = {};//显示加载更多
function bindTable(k,v,dir,removeStyle){
	var template = $("#"+k).children().first();
	var templateHtml = template.html();
	var tag = template[0].tagName;
	var html = "";
	var tableData = v.data;
	//pad移除列表中的箭头
	if(isPad){
		templateHtml = templateHtml.replace(/list_row_col3(?=\s|\")/ig,"");
	}
	for(var i=0;i<tableData.length;i++){
		var rowData=tableData[i];	
		var tempHtml=templateHtml;
		for(var j in rowData){
			var value = rowData[j];
			if(typeof value =='string'&&removeStyle){
				value = value.replace(/<.*?>/ig,"");
			}
			value = formatTime(value);
			var re=eval("/{"+j+"}/ig");
			tempHtml = tempHtml.replace(re,value);
		}
		tempHtml = tempHtml.replace(/{.*?}/ig,"");
		tempHtml = "<"+tag+">"+tempHtml+"</"+tag+">";
		html = html + tempHtml;
	}
	var _dataList = $("#"+k).children();
	var _dataLen = _dataList.length;
	if(dir=="up"){
	   _dataList.each(function(index){
     		if(index!=0){
     			$(this).remove();
     		}
       });
       _dataLen = 1;
	}
	var longTabCallback = false;//长按函数
	var swipeLeftCallback = false;//左侧滑函数
	var swipeRightCallback = false;//右侧滑函数
	try{
		eval("callback_trclick_"+k+"_longtap");
		longTabCallback = true;
	}catch(e){}
	try{
		eval("callback_trclick_"+k+"_swipeLeftCallback");
		swipeLeftCallback = true;
	}catch(e){}
	try{
		eval("callback_trclick_"+k+"_swipeRightCallback");
		swipeRightCallback = true;
	}catch(e){}
	$("#"+k).append(html);
	$("#"+k).children().each(function(index){
		if(index>=_dataLen){
			var t= $(this);
			t.on("click",function(){
				//点击某一行更换背景图
	    		if(isPad){
	    			if(t.parent() && t.parent().children()){
	    				t.parent().children().css('background','#ffffff');
	    			}	    			
					t.css('background','#d6d5d3');
	    		}
	    		var _target=event.target; 
	    		if(!$(_target).hasClass("c_nonexec")){
	    			eval("callback_trclick_"+k+"('"+t.children().first().text()+"')");
	    		}
			});
			if(longTabCallback){
				t.longTap(function(){
					eval("callback_trclick_"+k+"_longtap(t)");
				});
			}
			if(swipeLeftCallback){
				t.swipeLeft(function(){
					eval("callback_trclick_"+k+"_swipeLeftCallback(t)");
				});
			}
			if(swipeRightCallback){
				t.swipeRight(function(){
					eval("callback_trclick_"+k+"_swipeRightCallback(t)");
				});
			}
			
		}
	});
	sys_pageData[k]=v.page;
	var heightcz = $("#div_"+k).parent().height()-$("#"+k).height();//空白行填充计算
	if(heightcz>0){//下方补充空白区域，不然不能刷新
		if($("#"+k).children().length>1){//记录不能为空
			if(typeof(sys_expendRow[k])!='undefined'&&!sys_expendRow[k]){
				return ;
			}
			html = "";
			templateHtml = templateHtml.replace(/<img.*?>/ig,"");
			templateHtml = templateHtml.replace(/div_jiantou(?=\s|\")/ig,"");
			templateHtml = templateHtml.replace(/list_row_col3(?=\s|\")/ig,"");
			templateHtml = templateHtml.replace(/list_row_c(?=\s|\")/ig,"");//红色圈样式
			templateHtml = templateHtml.replace(/<input.*?>/ig,"");//输入框替换
			templateHtml = templateHtml.replace(/{.*?}/ig,"");
			
			var reg = /<[^\/<>]+?>([^<>]*?)(?=<)/ig
			var tempHtml="<"+tag+">"+templateHtml+"</"+tag+">";;
			tempHtml = tempHtml.replace(reg,function(input,s1){
				return input.replace(s1,"");
			});
			
			$("#"+k).append(tempHtml);
			var liHeight = $("#"+k).children().last().height();
			var liNum = Math.ceil(heightcz/liHeight);
			
			for(var i=0;i<liNum-1;i++){
				html = html + tempHtml;
			}
			
			$("#"+k).append(html);
		}else{
			if(!sys_klbts[k]){
				$("#"+k).append('<li><div style="font-size: 16px;background: white;height: 80px;display: -webkit-box;-webkit-box-pack: center;-webkit-box-align: center;-webkit-box-orient:vertical"><div>您还没有使用该项功能</div><div>没有数据记录！</div></div></li>');
			}
			sys_hideLoadMore[k] = true;
		}
	}
}
function execute(url){
    var iframe = document.createElement("IFRAME");
    iframe.setAttribute("src", url);
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
}
//人员选择
function sys_ryxz(sys_fsfw,sys_fsfw_mc,sys_bm,sys_qxid,sys_mkdm){
	if(sys_bm===undefined){//是否可以选择部门 0-可选 其他-不可选
		sys_bm = '0';
	}
	if(sys_qxid===undefined){//权限id 用于需要用数据授权的情况
		sys_qxid = '';
	}
	if(sys_mkdm===undefined){//模块代码 用于根据模块代码获取数据范围情况
		sys_mkdm = '';
	}
	var yhfw = $("#"+sys_fsfw).val();
	var url='/org/ryxz.html?sys_fsfw='+sys_fsfw+'&sys_fsfw_mc='+sys_fsfw_mc+'&sys_bm='+sys_bm+'&yhfw='+yhfw+'&sys_qxid='+sys_qxid+'&sys_mkdm='+sys_mkdm;
	if(isPad){
		sys_goURL('..'+url,{_view:'pop',_pop_size:'600,600'});
		$("#divfloat_close").remove();
	}else{
		if(isAndriod){//android端
	        window.webview.openNewWin(url);   //调用外壳方法
		}else if(isIphone){//iphone端
	        execute("obj-c://openNewWin/"+url);
		}else{//电脑端
	        var iTop = (window.screen.availHeight-30-365)/2;        
	   		var iLeft = (window.screen.availWidth-10-700)/2; 
	   		window.open(sys_ctx+sys_gcml+url,'','height=365,innerHeight=365,width=700,innerWidth=700,top='+iTop+',left='+iLeft+',top=0,left=0,toolbar=no,menubar=no,location=no,scrollbars=no,resizable=no');
		}
	}
}

//人员选择
function sys_ryxz2(sys_fsfw,sys_fsfw_mc,sys_bm,sys_qxid,sys_mkdm){
  if(sys_bm===undefined){//是否可以选择部门 0-可选 其他-不可选
      sys_bm = '0';
  }
  if(sys_qxid===undefined){//权限id 用于需要用数据授权的情况
      sys_qxid = '';
  }
  if(sys_mkdm===undefined){//模块代码 用于根据模块代码获取数据范围情况
      sys_mkdm = '';
  }
  var yhfw = $("#"+sys_fsfw).val();
  var url='/org/bmxz.html?sys_fsfw='+sys_fsfw+'&sys_fsfw_mc='+sys_fsfw_mc+'&sys_bm='+sys_bm+'&yhfw='+yhfw+'&sys_qxid='+sys_qxid+'&sys_mkdm='+sys_mkdm;
  if(isPad){
      sys_goURL('..'+url,{_view:'pop',_pop_size:'600,600'});
      $("#divfloat_close").remove();
  }else{
      if(isAndriod){//android端
          window.webview.openNewWin(url);   //调用外壳方法
      }else if(isIphone){//iphone端
          execute("obj-c://openNewWin/"+url);
      }else{//电脑端
          var iTop = (window.screen.availHeight-30-365)/2;
          var iLeft = (window.screen.availWidth-10-700)/2;
          window.open(sys_ctx+sys_gcml+url,'','height=365,innerHeight=365,width=700,innerWidth=700,top='+iTop+',left='+iLeft+',top=0,left=0,toolbar=no,menubar=no,location=no,scrollbars=no,resizable=no');
      }
  }
}


function sys_ryxz_confirm(sys_fsfw,sys_fsfw_mc,choose,choose_mc){
	$("#"+sys_fsfw).val(choose);
	$("#"+sys_fsfw_mc).val(choose_mc);
	var callback = $("#"+sys_fsfw).attr("callback");
   	if(callback){
   	 	eval(callback);
   	}
}
//截取浏览器访问参数
function getQueryStringRegExp(name){  
	var url = sys_URLParams==""?window.location.href:sys_URLParams;
    var reg = new RegExp("(^|\\?|&)"+ name +"=([^&]*)(\\s|&|$)", "i");  
    if(isAndriod){
	    //if (reg.test(window.webview.getUrlparam())) return unescape(RegExp.$2.replace(/\+/g, " "));
    }
    if (reg.test(url)) return unescape(RegExp.$2.replace(/\+/g, " "));
    if (reg.test(window.localStorage.getItem("urlParam"))) return unescape(RegExp.$2.replace(/\+/g, " "));
    return ""; 
}
//替换网页中图片路径
function replaceImgPath(nr){	
    var sys_temp=sys_ctx.substring(sys_ctx.indexOf('//')+2,sys_ctx.length);
    if(sys_temp.indexOf('/')>-1){
       sys_temp=sys_temp.substring(0,sys_temp.indexOf('/'));
    }	       
    var sys_ctx_1=sys_ctx.substring(0,sys_ctx.indexOf('//')+2)+sys_temp;
    var reg=new RegExp("<(.*?)(src|href)=\"(?!http)(.*?)\"(.*?)>","ig");
    nr=nr.replace(reg,"<$1$2=\"" + sys_ctx_1 + "$3\"$4>");
    return nr;
}
//处理附件
function getFj(json){
	if(!json){
		return "";
	}
	var retHtml = json.att_upload_new;
	if(!retHtml){
		return "";
	}
	if(retHtml=="0 个 附件 "){
		return "";
	}
	//var url = window.location.protocol+'//'+window.location.host;//  http://127.0.0.1:8080/   
	var reg = /href='/ig;
	retHtml = retHtml.replace(reg,"href='"+getUrl());
	//alert(retHtml);
	return retHtml;
}
//去掉上下文
function getUrl(){
    //var url=''+window.hosturl.getHostUrl();
    var url = sys_ctx;
    var index = url.indexOf("/",7);
    if(url.indexOf("https") > -1){
    	index = url.indexOf("/",8);
    }
    if(index>0){
        url = url.substring(0,index);
    }
    return url;
}

function sys_alert(msg,callback){
	var div = $("#sys_alert");
	if(div.length==0){
		$("body").append('<div id="sys_alert"><p></p></div>');
	}
	var alert_dialog = $('#sys_alert').dialog({
        autoOpen: false,
        closeBtn: false,
        title:'信息提示'
	 });
	
	$("#sys_alert").find("p").eq(0).text(msg);
	$('#sys_alert').dialog('open'); 
	setTimeout(function(){
		$('#sys_alert').dialog('close');
        if(callback){
        	callback.call(this);
        }
	},1000);
}

function sys_confirm(msg,callback){
	var div = $("#sys_confirm");
	if(div.length==0){
		$("body").append('<div id="sys_confirm"><p></p></div>');
	}
    $('#sys_confirm').dialog({
        autoOpen: false,
        closeBtn: false,
        buttons: {
            '确定': function(){
                this.destroy();
                if(callback){
                	callback.call(this,true);
                }
            },
            '取消':function(){
            	this.destroy();
                if(callback){
                	callback.call(this,false);
                }
            }
        }
    });
	
	$("#sys_confirm").find("p").eq(0).text(msg);
	$('#sys_confirm').dialog('open'); 
}


function getListHeight(){
	  var height = 0;
	  var ui_toolbar = $(".ui-toolbar");
	  if(ui_toolbar.length>0){
	  	height = ui_toolbar.eq(0).height()*ui_toolbar.length;
	  }
	  var tabsBlank = $(".div_tabs");
	  if(tabsBlank.length>0){
	  	height = height+tabsBlank.eq(0).height()*tabsBlank.length;
	  }
	  var bottomMenuBlank = $(".div_bottomMenu_blank");
	  if(bottomMenuBlank.length>0){
	  	height = height+bottomMenuBlank.eq(0).height()*bottomMenuBlank.length;
	  }
	  var tabsHeight = $(".ui-tabs-nav");
	  if(tabsHeight.length>0){
	  	height = height+tabsHeight.eq(0).height()*tabsHeight.length;
	  }
	  var div_querenxuanze = $(".div_querenxuanze");
	  if(div_querenxuanze.length>0){
	  	height = height+div_querenxuanze.eq(0).height()*div_querenxuanze.length;
	  }
	   var div_other_40 = $(".div_other_40");
	  if(div_other_40.length>0){
	  	height = height+div_other_40.eq(0).height()*div_other_40.length;
	  }
	   var div_other_50 = $(".div_other_50");
	  if(div_other_50.length>0){
	  	height = height+div_other_50.eq(0).height()*div_other_50.length;
	  }
	  return height;
}
function form_getzbxx(url){
	//var isAndriod = (/android/gi).test(navigator.appVersion);
    //alert(isAndriod);
	//isAndriod = true;
    // var url = '/daiban/zblist.html?id='+id+'&tableid='+tableid;
	if(isAndriod){
        window.webview.openNewWin(url);   //调用外壳方法
        // window.location.href= url; //本地测试用
	}else if(isIphone){//非android端
		//sys_ryxz_iphone(sys_fsfw,sys_fsfw_mc,sys_bm);
		//url = '/daiban/zblist.html?id='+id+'&tableid='+tableid;
        execute("obj-c://openNewWin/"+url);
	}else{
		window.open(sys_ctx+sys_gcml+url);
	}
}


//渲染日期组件
function sys_renderDatePicker(type,elmId,_callback){
	var _div_datepicker = $("#div_sys_datePicker");
	if(_div_datepicker.length==0){
		var html = '<div style="position: fixed;top: 0px;bottom: 0px;width: 100%;background-color: white;z-index: 1010" id="con_datepicker">';
		html = html + '<div class="toolbar-blank"></div><div id="toolbar_datepicker"><span class="btn_bak" id="btn_bak_date"></span><h1 class="toolbar_title">时间选择</h1>';
		html = html + '<span class="btn_toolbar_font" id="btn_date_queren">确认</span></div>';
		html = html + '<div id="div_sys_datePicker" class="div_datepicker">'
		html = html + '<input type="text" name="sys_datePicker" id="sys_datePicker"  readonly="readonly"/></div>';
		html = html + '<div id="div_sys_timePicker" class="div_datepicker">';
		html = html + '<input type="text" name="sys_timePicker" id="sys_timePicker"  readonly="readonly"/></div>';
		html = html + '<div id="div_sys_dateTimePicker" class="div_datepicker">';
		html = html + '<input type="text" name="sys_dateTimePicker" id="sys_dateTimePicker"  readonly="readonly"/></div>';
		html = html + '</div>';
		$("body").append(html);
		$('#sys_datePicker').scroller({
            preset: 'date',//日期 date 时间 time  时间日期datetime
       		lang: 'zh',
			theme:'ios',
			display:'inline',
			sys_render:true
           });
		$('#sys_timePicker').scroller({
               preset: 'time',//日期 date 时间 time  时间日期datetime
       		lang: 'zh',
			theme:'ios',
			display:'inline',
			sys_render:true
           });
	    $('#sys_dateTimePicker').scroller({
               preset: 'datetime',//日期 date 时间 time  时间日期datetime
       		lang: 'zh',
			theme:'ios',
			display:'inline',
			sys_render:true
           });
           $('#toolbar_datepicker').toolbar().fix({
	       top: 0
	    });
	    $('#btn_bak_date').on('click',function(){
	    	$('#con_datepicker').hide();
	    });
	}
	$('#btn_date_queren').off('click');
	$('#btn_date_queren').on('click',function(){
		var val = "";
		switch(type){
			case 'date':
				val = $("#sys_datePicker").val();
			break;
			case 'datetime':
				val = $("#sys_dateTimePicker").val();
			break;
			case 'time':
				val = $("#sys_timePicker").val();
			break;
		}
		 $('#'+elmId).val(val);
         $('#con_datepicker').hide();
         if(_callback){
         	_callback.call(window);
         }
     });
       $("#sys_datePicker").val('');
	   $("#sys_dateTimePicker").val('');
	   $("#sys_timePicker").val('');
	
	   $("#div_sys_datePicker").hide();
	   $("#div_sys_timePicker").hide();
	   $("#div_sys_dateTimePicker").hide();
	   var tempVal = (!$('#'+elmId).val())?"":$('#'+elmId).val();
	   switch(type){
			case 'date':
				$("#sys_datePicker").val(tempVal);
			break;
			case 'datetime':
				$("#sys_dateTimePicker").val(tempVal);
			break;
			case 'time':
				$("#sys_timePicker").val(tempVal);
			break;
	   }		
	   $('#con_datepicker').show();
	   switch(type){
			case 'date':
				$("#div_sys_datePicker").show();
			break;
			case 'datetime':
				$("#div_sys_dateTimePicker").show();
			break;
			case 'time':
				$("#div_sys_timePicker").show();
			break;
	  }
}
/*textarea高度自适应*/
function sys_autoTextarea(_scroll){
	var textareas = document.getElementsByTagName("textarea");
	for(var i=0;i<textareas.length;i++){
		var display = getComputedStyle(textareas[i],null)['display'];
		if(textareas[i].scrollHeight!=0){
			textareas[i].style.height = textareas[i].scrollHeight+"px";//加载完以后重设高度
		}
		textareas[i].addEventListener("input",function(e){
			var height,padding = 0,style = this.style;
		    padding = parseInt(getComputedStyle(this,null)['paddingTop']) + parseInt(getComputedStyle(this,null)['paddingBottom']);
		    height = this.scrollHeight - padding;
		    style.height = height  + 'px';
		    this.currHeight = parseInt(style.height);
		},false);
		if(_scroll){
			textareas[i].addEventListener("blur",function(e){
				_scroll.refresh();
			},false);
		}
	}
	_scroll.refresh();
}


/*
营销平台内在业务模块查看流程，如果当前流程处理人为当前登录人跳转到待办页面，否则跳转到已办页面
*/
function sys_redirectDborYB(id,retURL){
	sys_ajaxGet('/api/default.do?method=redirectDborYB&id='+id,function(json){
		var baseURL = getBaseURL();
		var result = json.result;
		if(result=='yb'){//跳转已办页面
			sys_goURL(baseURL+'yiban/show.html?id='+id+"&retURL="+escape(retURL));
		}else{//跳转待办页面
			sys_goURL(baseURL+'daiban/do_document.html?id='+json.id+"&lx=db&retURL="+escape(retURL));
		}	
	});
}
//解析聊天数据
function sys_parseIMdate(json){
	if(json[0]!=null&&json[0]!=""){
		var event=json[0].e;
		if(event!=null&&event=='nm'){
			var date=json[0].d;
			var i=date.i;
			if(isChatPage&&sys_imYhid==i){
				outChatMsg(date);
				return 1;
			}else{
				var title=date.n;
				var text=date.c;
				var type=date.t;
				if(type!=1){
					text=date.cn+"："+text;
				}
				var url="/im/chat/chat.html?id="+i+"&mc="+escape(title)+"&chatlx="+type+"&retUrl=list.html";
				var date2={title:title,text:sys_msgProcess(text,2),url:url};
				var str = JSON.stringify(date2);
				if(isAndriod){
					window.webview.parseIMdate_notice(str);
				}else if(isIphone){
					window.location.href = "obj-c://localNotification"+encodeURI(str);
				}else{
					//alert("需要提醒！！");
					parent.clientNotice(str);
				}
				return 0;
			}
		}else if(event!=null&&event=='lg'){
			//alert("已离开群组");
		}
	}
}
//获取消息
function sys_getIMdate(str,param,yhid,callback){
	var params=JSON.stringify(param);
	if(isAndriod){
		window.webview.getChatMsg(str,params,yhid,callback);
	}else if(isIphone){
		window.location.href = "obj-c://socketSendMsg"+str+"!_!"+callback+"!_!"+yhid+"!_!"+encodeURI(params);
	}else{
		parent.webEmit(str,param,callback);
	}
}
//发送消息
function sys_sendIMdate(str,param){
	var params=JSON.stringify(param);
	if(isAndriod){
		window.webview.inChatMsg(str,params);
	}else if(isIphone){
		window.location.href = "obj-c://socketSendMsg"+str+"!_!!_!!_!"+encodeURI(params);
	}else{		
		parent.webEmit(str,param);
	}
}
//得到头像的路径
function getPicPath(yhid){
	if(yhid){
		yhid=yhid.replace("yh","");
		yhid=yhid.replace("bm","");
	}
	var src=getUrl()+oainfo+"/im/pic/"+yhid+".jpg?size=50*&t="+Math.random(); 
	return src;
}
//处理消息
function sys_msgProcess(msg,flag){
	if(flag==1){//flag是1的表示聊天页面处理附件
		msg = msg.replace(/<img src='{oainfo}/g,"<img src='"+getUrl());
		msg = msg.replace(/<a href='{sys_ctx}/g,"<a href='"+sys_ctx);
	}else if(flag==2){//处理消息和通知栏的附件显示
    	var regExp = /<a href='{sys_ctx}[^>]*>(.*?)<\/a>/ig; 
    	var regExp2 = /<img src='{oainfo}[^>]*\/>/ig;
    	if(msg.match(regExp)){
    		msg=msg.replace(msg.match(regExp),"[文件]"+RegExp.$1);
    		if(msg.match(regExp2)){
    			msg="[图片]";
    		}
    	}   
    	msg=msg.replace(/<img src='facepic\/(.*?).gif'(\s*?)\/>/ig,function(a,b){return face2text[b];});
	}
  	 return msg;
  }
//渲染当前页面所属模版下方按钮
function renderBottomButton(){
	var url = window.location.href;
	for(var k in sys_bottomMenuURL){
		var menuUrl=sys_bottomMenuURL[k].url;
		if(menuUrl.indexOf("?")>-1){
			var arr=menuUrl.split("?");
			menuUrl=arr[0];
		}
		if(url.indexOf('zcdt/zcdtList.html')>-1){
			var code = getQueryStringRegExp('code');
			if(code=='8102'){
				var item =  $("#div_gonggao");
				if(item.length>0){
					var clz = item.attr("class");
					item.removeClass();
					clz = clz+"_cur";
					item.addClass(clz);
					break;
				}
			}
		}else{
			if(url.indexOf(menuUrl)>-1){
				var item =  $("#"+k);
				if(item.length>0){
					var clz = item.attr("class");
					item.removeClass();
					clz = clz+"_cur";
					item.addClass(clz);
					break;
				}
			}
		}
	}
}
//绑定底部按钮点击方法
function bindBottomButton(){
	$("#div_bottomMenu div").on('click',function(){
		var id = this.id;
		if(id=='div_tuichu'){			
			sys_exit();			
		}else if(id=='div_firstAid'){
		   $("#"+id).removeClass();		   
		   $("#"+id).addClass(id+"_cur");
		   sys_alert('正在建设中');
		}else{
			var mc = sys_bottomMenuURL[id].mc;
			var url = sys_bottomMenuURL[id].url;
			url = getBaseURL()+url;
			sys_goURL(url);
		}
	});
}
//点击下方按钮获取根路径地址
function getBaseURL(){
	var baseURL = "";
	var head = document.getElementsByTagName("head")[0].innerHTML;
	var reg = /<script.*?src=\"(.*?js\/ict.js)\"/;
	var result = reg.exec(head);
	var filePath = "";
	if(result){
		filePath = result[1];
		var aFile = filePath.match(/\.\.\//ig);
		if(aFile){
			var url = window.location.href;
			url = url.split("?")[0];
			var aURL = url.split("\/");
			var chazhi = aURL.length-aFile.length;
			baseURL = aURL.slice(0,chazhi-1).join("/")+"/";
		}
	}
	return baseURL;
}

//pad端动态加载html、css、js等
function _buildFragment(html,view,view_count,pop_size){
	if(typeof html!='string'){
		html = html.myname;//客户端返回的是json
	}
    
	var __rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
	html = html.replace(__rxhtmlTag, "<$1></$2>");
	var doc = document.createElement("div");
	doc.innerHTML = html;
	var elem = doc.children;
	var scripts = new Array();
	var links = new Array();
	var imgs = doc.getElementsByTagName("img");
	_imgSrcReplace(imgs,view);
	
	var ahttpRes = new Array();//所有引入的http外部资源，例：百度地图
	var ahttpResLoad = new Array();//所有引入的外部http资源是否加载完成数组
	for(var i=0;i<elem.length;i++){
		if(elem[i].nodeName.toLowerCase()=='script'){
			if(elem[i].src){
				var reg = /src="(.*?)"/ig;
				var src = reg.exec(elem[i].outerHTML)[1];
				if(src.indexOf("http://")>-1){//所有http引入的资源单独加载
					ahttpRes.push(elem[i]);
					ahttpResLoad.push(false);
				}
			}
			scripts.push(elem[i]);
		}
		if(elem[i].nodeName.toLowerCase()=='link'||elem[i].nodeName.toLowerCase()=='style'){
			links.push(elem[i]);
		}
	}
	for(var i=0;i<scripts.length;i++){
		scripts[i].parentNode.removeChild(scripts[i]);
	}
	for(var i=0;i<links.length;i++){
		links[i].parentNode.removeChild(links[i]);
	}
	if(view=="right"){
		$("#sys_right").html(doc.innerHTML);
		if(view_count =="1"){
			$("#sys_list").hide();
		}
	}else if(view=="left"){
		$("#sys_list").html(doc.innerHTML);
		$("#sys_list").show();
	}else if(view=="pop"){
		if($("#sys_list").length>0 || $("#sys_right").length>0){
			$("#sys_list,#sys_right").addClass("float_div");
			$("#sys_list,#sys_right").children().attr("disabled","disabled"); 
		} 
		var divfloat_height="",divfloat_width="";
		if(pop_size.length>0){
			pop_size = pop_size.split(",");
			divfloat_height = pop_size[0];
			divfloat_width = pop_size[1];
		}else{
			divfloat_height = "300";
			divfloat_width="400";
		}
		var v_top = (window.innerHeight-divfloat_height)/2;
		var v_left= (window.innerWidth-divfloat_width-100)/2;
		$('body').append('<div class="ui-mask" style="display:block;width:100%;height:100%"></div>'
		+'<div id="sys_divfloat" style="border:1px solid #CCC;width:'+divfloat_width+'px;height:'+divfloat_height+'px;padding:5px;'
			+'position:absolute;background:#FFF;z-index:2000;top:'+v_top+'px;left:'+v_left+'px;"><div style="text-align:right;font-size:12px;" '
			+'onclick="removefloat();">关闭</div><div id="sys_divfloat_content"></div></div>');
		$("#sys_divfloat_content").html(doc.innerHTML);
	}
	
	if(!isIphone||window.location.href.indexOf("http://")>-1){
		for(var i=0;i<ahttpRes.length;i++){
			loadHttpRes(ahttpRes[i].src,i,ahttpResLoad);
		}
		var _interVal = setInterval(function(){
			var httpResLoaded = true;//所有http资源加载完成
			for(var z=0;z<ahttpResLoad.length;z++){
				httpResLoaded = httpResLoaded&&ahttpResLoad[z];
			}
			if(httpResLoaded){
				clearInterval(_interVal);
				_evalScript(scripts,view);
				_evalCSS(links,view);
				sys_pageLoaded = true;//上一个页面加载完成，pad和电脑端统一加此参数
			}
		},100);
	}else{
        //alert(111+'==='+sys_pageLoaded);
		for(var i=0;i<ahttpRes.length;i++){
			loadHttpRes(ahttpRes[i].src,i,ahttpResLoad);
		}
		var _interVal = setInterval(function(){
			var httpResLoaded = true;//所有http资源加载完成
			for(var z=0;z<ahttpResLoad.length;z++){
				httpResLoaded = httpResLoaded&&ahttpResLoad[z];
			}
			if(httpResLoaded){
				clearInterval(_interVal);
                //alert('jiazai ye mian qi ta ziyuan');
				padLoadRes(view,scripts,links);
                                    
			}
		},100);
	}
	//用于设置右侧toolbar宽度，不然全屏显示
	/*
	if(view=="right"){
		$("#sys_list").find('.ui-toolbar').width('300px');
		$("#sys_right").find('.ui-toolbar').width((window.innerWidth-400)+'px');
	}else if(view=="left" && view_count !="1"){
		$("#sys_list").find('.ui-toolbar').width('300px');
		$("#sys_right").find('.ui-toolbar').width((window.innerWidth-400)+'px');
	}
	*/
	
}
function loadHttpRes(url,i,ahttpResLoad){
	var hscript = document.createElement("script");     
	hscript.src = url;     
	hscript.type = "text/javascript";     
	hscript.onload=function(){
		ahttpResLoad[i] = true;
        //alert('baidu di tu finished');
	};
	document.getElementsByTagName("head").item(0).appendChild(hscript); 
}

//pad端加载资源
function padLoadRes(view,scripts,links){
		var _basePath = sys_BasePath[view];
		var phoneURL = 'appendScript_'
		var scriptText = "";
		var cssText = "";
		for(var i=0;i<scripts.length;i++){
			var elem = scripts[i];
			if(elem.src){
				var src = getFilePath(_basePath,elem,1);
				if(sys_BaseJs.indexOf(src)>-1){
					continue;
				}
				phoneURL = phoneURL + src+",";
			}else{
				var text = elem.text || elem.textContent || elem.innerHTML;
				scriptText = scriptText + "\n" + text;
			}
		}
		phoneURL = phoneURL+"_appendCSS_";
		for(var i=0;i<links.length;i++){
			var elem = links[i];
			if (elem.href) {
				var href = getFilePath(_basePath,elem,2);
				if(sys_BaseCss.indexOf(href)>-1){
					continue;
				}
				phoneURL = phoneURL + href +",";
			}else{
				var text = elem.text || elem.textContent || elem.innerHTML;
				cssText = cssText +"\n"+text;
			}
		}
    
		khdAppendResInterval(scriptText,cssText);
		window.location.href="sys_requesttext"+phoneURL;
}
function khdAppendResInterval(scriptText,cssText){
     //alert(2222+'==='+sys_pageLoaded);
    var _interval = window.setInterval(function(){
           if(sys_urlResLoaded){//页面URL资源加载完毕
                  appendCSS(cssText);
                  appendScript(scriptText);
                  sys_pageLoaded = true;//整个页面加载完毕
//                                        alert(33333+'==='+scriptText);
                  window.clearInterval(_interval);
           }
        },100);
}

function removefloat(){
	$("#sys_list,#sys_right").removeClass("float_div");
	$("#sys_list,#sys_right").children().removeAttr("disabled"); 
	$("#sys_divfloat").remove();
	$(".ui-mask").remove();
}

//var sys_khdLoad = false;//客户端资源加载中
var sys_urlResLoaded = false;//页面引入的资源加载完毕
var sys_pageLoaded = false;//页面加载完毕，包括写在页面内的css和Js资源
//执行javascript脚本
function _evalScript(scripts,view){
	var _basePath = sys_BasePath[view];
	for(var i=0;i<scripts.length;i++){
		var elem = scripts[i];
		if(elem.src){
			var src = getFilePath(_basePath,elem,1);
			
			
			if(sys_BaseJs.indexOf(src)>-1){
				continue;
			}
			_textRequest(src,1);
			continue;
		}else{
			var text = elem.text || elem.textContent || elem.innerHTML;
			appendScript(text);
		}
	}
}
//加载css文件
function _evalCSS(links,view){
	var _basePath = sys_BasePath[view];
	for(var i=0;i<links.length;i++){
		var elem = links[i];
		if (elem.href) {
			var href = getFilePath(_basePath,elem,2);
			if(sys_BaseCss.indexOf(href)>-1){
				continue;
			}
			_textRequest(href);
			continue;
		}else{
			var text = elem.text || elem.textContent || elem.innerHTML;
			appendCSS(text);
		}
	}
}
//执行图片替换
function _imgSrcReplace(imgs,view){
	var _basePath = sys_BasePath[view];
	for(var i=0;i<imgs.length;i++){
		var elem = imgs[i];
		if(elem.src){
			 getFilePath(_basePath,elem,1,'pic');
		}
	}
}
//计算文件路径  电脑端调试获取src会自动加上工程等全路径，壳上直接取
//basePath 当前页面路径
//elem 	   dom element
//flag     js或css文件，获取src或href，   1:请求js文件   2请求css文件
//type     flag都是1的时候type pic标识图片
function getFilePath(basePath,elem,flag,type){
	if(flag==1){
		var reg = /src="(.*?)"/ig;
		var src = reg.exec(elem.outerHTML)[1];
		if(src.indexOf("http://")>-1&&type!='pic'){
			return 'gmu/js/gmu.js';//如果是引用的外部http资源，前期已经预先加载，无需在次加载，直接返回basejs内资源
		}
		if(src.indexOf("http://")>-1&&type=='pic'){
			return src;
		}
		reg =/\{.*?\}/ig;
		if(reg.test(src)){
			return src;
		}
		var baseClass = basePath.match(/\//ig);
		var fileClass = src.match(/\.\.\//ig);
		if(!baseClass){
			baseClass = new Array();
		}
		if(!fileClass){
			fileClass = new Array();
		}
		src = src.replace(/\.\.\//ig,"");
		//alert(baseClass.length+"==="+fileClass.length+"==="+basePath+"==="+src);
		if(baseClass.length>fileClass.length){
			var chazhi = baseClass.length-fileClass.length;
			var aBaseURL = basePath.split('\/');
			src = aBaseURL.slice(0,chazhi).join("/")+"/"+src;
		}else if(baseClass.length<fileClass.length){
			alert("==-href-==");	
		}
		elem.src = src;
		return src;
	}else if(flag==2){
		var reg = /href="(.*?)"/ig;
		var href = reg.exec(elem.outerHTML)[1];
		var baseClass = basePath.match(/\//ig);
		var fileClass = href.match(/\.\.\//ig);
		if(!baseClass){
			baseClass = new Array();
		}
		if(!fileClass){
			fileClass = new Array();
		}
		href = href.replace(/\.\.\//ig,"");
		if(baseClass.length>fileClass.length){
			var chazhi = baseClass.length-fileClass.length;
			var aBaseURL = basePath.split('\/');
			href = aBaseURL.slice(0,chazhi).join("/")+"/"+href;
		}else if(baseClass.length<fileClass.length){
			alert("==-css-==");	
		}
		elem.href = href;
		return href;
	}
}

//客户端附件js  css等资源函数
function khdAppendRes(resObj){
	appendCSS(resObj.mycss);
	appendScript(resObj.myjs);
	sys_urlResLoaded = true;
}
//请求js文本回调函数
function appendScript(text){
		if(typeof text!='string'){
			text = text.myjs;
		}
		var head = document.getElementsByTagName("head")[0] || document.documentElement,
		script = document.createElement("script");
		script.type = "text/javascript";
		script.text = text ;
		head.insertBefore(script,head.firstChild);
		head.removeChild(script);
}
//请求css文本回调函数
function appendCSS(text){
	if(typeof text!='string'){
		text = text.mycss;
	}
	var head = document.getElementsByTagName("head")[0] || document.documentElement,
	link = document.createElement("style");
	link.type="text/css";
	link.innerHTML = text ;
	head.insertBefore(link,head.firstChild);
	//head.removeChild(link);

}
//请求js css文件，壳上用壳发起请求、电脑端直接请求
//type 1:请求js文件    其他请求css文件
function _textRequest(url,type){
	if(isAndriod){
		
	}else if(isIphone){
		var callback = type=="1"?"appendScript":"appendCSS";
		window.location.href="sys_requesttext"+callback+"_"+url;
	}else{
		$.ajax({
			url:url,
			async: false,
			dataType: type=="1"?"script":"text",
			success:function(data,status, xhr){
				if(type!='1'){				
						appendCSS(data);
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.status+'--'+XMLHttpRequest.readyState+'--'+textStatus);
            }
		});
	}
}
//记录左右加载的路径，用于计算连接的路径
var sys_BasePath = {};
//_view current left right window pop 
// current：整个刷新当前页面   left：在左侧栏打开  right在右侧栏打开  window：弹出新窗口  pop：浮出层
//_view_count 区域个数，目前最多支持2个，默认为2个
//_pop_size 浮出层尺寸，数据格式：高度,宽度
function sys_goURL1(url,options){
                            sys_urlResLoaded = false;//页面引入的资源加载完毕
                            sys_pageLoaded = false;//页面加载完毕，包括写在页面内的css和Js资源
                            if(isPad){
                            var _view = "right";
                            if(options){
                            _view = options._view;
                            }
                            var _view_count = "2";
                            if(options && options._view_count){
                            _view_count = options._view_count;
                            }
                            if(_view_count == "1"){//若只有一个区域，默认在右侧显示
                            _view=="right";
                            }
                            var _pop_size = "";
                            if(options && options._pop_size){
                            _pop_size = options._pop_size;
                            }
                            //往右侧加载html
                            if(_view=="right" || _view=="left" || _view=="window" || _view=="pop"){
                            sys_URLParams = url;
                            if(url.indexOf("?")>-1){
                            url = url.substring(0,url.indexOf("?"));
                            }
                            if(_view=="window"){
                            _view=="right" ;
                            }
                            //全局路径配置
                            url = getOrigView(url);
                            sys_BasePath[_view]=url;
                            
                            if(isAndriod){
                            
                            }else if(isIphone){//打包时需要放开
                            window.location.href="sys_requesthtml_"+_view+"_"+_view_count+"_"+_pop_size+"_"+url;
                            }else{
                            $.ajax({
                                   url:url+"?time="+new Date().getTime(),
                                   async: false,
                                   dataType: "html",
                                   success:function(data){
                                   var _html = "";
                                   var reg = /<script[\s\S]+?(<\/script>|\/>)/ig;
                                   var _scripts = data.match(reg);
                                   _html = _html + _scripts.join("");
                                   
                                   reg = /<link.*?\/>/ig;
                                   var _link = data.match(reg);
                                   _html = _html + _link.join("");
                                   
                                   reg = /<style[\s\S]*<\/style>/ig;
                                   var _styles = data.match(reg);
                                   if(_styles){
                                   _html = _html + _styles.join("");
                                   }
                                   
                                   reg = /<body.*?>([\s\S]*)<\/body>/ig; 
                                   if(reg.exec(data)){
                                   _html = _html + RegExp.$1;
                                   }
                                   _buildFragment(_html,_view,_view_count,_pop_size);
                                   }
                                   });
                            }
                            }else if(_view=="current"){//刷新整个页面
                            window.location.href=url;
                            }else{
                            window.location.href=url;
                            }
                            }else{
                            window_location_href1(url);
                            //window.location.href=url;
                            }
}
function sys_goURL(url,options){
	sys_urlResLoaded = false;//页面引入的资源加载完毕
    sys_pageLoaded = false;//页面加载完毕，包括写在页面内的css和Js资源
	if(isPad){
		var _view = "right";
		if(options){
			_view = options._view;
		}
		var _view_count = "2";
		if(options && options._view_count){
			_view_count = options._view_count;
		}
		if(_view_count == "1"){//若只有一个区域，默认在右侧显示
			_view=="right";
		}
		var _pop_size = "";
		if(options && options._pop_size){
			_pop_size = options._pop_size;
		}
		//往右侧加载html
		if(_view=="right" || _view=="left" || _view=="window" || _view=="pop"){
			sys_URLParams = url;
			if(url.indexOf("?")>-1){
				url = url.substring(0,url.indexOf("?"));
			}
			if(_view=="window"){
				_view=="right" ;
			}
			//全局路径配置
			url = getOrigView(url);
			sys_BasePath[_view]=url;
			
			if(isAndriod){
				
			}else if(isIphone){//打包时需要放开
				window.location.href="sys_requesthtml_"+_view+"_"+_view_count+"_"+_pop_size+"_"+url;
			}else{
				$.ajax({
					url:url+"?time="+new Date().getTime(),
					async: false,
					dataType: "html",
					success:function(data){
						var _html = "";
						var reg = /<script[\s\S]+?(<\/script>|\/>)/ig;
						var _scripts = data.match(reg);
						_html = _html + _scripts.join("");
						
						reg = /<link.*?\/>/ig;
						var _link = data.match(reg);
						_html = _html + _link.join("");
						
						reg = /<style[\s\S]*<\/style>/ig;
						var _styles = data.match(reg);
						if(_styles){
						_html = _html + _styles.join("");
						}
						
						reg = /<body.*?>([\s\S]*)<\/body>/ig; 
						if(reg.exec(data)){
							_html = _html + RegExp.$1;
						}
						_buildFragment(_html,_view,_view_count,_pop_size);
					}
				});
			}
		}else if(_view=="current"){//刷新整个页面
			window.location.href=url;
		}else{
			window.location.href=url;
		}
	}else{
		 
		 
		 
		 
		 window_location_href(url);
	}
}
function changeip(fn){
	ipIphone = fn ;
	alert("---"+ipIphone);
}
//获取从那个view内点击
function getOrigView(url){
	if(!event){
        return url;
    }
	var target = event.target;
	var origView = "";
	if(target){
		target = $(target);
		if($("#sys_list").has(target).length>0){
			origView = "left";
		}else if($("#sys_right").has(target).length>0){
			origView = "right";
		}
	}
	var basePath = "";
	if(origView){
		baseURL = sys_BasePath[origView];
		var baseClass = baseURL.match(/\//ig);
		var urlClass = url.match(/\.\.\//ig);
		url = url.replace(/\.\.\//ig,"");
		if(!baseClass){
			baseClass = new Array();
		}
		if(!urlClass){
			urlClass = new Array();
		}
		if(baseClass.length>urlClass.length){
			var chazhi = baseClass.length-urlClass.length;
			var aBaseURL = baseURL.split('\/');
			url = aBaseURL.slice(0,chazhi).join("/")+"/"+url;
		}
	}
	return url;
}
                          function window_location_href1(url){
                          //if(isAndriod){
                          if(url.indexOf("?")>-1){
                          var url2=url.split("?");
                          url=url2[0];
                          var para=url2[1];
                          //window.webview.Window_location(para);
                          window.localStorage.setItem("urlParam",para);//放到浏览器的本地存储中
                          }
                          else{
                          window.localStorage.setItem("urlParam","");//放到浏览器的本地存储中
                          }
                          //}
                          window.location.href=url;
                          }

function window_location_href(url){
	//if(isAndriod){
	if(url.indexOf("?")>-1){
		var url2=url.split("?");
		url=url2[0];
		var para=url2[1];
		//window.webview.Window_location(para);
		window.localStorage.setItem("urlParam",para);//放到浏览器的本地存储中
	}
	else{
		window.localStorage.setItem("urlParam","");//放到浏览器的本地存储中
	}
//}
	window.location.href=url;
}

/*
tableid:绑定列表tableId，外层css为ui-refresh的div id为div_tableId
url:请求路径
params：json格式参数 {xxx:xxxxx,callback:funtion(回调函数)}
*/  
 
function sys_renderList(tableid,url,params,_refresh,h,removeStyle){
	if(isPC){
		sys_loadDataList(tableid,url,params,_refresh,h);
		return;
	}
	var refreshDown = $("#div_"+tableid).find(".ui-refresh-down");
	if(refreshDown.length>0){
		refreshDown.hide();
	}
	if(!tableid){
		alert("请设置tableid");
		return false;
	}
	if(!url){
		alert("请设置url");
		return false;
	}
	var refreshDIV = "div_"+tableid;
	var height = 0;
	if(h){
		height = h+getListHeight();
	}else{
		height = getListHeight();
	}
    $('#'+refreshDIV).css('height',window.innerHeight-parseInt(height)).refresh({
		  load:function(dir,type){
               var me = this;
               var page_goto = sys_getPageNum(tableid,dir);
               if(!page_goto){
               		me.afterDataLoading(dir);  
               		me.disable('down',false);
               		return ;
               }
               var URLParams = {
               		url:url+page_goto,
               		dir:dir
               }
               var callback = "";
               if(params){
               		callback = params.sys_callback;
               		delete params.sys_callback;
               }
               sys_ajaxGet(URLParams,params?params:"",function(json){
               		bind(json,{dir:dir,removeStyle:removeStyle});
					_refresh[tableid] = me._options.iScroll;
               	 	if(!sys_hideLoadMore[tableid]){	
	               	 	if(refreshDown.length>0){
							refreshDown.show();
						}
					}
					if(callback&&typeof callback=="function"){
						callback.call(this,json);						
					}
			        me.afterDataLoading(dir);  
               });
           },
           ready:function(){
           		this.trigger("load");
           },
           statechange:function(event,elem,state,dir){
          }
      });
      
}
var loading = false;
var myScroll;
function sys_loadDataList(tableid,url,params,_refresh,h){
    var refreshDown = $("#div_"+tableid).find(".ui-refresh-down");
	if(refreshDown.length>0){
		refreshDown.hide();
		refreshDown.html('<span class="ui-refresh-icon ui-loading"></span><span id="span-ui-refresh-label" class="ui-refresh-label">加载中...</span>');
	}
	var refreshDIV = "div_"+tableid;
	var dir = "down";
	var height = 0;
	if(h){
		height = h+getListHeight();
	}else{
		height = getListHeight();
	}

	$('#'+refreshDIV).wrap("<div id='wrapper'></div>");
	$("#wrapper").css({'position':'absolute','z-index': 1,'overflow': 'hidden','width': '100%','height':window.innerHeight-parseInt(height)});
	 myScroll = new IScroll('#wrapper', {
		probeType: 3,
		scrollbars: true,
		mouseWheel: true,
		interactiveScrollbars: true,
		shrinkScrollbars: 'scale',
		fadeScrollbars: false,
		disableMouse:true
	});
	myScroll.on("scroll",function(){
      if(!loading){
	      	if (this.y == 0) {
	      		
				}else if (this.y == this.maxScrollY) {
					loading = true;
					setTimeout(function(){
						pullUpAction(url,tableid,params,"down",refreshDown,_refresh);
					},500);
				}
      	
      }
	});
	pullUpAction(url,tableid,params,"down",refreshDown,_refresh);
}
//上拉事件
function pullUpAction(url,tableid,params,dir,refreshDown,_refresh) {
    var page_goto = sys_getPageNum(tableid,dir);
    if(!page_goto){//已到最后一页
     $("#span-ui-refresh-label").text("没有更多内容了");
     $("#span-ui-refresh-label").prev().removeClass("ui-loading");
     return;
    }
    var URLParams = {
             		url:url+page_goto,
             		dir:dir
             }
    sys_ajaxGet(URLParams,params?params:"",function(json){
		 bind(json,{dir:dir,removeStyle:false});
		 _refresh[tableid] = myScroll;
    	 if(!sys_hideLoadMore[tableid]){	
           	 	if(refreshDown.length>0){
					refreshDown.show();
				}
		  }
       setTimeout(function () {
        myScroll.refresh();
        loading = false;
    }, 0);
	  });
	

}   	
  
  	

function sys_exit(){
	if(isAndriod){
		window.webview.exit();
	}else if(isIphone){	
		window.location.href='obj-c://exitIOS';
	}
	else{		
		window.open('', '_self', '');
		window.close();
	}
}

//定位
function sys_getPosition(){
	if(isIphone){//ios 定位				
		window.location.href = "yxpt:baiDuLocation";
	}
	else if(isAndriod){ //android定位
		window.webview.setlocation();
	}
}
//拍照
function sys_getPhoto(){
	if(isIphone){//ios 拍照
		window.location.href = "yxpt:imagePicker";
	}else if(isAndriod) {//android 拍照
		window.webview.setpic();
	}
}
function sys_getPhotoAttach(zid,mk_mc,wjlj,wjmc,attach,ioscallback,androidpicsize){
      if(isAndriod)
          window.webview.camera(zid,mk_mc,wjmc,attach,androidPicSize);
      else if(isIphone)
      {
          window.location.href=encodeURI('obj-c://imTypeCamera"zip":"'+zid+'","mk_mc":"'+mk_mc+'","filename":"'+wjmc+'","wjlj":"'+wjlj+'","attachment":"'+attach+'","callback":"'+ioscallback+'"');
      }
	}

//开始录音
function sys_startRecord(){
	if(isIphone){
		window.location.href = 'obj-c://startsound';	
	}
	else if(isAndriod){
		window.webview.onRecord(true);
	}
}
//停止录音
function sys_stopRecord(filename){
	if(isIphone){
		window.location.href = 'obj-c://stopsound'+filename;
	}
	else if(isAndriod){
		window.webview.onRecord(false);
 	}
}

//播放网络录音
function sys_playRecord(filepath){
	if(filepath){
		if(isIphone){
			window.location.href = 'obj-c://playFileSound'+filepath;
		}
		else if(isAndriod){
			window.webview.onPlayServer(filepath);
	 	}
	}	
	
}
//播放本地录音
function sys_playLocalRecord(filepath){
	if(filepath){
		if(isIphone){
			window.location.href = 'obj-c://playsound'+filepath;
		}
		else if(isAndriod){
			window.webview.onPlay(true,filepath);
	 	}
	}	
	
}
//暂停播放
function sys_pauseRecord(filepath){
	if(filepath){
		if(isIphone){
			window.location.href = 'obj-c://pausesound'+filepath;
		}
		else if(isAndriod){
			window.webview.onPlay(false,filepath);
	 	}
	}	
	
}
//上传录音
function sys_uploadRecord(filepath){
	if(filepath){
		if(isIphone){
			window.location.href = 'obj-c://uploadsound'+filepath;
		}
		else if(isAndriod){
			window.webview.uploadSoundFile(filepath);
	 	}
	}	
	
}
//删除录音
function sys_deleteRecord(filepath){
	if(filepath){
		if(isIphone){
			window.location.href = 'obj-c://deletesound'+filepath;
		}
		else if(isAndriod){
				
	 	}
	}
}
//查询未读通知数量
	function msgNOreadnum(){
		sys_ajaxGet("/tzsf/wap.do?method=unReadNum",{yhid:window.localStorage.getItem("yhid")}, function(data){
			window.localStorage.setItem("noreadnum",data.tznum);
			if(data.tznum&&data.tznum!=0){
				addNoreadNum();
			}
        });
	}
function addNoreadNum(){
	//var dlmc=window.localStorage.getItem("dlmc");/
	var noreadnum=window.localStorage.getItem("noreadnum");
	if(noreadnum>=0){
		if(noreadnum==0){
			if($("#span_noreadnum").length>0){
				$("#span_noreadnum").hide();
			}
		}else{
			if($("#span_noreadnum").length>0){
				$("#span_noreadnum").show();
			}else{
				
				$("#div_notice").append("<span id='span_noreadnum' style='left:"+($("#div_notice").width()/2+5)+"px'>"+noreadnum+"</span>");
			}
		}
	}else{
		if($("#span_noreadnum").length>0){
			$("#span_noreadnum").hide();
		}
	}
}

function sys_alert_xgmm(msg,callback){
	var div = $("#sys_alert1");
	if(div.length==0){
		$("body").append('<div id="sys_alert1"><p></p></div>');
	}
	var alert_dialog = $('#sys_alert1').dialog({
        autoOpen: false,
        closeBtn: false,
        title:'信息提示',
        buttons: {
	            '确定': function(){
	                this.destroy();
	                if(callback){
	                	callback.call(this);
	                }
	            }
	        }
	 });
	
	$("#sys_alert1").find("p").eq(0).html(msg);
	$('#sys_alert1').dialog('open'); 
	 
}
function sys_showDetail(url) {
	if (isAndriod) {
		window.webview.viewDetail(url)
	} else if (isIphone) {
		window.location.href = "obj-c://goDetail//" + url;
	} else {
		var iTop = (window.screen.availHeight - 30 - 365) / 2;
		var iLeft = (window.screen.availWidth - 10 - 700) / 2;
		window.open(sys_ctx + sys_gcml + url, '', 'height=600,innerHeight=600,width=320,innerWidth=320,top=' + iTop + ',left=' + iLeft + ',top=0,left=0,toolbar=no,menubar=no,location=no,scrollbars=no,resizable=no');
	}
}
function sys_closeDetail() {
	if (isAndriod) {
		window.webview.closeDetail();
	} else if (isIphone) {
		window.location.href = "obj-c://goBack//";
	} else {
		window.close();
	}	
}


