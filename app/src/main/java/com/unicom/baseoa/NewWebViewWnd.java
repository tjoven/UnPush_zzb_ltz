package com.unicom.baseoa;

import java.io.File;
import java.util.HashSet;
import java.util.Set;

import unigo.utility.ImeiHelper;
import unigo.utility.cache.Cache;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.Window;
//import android.webkit.CacheManager;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings.LayoutAlgorithm;
import android.webkit.WebSettings.ZoomDensity;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.RequestParams;
import com.sdunisi.oa.App;
import com.sdunisi.oa.service.ImCoreService;
import com.sdunisi.oa.service.NoticeHelper;
import com.unicom.baseoa.util.Utility;
import com.unicom.sywq.R;
import com.wotool.http.DeviceHelper;
import com.wotool.http.HttpRequestGridView;

public class NewWebViewWnd extends Activity {
	
	private WebView webView = null;
    ProgressDialog pd=null;

	
	private SharedPreferences settings;
	private String urlpara;

    private String curUrl;//当前页面的url地址
	ProgressDialog dialog = null;  

	
	private Handler handler=new Handler(){
    	public void handleMessage(Message msg)
	    {//定义一个Handler，用于处理下载线程与UI间通讯
	      if (!Thread.currentThread().isInterrupted())
	      {
	        switch (msg.what)
	        {
	        case 0:
	        	pd.show();//显示进度对话框 
	        	break;
	        case 1:
	        	pd.hide();//隐藏进度对话框，不可使用dismiss()、cancel(),否则再次调用show()时，显示的对话框小圆圈不会动。
	        	break;
	        }
	      }
	      super.handleMessage(msg);
	    }
    };
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		//无title  
		requestWindowFeature(Window.FEATURE_NO_TITLE);  
		//全屏  
		//getWindow().setFlags(WindowManager.LayoutParams. FLAG_FULLSCREEN ,    
		        //      WindowManager.LayoutParams. FLAG_FULLSCREEN);   
		//getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);
		setContentView(R.layout.webviewwnd2);
		init();	
		Intent intent=new Intent();
		intent.setClass(NewWebViewWnd.this, WebViewWnd.class);
		startActivity(intent);
/*		String newurl = this.getIntent().getStringExtra("newUrl");//在新的webview实例中打开一个链接
		if(newurl!=null){
			 loadurl(webView, newurl);
			 return;
		}*/

	}

	@Override
	protected void onResume() {
		super.onResume();
/*		String newurl = this.getIntent().getStringExtra("newUrl");//在新的webview实例中打开一个链接
		if(newurl!=null){
			 loadurl(webView, newurl);
			// return;
		}*/
	}
