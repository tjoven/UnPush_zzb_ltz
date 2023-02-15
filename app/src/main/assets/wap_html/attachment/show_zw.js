sys_obj={
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
       Ext.create('Ext.form.Panel', {//创建表单面板
					id:"form_show",
					fullscreen: true,
					items:[
						{
				 			xtype: 'toolbar',
	                		docked: 'top',
	                		title:'文字版',
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
				 		},{
				    		xtype: 'fieldset',
				 			items: [
			                   {
		           		 		    xtype: 'textareafield',
		           		 		 	name:'nr',
		           		 		 	id:'nr',
		           		 		 	labelCls:'labelCls',
		           		 		 	readOnly:'true',
		           		 		 	maxRows:15//内容框显示行数
		           		 		  	
				           		}
				 			]
				 		}
					]
				});
				sys_ajax('/attachment/default.do?method=showAsWz&wjlj='+sys_obj.wjlj()+'&baseurl='+sys_obj.baseurl(),function(json){
					var newhtml=json.nr;
				    Ext.getCmp("nr").setValue(newhtml);
				});
				return Ext.getCmp("form_show");
    }
}