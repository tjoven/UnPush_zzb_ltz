package com.unicom.baseoa;
 
import java.lang.reflect.InvocationTargetException;
import java.util.HashSet;
import java.util.Set;

import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.RequestParams;
import com.unicom.baseoa.util.Utility;
import com.unicom.sywq.R;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.text.TextPaint;
import android.util.Log;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.View.OnTouchListener;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.DownloadListener;
import android.webkit.JsResult;
import android.webkit.WebBackForwardList;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebSettings.LayoutAlgorithm;
import android.webkit.WebSettings.ZoomDensity;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.Toast;
 

public class BrowserWnd extends Activity {
	
	private WebView browserWebView = null;
	
	private LinearLayout daohang ;
 
	ProgressDialog dialog = null;  
	
	private boolean isFullScreen = false;
	
	 private FrameLayout fullScreenView ;
	 
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);  
//		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
//            //透明状态栏
//            getWindow().addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
//            //透明导航栏
//           // getWindow().addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
//		}
		//全屏  
//		getWindow().setFlags(WindowManager.LayoutParams. FLAG_FULLSCREEN ,    
//		              WindowManager.LayoutParams. FLAG_FULLSCREEN);   
//		getWindow().setFlags(WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN ,    
//	              WindowManager.LayoutParams. FLAG_LAYOUT_IN_SCREEN);   
//		getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);
		setContentView(R.layout.browser_wnd);
		this.browserWebView = (WebView) this.findViewById(R.id.browser_webview);
		initWebViewNew(browserWebView);	
		
		fullScreenView = (FrameLayout)findViewById(R.id.player_main_framelayout);
		daohang = (LinearLayout)findViewById(R.id.player_main_daohang);
		initBrowserButton();
	 
 		//在新的webview实例中打开一个链接
		 loadurl();
		 
	}
	
	@Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
		
		 WebBackForwardList mWebBackForwardList = this.browserWebView.copyBackForwardList();
		
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if(onBack()){
                return true;
            }
//            else if (mWebBackForwardList.getCurrentIndex() > 0) {
//                //获取历史列表
//                String historyUrl = mWebBackForwardList.getItemAtIndex(mWebBackForwardList.getCurrentIndex() - 1).getUrl();
//               
//                browserWebView.loadUrl(historyUrl);
//                return true;
//            }
            else{
                finish();
                return true;
            }
        }
        return super.onKeyDown(keyCode,event);
    }

    public boolean onBack(){
    	print("canGoBack="+browserWebView.canGoBack());
        if(isFullScreen){
            webChromeClient.onHideCustomView();
            return true;
        }else{
            if(browserWebView.canGoBack()){
            	browserWebView.goBack();
                return true;
            }else{
                return false;
            }
        }
    }


	@Override
	protected void onResume() {
		print("active="+browserWebView.isActivated()+",,enable="+browserWebView.isEnabled());
		if(!browserWebView.isEnabled()){
			browserWebView.setEnabled(true);
		}
		if(!browserWebView.isActivated()){
			browserWebView.setActivated(true);
		}
		try {
            browserWebView.getClass().getMethod("onResume").invoke(browserWebView,  (Object[])null);
            browserWebView.onResume();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (Exception e){
        	e.printStackTrace();
        }
		super.onResume();
//		String newurl = this.getIntent().getStringExtra("newUrl");//在新的webview实例中打开一个链接
//		loadurl(browserWebView, newurl);
		
	}
  	 private void loadurl(){
		 String newurl = this.getIntent().getStringExtra("newUrl");
	 		String w = this.getIntent().getStringExtra("wap_html");
		 String packageName = "";
			try {
				PackageManager pm = this.getPackageManager();
				PackageInfo pi = pm.getPackageInfo(this.getPackageName(), PackageManager.GET_ACTIVITIES);
				packageName=pi.packageName;
			} catch (NameNotFoundException e) {
				e.printStackTrace();
			}
		 if("yes".equals(w)){
			 this.browserWebView.loadUrl("file:///data/data/"+packageName+"/files/wap_html/"+newurl);//载入网页
			 
		 }else{
			 this.browserWebView.loadUrl(newurl);//载入网页
			 
		 }
	    } 
	 
	@Override
	 public void onPause(){
	        try {
	            browserWebView.getClass().getMethod("onPause").invoke(browserWebView,  (Object[])null);
	            browserWebView.onPause();
	        } catch (IllegalAccessException e) {
	            e.printStackTrace();
	        } catch (InvocationTargetException e) {
	            e.printStackTrace();
	        } catch (NoSuchMethodException e) {
	            e.printStackTrace();
	        } catch (Exception e){
	        	e.printStackTrace();
	        }
	        super.onPause();
	}
	public void asyncHttpRequest(String url,String data,final String sys_timeStamp,final String callback){
		String str = BrowserWnd.this.getString(R.string.SETTING_INFOS);
		SharedPreferences settings = BrowserWnd.this.getSharedPreferences(str, 0);
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
		    		BrowserWnd.this.browserWebView.loadUrl("javascript:"+callback+"("+response+",'"+sys_timeStamp+"')");
		    	}
		    	
		    }
			@Override
			public void onFailure(Throwable error, String content)
			{
				//Log.e(TAG , "onFailure error : " + error.toString() + "content : " + content);
			}
		});

	}
	
	public void initWebViewNew(WebView wvPlayer){
//		wvPlayer = (WebView) findViewById(R.id.wv_main);
		    WebSettings settings = wvPlayer.getSettings();
		    
		    
		    settings.setSupportZoom(true);
		    settings.setBuiltInZoomControls(true);
//		    settings.setDisplayZoomControls(false);
		    
		    settings.setJavaScriptEnabled(true);
//		    settings.setUserAgentString("FortuneAndroidInnerWebPlayer V1.0");
		    settings.setLoadsImagesAutomatically(true);
		    settings.setUseWideViewPort(true);
		    settings.setLoadWithOverviewMode(true);
		    settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.SINGLE_COLUMN);
