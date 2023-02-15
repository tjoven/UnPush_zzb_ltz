//添加及时通通讯未读消息总数量
	function recordCount(yhid){
		$("div#recordCount").remove();
		var num=0;
		sys_ajaxGet('/jstx/default.do?method=recordCount&yhid='+yhid,function(json){
			
		    if(json.result==null || json.result==undefined ||json.result=="")
		    {
		    	num=0;
		    }
			num = json.result;
			if(num>0 && num<10)
			{
				$("#div_txl").html("<div id='recordCount' style='width:16px' class='recordcount' >"+num+"</div>即通讯");
				
			}else if(num>9 && num<100)
			{
				$("#div_txl").html("<div id='recordCount' class='recordcount' >"+num+"</div>即通讯");
				
			}else if(num>99)
			{
				$("#div_txl").html("<div id='recordCount' class='recordcount' >99+</div>即通讯");
				
			}else{
				$("div#recordCount").remove();
			}
			
		});
	}
	