/*	protected void onNewIntent(Intent intent) {
		  super.onNewIntent(intent);
		  setIntent(intent);//must store the new intent unless getIntent() will return the old one
		 // processExtraData()
   }*/
	@SuppressLint({ "NewApi", "NewApi" })
	private void init(){
		
    	//进度条
    //	pd=new ProgressDialog(this);
      //  pd.setProgressStyle(ProgressDialog.STYLE_SPINNER);
      //  pd.setMessage("数据载入中，请稍候...");
		
    	this.webView = (WebView) this.findViewById(R.id.webview);
    	
    	/*this.webView.setScrollbarFadingEnabled(false);
    	this.webView.setScrollBarStyle(WebView.SCROLLBARS_OUTSIDE_OVERLAY);//滚动条风格
    	//Horizontal水平方向，Vertical竖直方向
    	webView.setHorizontalScrollBarEnabled(false);*/
     	//webView.setVerticalScrollBarEnabled(true);   
    	
    	//this.webView.getSettings().setAllowFileAccess(true);//设置允许访问文件数据
    	//支持多点触屏
    	this.webView.getSettings().setBuiltInZoomControls(true); //支持多点触摸
    	this.webView.getSettings().setBuiltInZoomControls(true);//支持缩放功能
    	//this.webView.getSettings().setLightTouchEnabled(true);
    	this.webView.getSettings().setUseWideViewPort(true); //让浏览器支持用户自定义view
    	this.webView.getSettings().setLoadWithOverviewMode(true);//概览模式打开网页
		//this.webView.setWebChromeClient(new WebChromeClient());
		this.webView.getSettings().setJavaScriptEnabled(true);// 得到WebSetting对象，设置支持Javascript的参数
		this.webView.requestFocus();//触摸焦点起作用

		//不使用缓存：
		this.webView.getSettings().setCacheMode(this.webView.getSettings().LOAD_NO_CACHE); 
		//将一个当前的java对象绑定到一个javascript上面
		this.webView.addJavascriptInterface(this, "hosturl");
		this.webView.addJavascriptInterface(this, "username");
		//this.webView.addJavascriptInterface(this, "getUsername"); 
		this.webView.addJavascriptInterface(this, "navigation");//显示导航栏
		this.webView.addJavascriptInterface(this, "loadurl");
		this.webView.addJavascriptInterface(this, "urlpara");
		this.webView.addJavascriptInterface(this, "webview");
		
         /**设置自适应宽度
          *  NORMAL：正常显示，没有渲染变化。
          *  SINGLE_COLUMN：把所有内容放到WebView组件等宽的一列中。
          *  NARROW_COLUMNS：可能的话，使所有列的宽度不超过屏幕宽度。
          */
		this.webView.getSettings().setLayoutAlgorithm(LayoutAlgorithm.NORMAL);
		//不保存密码
		webView.getSettings().setSavePassword(false);
		
	    // this.webView.setInitialScale(67);//默认的缩放设置
		//this.webView.setInitialScale(100);//默认的缩放设置
		//设置页面固定大小
		this.webView.getSettings().setDefaultZoom(ZoomDensity.MEDIUM);//设置页面固定大小
		
		
		WebViewClient wvc = new WebViewClient() {
			 public boolean shouldOverrideUrlLoading(final WebView view, final String url) 
			 {
			      if (url.startsWith("sms:") || url.startsWith("tel:")) { 
		                Intent intent = new Intent(Intent.ACTION_VIEW,
		                        Uri.parse(url)); 
		                startActivity(intent); 
		            }else {
/*						if(url.contains("?")&&!url.startsWith("http://")){
							String[] temp = url.split("\\?");
							view.loadUrl(temp[0]);
							urlpara = temp[1];
						}else{
							urlpara = "";*/
		                    view.loadUrl(url);//载入网页
						//}
		            }
	             return true;   
	         }//重写点击动作,用webview载入
			 
				@Override
				public void onPageStarted(WebView view, String url, Bitmap favicon) {
					//handler.sendEmptyMessage(0);
					curUrl = url;
					Log.v("debug", url);
/*					if(!url.startsWith("http://")){
					if(url.contains("?")){
						String[] temp = url.split("\\?");
						urlpara = temp[1];
						url =  temp[0];
					}else{
						urlpara = "";
					}
					}*/
					super.onPageStarted(view, url, favicon);
/*					if(url.indexOf("login.html")>0){
						findViewById(R.id.navigation).setVisibility(View.GONE);
					}
					if(url.indexOf("desk.html")>0){
						 homeBtn.setBackgroundResource(R.drawable.home_l);
						 xxsbBtn.setBackgroundResource(R.drawable.xxsb);
						 gwqsBtn.setBackgroundResource(R.drawable.gwqs);
						 //smsBtn.setBackgroundResource(R.drawable.sms);
						// settingBtn.setBackgroundResource(R.drawable.setting);
					}else if(url.indexOf("gwqs.html")>0){
						 homeBtn.setBackgroundResource(R.drawable.home);
						 xxsbBtn.setBackgroundResource(R.drawable.xxsb);
						 gwqsBtn.setBackgroundResource(R.drawable.gwqs_l);
						// smsBtn.setBackgroundResource(R.drawable.sms);
						// settingBtn.setBackgroundResource(R.drawable.setting);
					}else if(url.indexOf("xxsb/list.html")>0){
						 homeBtn.setBackgroundResource(R.drawable.home);
						 xxsbBtn.setBackgroundResource(R.drawable.xxsb_l);
						 gwqsBtn.setBackgroundResource(R.drawable.gwqs);
						// smsBtn.setBackgroundResource(R.drawable.sms);
						// settingBtn.setBackgroundResource(R.drawable.setting);
					}else if(url.indexOf("dx.html")>0||url.indexOf("dx_mx.html")>0||url.indexOf("dxfs.html")>0){
						 homeBtn.setBackgroundResource(R.drawable.home);
						// tongzhiBtn.setBackgroundResource(R.drawable.tongzhi);
						// txlBtn.setBackgroundResource(R.drawable.txl);
						 smsBtn.setBackgroundResource(R.drawable.sms_l);
						 settingBtn.setBackgroundResource(R.drawable.setting);
					}else if(url.indexOf("xtsz.html")>0){
						 homeBtn.setBackgroundResource(R.drawable.home);
						// tongzhiBtn.setBackgroundResource(R.drawable.tongzhi);
						// txlBtn.setBackgroundResource(R.drawable.txl);
						 smsBtn.setBackgroundResource(R.drawable.sms);
						 settingBtn.setBackgroundResource(R.drawable.setting_l);
					}*/
				}

				@Override
				public void onPageFinished(WebView view, String url) {

					super.onPageFinished(view, url);
					 if(url.endsWith(".mp4") || url.endsWith(".MP4"))
					 {  
					     Intent i = new Intent(Intent.ACTION_VIEW);  
						 i.setDataAndType(Uri.parse(url),"video/mp4");
						 startActivity(i); 
					}else if(url.indexOf("desk.html")>0){//						 
						//findViewById(R.id.navigation).setVisibility(View.VISIBLE);
					}
				}

				@Override
				public void onLoadResource(WebView view, String url) {
					super.onLoadResource(view, url);
				}

				@Override
				public void onReceivedError(WebView view, int errorCode,
						String description, String failingUrl) {
					super.onReceivedError(view, errorCode, description, failingUrl);
					if(failingUrl.contains("?")&&!failingUrl.startsWith("http://")){
					String[] temp = failingUrl.split("\\?");
					urlpara = "?"+temp[1];
					webView.loadUrl(temp[0]);
					}else{
						//urlpara="";
					Toast.makeText(NewWebViewWnd.this, "网络连接出错！", Toast.LENGTH_LONG).show();
					}
				}	
				
		};
		CookieManager cookieManager = CookieManager.getInstance();
		cookieManager.setAcceptCookie(true);
		
		// 设置WebViewClient对象
		webView.setWebViewClient(wvc);
		
		webView.setWebChromeClient(new WebChromeClient(){ 
			public void onProgressChanged(WebView view,int progress){//载入进度改变而触发 
             	if(progress==100){
            		//handler.sendEmptyMessage(1);//如果全部载入,隐藏进度对话框
            	}   
                super.onProgressChanged(view, progress);   
            } 
		    @Override
		    public boolean onJsAlert(WebView view, String url, String message, final JsResult result) {
		        AlertDialog.Builder b2 = new AlertDialog.Builder(view.getContext())
		                .setTitle("提示").setMessage(message)
		                .setPositiveButton("关闭",
		                        new AlertDialog.OnClickListener() {
		                            @Override
		                            public void onClick(DialogInterface dialog,
		                                    int which) {
		                                result.confirm();
		                                // MyWebView.this.finish();
		                            }
		                        });

		        b2.setCancelable(false);
		        b2.create();
		        b2.show();
		        return true;
		    }
			
        });
		//设置webview下载
		webView.setDownloadListener(new DownloadListener(){

			@Override
			public void onDownloadStart(String url, String userAgent,
					String contentDisposition, String mimetype,
					long contentLength) {
				if(url.endsWith(".pdf") || url.endsWith(".ppt")
						|| url.endsWith(".docx") || url.endsWith(".xlsx")
						|| url.endsWith(".pptx") || url.endsWith(".doc")
						|| url.endsWith(".xls") || url.endsWith(".rar")
						|| url.endsWith(".jpg")|| url.endsWith(".png")
						|| url.endsWith(".zip")|| url.endsWith(".txt"))
				{
				   //实现下载的代码
                   Uri uri = Uri.parse(url);
                   Intent intent = new Intent(Intent.ACTION_VIEW,uri);
                   startActivity(intent);
				}
			}});
   }
	
	
	@Override
	protected void onPause() {
		  super.onPause();
	}
	protected void onNewIntent(Intent intent) {
		   super.onNewIntent(intent);
		   String url = intent.getStringExtra("URL");//消息推送明细地址
			if (url!=null)
			{
				 url = url.substring(url.indexOf("file"));
				 loadurl(webView, url);
				 
			}
			String newurl = intent.getStringExtra("newUrl");//在新的webview实例中打开一个链接
			if(newurl!=null){
				 loadurl(webView, newurl);
				// return;
			}
	}
	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
         if(keyCode == KeyEvent.KEYCODE_BACK){
 			if (pd != null)
 			{
 				pd.cancel();
 				pd.dismiss();
 			}
 			
             Intent intent = new Intent();     
             setResult(Activity.RESULT_CANCELED,intent);   
             finish();
        	return true; 
         } 
		return super.onKeyDown(keyCode, event);
	}

	public void onHttpRequestGridView(HttpRequestGridView http)
	{
		
/*		if(((Boolean)http.getPrivateDate()).booleanValue())
		{
			return;
		}*/
	
	}
	 public void loadurl(final WebView view,final String url){
	           // handler.sendEmptyMessage(0);
		 		if(url.contains("?")){
					String[] temp = url.split("\\?");
					urlpara = temp[1];
					view.loadUrl(temp[0]);
				}else{
                    view.loadUrl(url);//载入网页
				}
	            //webView.loadUrl(url);
	           // webView.loadUrl("file:///android_asset/wap/login.html");
				//if(url.indexOf("login.html")>0){
	             //findViewById(R.id.navigation).setVisibility(View.GONE);
				//}
	    } 
	 @Override
		public void onConfigurationChanged(Configuration newConfig) {
			
				getRequestedOrientation();

			super.onConfigurationChanged(newConfig);
		}
	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		menu.add(0,1,2,"退出");
		menu.add(0,2,1,"设置");
		return true;
	}
	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		if(item.getItemId()==1)
		{
//			File file = CacheManager.getCacheFileBaseDir();
			File file = null;
			if (file != null && file.exists() && file.isDirectory()) {
				for (File f : file.listFiles()) {
					f.delete();
				}
				file.delete();
			}
			NewWebViewWnd.this.deleteDatabase("webview.db");
			NewWebViewWnd.this.deleteDatabase("webviewCache.db");
		   this.finish();
		   return true;
		   
		}else if(item.getItemId()==2){
			Intent intent=new Intent();
			intent.setClass(NewWebViewWnd.this, Settings.class);
			startActivity(intent);
			NewWebViewWnd.this.finish();
		}
		return super.onOptionsItemSelected(item);
	}
	public String getHostUrl(){
		String url = Utility.iURL;
		if(url!=null&&!url.startsWith("http://")){
			url = "http://"+url;
		}
		return url;
	}
	//保存token
	public void saveToken(String cookieVlaue){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("sys_token_khd", cookieVlaue).commit();
	/*	Intent intent=new Intent();
		intent.setClass(WebViewWnd.this, myCamera.class);
		startActivity(intent);
		finish();*/
	}
	public String getToken(){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		String token  = settings.getString("sys_token_khd","");
		return token;
	}
	//保存用户名
	public void saveUsername(String username){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("username", username).commit();
	}
	public String getUsername(){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		String username  = settings.getString("username","");
		return username;
	}
	public void showNavigation(){
		//findViewById(R.id.navigation).setVisibility(View.VISIBLE);
	}
	public void loadHtml(String url){
		  webView.loadUrl(url);
	}

	public String getCookie(){
	    CookieManager cookieManager = CookieManager.getInstance();
	    String loginCookie = cookieManager.getCookie("http://100.2.1.2");
	    return loginCookie;
	}
	public String getUrlJsonpara(){
		if(urlpara==null||"".equals(urlpara)){
			return "{}";
		}
        String[] para = urlpara.split("&");
        String json="";
        for(String str:para){
        	json = json + ",\""+str.split("=")[0]+"\":\""+str.split("=")[1]+"\"";
        }
        json = json.replaceFirst(",", "");
        json = "{"+json+"}";
       // urlpara="";//将参数重置为空
        return json;
	}
	public String getUrlparam(){
		if(urlpara==null){
			return "";
		}
		return urlpara;
	}
	public void Window_location(String url_para){
		urlpara="";
		urlpara = "?"+url_para;
	}
	public void showProgressDialog(){
		if(dialog==null){
/*		dialog = ProgressDialog.show(this, // context    
        "", // title     
        "数据载入中，请稍候...", // message     
        true); //进度是否是不确定的，这只和创建进度条有关
*/		
			dialog=new ProgressDialog(this);
			dialog.setProgressStyle(ProgressDialog.STYLE_SPINNER);
			dialog.setMessage("数据载入中，请稍候...");
			dialog.show();
		}else{
		  dialog.show();
		}

	}
	public void hideProgressDialog(){
		dialog.hide();  
	}
	//启用即时通信服务
	public void startIMService(){
	 Intent i = new Intent(this, ImCoreService.class);
	 startService(i);
	 NoticeHelper.notice(this);
	}
	/*
	 * 保存用户名 密码
	 */
	public void saveImNameAndPsd(String username,String password)
	{
		settings = PreferenceManager.getDefaultSharedPreferences(NewWebViewWnd.this);
		SharedPreferences.Editor edit = settings.edit();
		edit.putString(App.IM_USERNAME_KEY, username);
		edit.putString(App.IM_PASSWORD_KEY, password);
		
		edit.putBoolean(App.ACCOUNT_LOGIN_KEY, true);//保存用户状态
		edit.commit();
	}
	public String getMei(){
		return ImeiHelper.getImei(this);
	}
	public String getMsi(){
		return ImeiHelper.getImsi(this);
	}
	public String getDeviceInfo(){
		return DeviceHelper.getDeviceInfo();
	}
	public void changeSkin(){
	  if(curUrl!=null&&curUrl.indexOf("login.html")<0){
		 loadurl(webView,"javascript:changeSkin()"); 
		}
	}
	public void CacheMenu(String menu){
		Cache.setUserInfo(this.getToken(), "menu", menu);
	}
	public String getMenuList(){
		return (String)Cache.getUserInfo(this.getToken(), "menu");
	}

	public void closeWin(String data){//返回WebViewWnd
        Intent intent = new Intent();  
		intent.setClass(NewWebViewWnd.this, WebViewWnd.class);
        intent.putExtra("userData",data);  
        startActivity(intent);
        //setResult(Activity.RESULT_OK,intent); 
        //finish();  
        
	}
	public void exitWin(){
/*        Intent intent = new Intent();     
        setResult(Activity.RESULT_CANCELED,intent);   
        finish();*/
		Intent intent=new Intent();
		intent.setClass(NewWebViewWnd.this, WebViewWnd.class);
		startActivity(intent);
	}
	public void asyncHttpRequest(String url,String data,final String sys_timeStamp,final String callback){
		String str = NewWebViewWnd.this.getString(R.string.SETTING_INFOS);
		SharedPreferences settings = NewWebViewWnd.this.getSharedPreferences(str, 0);
		AsyncHttpClient client = new AsyncHttpClient();
		url = settings.getString("httpMain", "")  + url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
		
		String[] dataArr = data.split("&");
		RequestParams params = new RequestParams();
		for(String param:dataArr){
			 String key = param.split("=")[0];
			 String value = param.endsWith("=")?"":param.split("=")[1];
			 if(value.contains("~")){
				 Set<String> set = new HashSet<String>(); 
				 for(String v:value.split("~")){
				   set.add(v);
				 }
				 params.put(key, set);  
			 }else{
				 params.put(key,value);
			 }
			 
		}
        
		client.post(url, params, new AsyncHttpResponseHandler() {
		    @Override
		    public void onSuccess(String response) {
		    	if(!"".equals(callback)){
		    		NewWebViewWnd.this.webView.loadUrl("javascript:"+callback+"("+response+",'"+sys_timeStamp+"')");
		    	}
		    	
		    }
			@Override
			public void onFailure(Throwable error, String content)
			{
				//Log.e(TAG , "onFailure error : " + error.toString() + "content : " + content);
			}
		});

	}
}