//		    settings.setPluginState(WebSettings.PluginState.ON);
		    settings.setDomStorageEnabled(true);
//		    settings.setMediaPlaybackRequiresUserGesture(false);
//		    settings.setAllowFileAccessFromFileURLs(true);
//		    settings.setAllowContentAccess(true);
		    wvPlayer.clearCache(true);
		    wvPlayer.setWebViewClient(webViewClient);
		    wvPlayer.setWebChromeClient(newWebChromeClient);
		    
		    wvPlayer.addJavascriptInterface(this, "webview");
		    
		    wvPlayer.addJavascriptInterface(this, "hosturl");
		    wvPlayer.addJavascriptInterface(this, "username");
			//this.webView.addJavascriptInterface(this, "getUsername"); 
		    wvPlayer.addJavascriptInterface(this, "navigation");//显示导航栏
		    wvPlayer.addJavascriptInterface(this, "loadurl");
		    wvPlayer.addJavascriptInterface(this, "urlpara");
		    
		    try{
				if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB && Build.VERSION.SDK_INT<=17){
					wvPlayer.removeJavascriptInterface("searchBoxJavaBridge_");
					wvPlayer.removeJavascriptInterface("accessibility");
					wvPlayer.removeJavascriptInterface("accessibilityTraversal");
				}
			}catch(Exception e){
				
			}
				
			
		}

	private WebViewClient webViewClient = new WebViewClient() {
		 public boolean shouldOverrideUrlLoading(final WebView view, final String url) 
		 {
			 if(Build.VERSION.SDK_INT<26) {
		       
		      if (url.startsWith("sms:") || url.startsWith("tel:")) { 
	                Intent intent = new Intent(Intent.ACTION_VIEW,
	                        Uri.parse(url)); 
	                startActivity(intent); 
	            }else {
	            	view.loadUrl(url);//载入网页
	            }
		      return true;   
			 }else{
return false;				 
			 }
        }//重写点击动作,用webview载入
		 
			@Override
			public void onPageStarted(WebView view, String url, Bitmap favicon) {
				//handler.sendEmptyMessage(0);
		 
				Log.v("debug", url);

				super.onPageStarted(view, url, favicon);

			}

			@Override
			public void onPageFinished(WebView view, String url) {

				super.onPageFinished(view, url);
				 if(url.endsWith(".mp4") || url.endsWith(".MP4"))
				 {  
				     Intent i = new Intent(Intent.ACTION_VIEW);  
					 i.setDataAndType(Uri.parse(url),"video/mp4");
					 startActivity(i); 
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
			 
				view.loadUrl(temp[0]);
				}else{
			 
				Toast.makeText(BrowserWnd.this, "网络连接出错！", Toast.LENGTH_LONG).show();
				}
			}	
			
	};
	 	
