var imgnum=1;
var imgcount=1;
var imgpath="";
var localpath="";
var height= window.innerHeight;
var width= window.innerWidth;

sys_obj={
    guid:function(){
        return getQueryStringRegExp("guid");
    },
    wjlj:function(){
        return getQueryStringRegExp("wjlj");
    },
    baseurl:function(){
        return getQueryStringRegExp("baseurl");
    },
    returnurl:function(){
        return getQueryStringRegExp("returnurl");
    },
    param:function(){
        return getQueryStringRegExp("param");
    },
    create:function(){
        Ext.create('Ext.Panel', {//创建表单面板
					id:"form_show",
					fullscreen: true,
					cls:'c_main_background',
					html:'',
					items:[
						{   
				 			xtype: 'toolbar',
	                		docked: 'top',
	                		title:'查看图片',
			                items: [
			                    {
			                        xtype: 'button',
			                        ui:'back',
	                        		text:'返回',
	                        		handler:function(){
	                        			 var url=sys_obj.returnurl();
	                        			 var para=sys_obj.param();
	                        			 var reg=new RegExp("::","g");
	                        			 var rep=url.replace(reg,"/");
	                        			  if(para!="")
	                        			  {
		                        			  reg=new RegExp("=","g");
		                        			  para=para.replace(reg,":'");
		                        			  reg=new RegExp("&","g");
		                        			  para=para.replace(reg,"',");
	                        			      para="{"+para+"'}";
	                        			      var pobj=eval("("+para+")"); 
	                        			      sys_goURL(rep,pobj);
	                        			  }else{
	                        			      sys_goURL(rep);
	                        			  }

	                        		}
			                    },
			                    {
				                    xtype: 'spacer'
				                }
			                    
			                    
			                ]
				 		},
				 		{
				 			xtype: 'toolbar',
	                		docked: 'bottom',
	                		items: [
			                    {
			                        xtype: 'button',
			                        text:'上一张',
	                        		handler:function(){
	                        		    
	                        			imgnum=imgnum-1;
	                        			if(imgnum<=1){imgnum=1;}
	                        			   setimg();
	                        		}
			                    },
			                    {
				                    xtype: 'spacer'
				                },
			                    {
									  xtype: 'button',
									  text: '下一张', 
									  handler:function(){
	                        			imgnum=imgnum+1;
	                        			if(imgnum>imgcount){
	                        			  imgnum=imgcount;
	                        			}
	                        			setimg();
	                        			
	                        		}
								}
			                    
			                    
			                ]
				 		}
				 		
				 		
				 		
					]
				});
				sys_ajax('/attachment/default.do?method=showAsImage&guid='+sys_obj.guid()+'&wjlj='+sys_obj.wjlj()+'&baseurl='+sys_obj.baseurl(),function(json){
					imgpath=json.imgpath;
					imgcount=json.imgcount;
					var sys_temp=sys_ctx.substring(sys_ctx.indexOf('//')+2,sys_ctx.length);
				    if(sys_temp.indexOf('/')>-1){
				       sys_temp=sys_temp.substring(0,sys_temp.indexOf('/'));
				    }	       
				    var sys_ctx_1=sys_ctx.substring(0,sys_ctx.indexOf('//')+2)+sys_temp;
				    
					var tmppath="";
					/*
					localpath=window.location.href;
					tmppath=localpath.substring(0,localpath.indexOf(":"));
					localpath=localpath.substring(localpath.indexOf("//")+2);
					tmppath=tmppath+"://"+localpath.substring(0,localpath.indexOf("/"));
					*/
					tmppath= sys_ctx_1;
					tmppath=tmppath+imgpath;
					imgpath=tmppath;
					height=(height-height*0.2);
					width=(width-width*0.2);
					var newhtml='<img src=\"'+tmppath+'\" style="height:'+height+'px;width:'+width+'px">';
					Ext.getCmp("form_show").setHtml(newhtml);
				});
				return Ext.getCmp("form_show");
    },
    
}
function setimg(){
    var newhtml='<img src=\"'+imgpath+'\" style="height:'+height+'px;width:'+width+'px">';
  	if(imgnum>1){
	   var fileext=imgpath.substring(imgpath.indexOf("."));
	   var newpath=imgpath.substring(0,imgpath.indexOf(fileext));
	   newpath=newpath+"("+imgnum+")"+fileext;
	   newhtml='<img src=\"'+newpath+'\" style="height:'+height+'px;width:'+width+'px">';
       		    
     }
     Ext.getCmp("form_show").setHtml(newhtml);
      
}