private	WebChromeClient webChromeClient = new WebChromeClient(){ 
		
		private View myView = null;
	    private CustomViewCallback myCallback = null;
	    private int currentDir = 338547;
		
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
	    
	    @Override
       public void onShowCustomView(View view, CustomViewCallback callback) {
           if (myCallback != null) {
               myCallback.onCustomViewHidden();
               myCallback = null ;
               return;
           }
//           isFullScreen=true;
           fullScreenView.addView(view);
           fullScreenView.setVisibility(View.VISIBLE);
           fullScreenView.bringToFront();
           myView = view;
           myCallback = callback;
//           wcc = this ;
           currentDir = getRequestedOrientation();
           getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                   WindowManager.LayoutParams.FLAG_FULLSCREEN);//设置全屏
           if(currentDir!=ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE){
               setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
           }
       }
       
       @SuppressWarnings("WrongConstant")
       public void onHideCustomView() {
//           isFullScreen=true;
           if (myView != null) {
               if (myCallback != null) {
                   myCallback.onCustomViewHidden();
                   myCallback = null ;
               }
               fullScreenView.removeView(myView);
               fullScreenView.setVisibility(View.GONE);
               int fullScrreenOrientation = getRequestedOrientation();
               if(fullScrreenOrientation!=currentDir&&currentDir!=338547){
                   setRequestedOrientation(currentDir);
               }
               final WindowManager.LayoutParams attrs = getWindow().getAttributes();
   	        attrs.flags &= (~WindowManager.LayoutParams.FLAG_FULLSCREEN);
   	        getWindow().setAttributes(attrs);
   	        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
               myView = null;
           }
       }
		
   } ;
   
 private  DownloadListener downloadListener = new DownloadListener(){

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
		}};
		
		
private WebChromeClient newWebChromeClient = new WebChromeClient()
		{
		@Override
		public boolean onJsAlert(WebView view, String url, String message,
		                             JsResult result)
		    {
		// TODO Auto-generated method stub
//		Log.d(TAG,"准备调用js"+url+",message="+message);
		return super.onJsAlert(view, url, message, result);
		    }
	 
		@Override
		public void onShowCustomView(View view, CustomViewCallback callback) {
		if (myCallback != null) {
		myCallback.onCustomViewHidden();
		myCallback = null ;
		return;
		        }
		isFullScreen=true;
		daohang.setVisibility(View.GONE);
		fullScreenView.addView(view);
		fullScreenView.setVisibility(View.VISIBLE);
		fullScreenView.bringToFront();
		myView = view;
		myCallback = callback;
		webChromeClient = this ;
		currentDir = getRequestedOrientation();
		        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
		                WindowManager.LayoutParams.FLAG_FULLSCREEN);//设置全屏
		if(currentDir!=ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE){
		            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
		        }
		    }
		private View myView = null;
		private CustomViewCallback myCallback = null;
		int currentDir = 338547;
		@SuppressWarnings("WrongConstant")
	 
		public void onHideCustomView() {
		isFullScreen=false;
		if (myView != null) {
		if (myCallback != null) {
		myCallback.onCustomViewHidden();
		myCallback = null ;
		            }
		
		fullScreenView.removeView(myView);
		fullScreenView.setVisibility(View.GONE);
		daohang.setVisibility(View.VISIBLE);
		int fullScrreenOrientation = getRequestedOrientation();
		if(fullScrreenOrientation!=currentDir&&currentDir!=338547){
		                setRequestedOrientation(currentDir);
		            }
		            quitFullScreen();
		myView = null;
		        }
		    }
		};
		private void quitFullScreen(){
		final WindowManager.LayoutParams attrs = getWindow().getAttributes();
		    attrs.flags &= (~WindowManager.LayoutParams.FLAG_FULLSCREEN);
		    getWindow().setAttributes(attrs);
		    getWindow().clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
		//requestWindowFeature(Window.FEATURE_CUSTOM_TITLE);
		}
		
		public String getToken(){
			SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
			String token  = settings.getString("sys_token_khd","");
			return token;
		}
		
		//get yhid
		public String getYhid(){
			SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
			String yhid  = settings.getString("yhid","");
			return yhid;
		}

		public String getHostUrl(){
			String url = Utility.iURL;
			if(url!=null&&!url.startsWith("http://")){
				url = "http://"+url;
			}
			return url;
		}
		 
		private void initBrowserButton(){
			Button btn = (Button) findViewById(R.id.browser_backbtn);
			btn.setOnClickListener(new OnClickListener() {
				
				@Override
				public void onClick(View arg0) {
					// TODO Auto-generated method stub
					finish();
				}
			}); 
			 
			ImageButton houtui = (ImageButton) findViewById(R.id.browser_houtuibtn);
			houtui.setOnClickListener(new OnClickListener() {
				
				@Override
				public void onClick(View arg0) {
					// TODO Auto-generated method stub
					print("后退：canGoBack="+browserWebView.canGoBack());
					browserWebView.goBack();   //后退  
				}
			}); 
			
			
			 
			
			ImageButton qianjin = (ImageButton) findViewById(R.id.browser_qianjinbtn);
			qianjin.setOnClickListener(new OnClickListener() {
				
				@Override
				public void onClick(View arg0) {
					// TODO Auto-generated method stub
					browserWebView.goForward();//前进
				}
			}); 
			
			 
		}
		
		private void print(final String text){
//			BrowserWnd.this.runOnUiThread(new Runnable() {
//				
//				@Override
//				public void run() {
//					// TODO Auto-generated method stub
//					Toast.makeText(BrowserWnd.this,text , Toast.LENGTH_LONG).show();
//				}
//			});
		}
}
