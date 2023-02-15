package com.unicom.baseoa;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;

import org.apache.http.conn.ssl.SSLSocketFactory;

//import javax.net.ssl.SSLContext;
//import javax.net.ssl.SSLSocketFactory;
//import javax.net.ssl.TrustManager;
//import javax.net.ssl.TrustManagerFactory;

import org.apache.http.cookie.Cookie;
import org.apache.http.util.EncodingUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.async.http.socketio.Acknowledge;
import com.async.http.socketio.SocketIOClient;
import com.baidu.location.BDLocation;
import com.baidu.location.BDLocationListener;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;
import com.iflytek.cloud.ErrorCode;
import com.iflytek.cloud.InitListener;
import com.iflytek.cloud.SpeechConstant;
import com.iflytek.cloud.SpeechError;
import com.iflytek.cloud.SpeechSynthesizer;
import com.iflytek.cloud.SynthesizerListener;
import com.iflytek.speech.setting.TtsSettings;
import com.iflytek.sunflower.FlowerCollector;
import com.kubility.demo.MP3Recorder;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.PersistentCookieStore;
import com.loopj.android.http.RequestParams;
import com.sdunisi.oa.App;
import com.sdunisi.oa.service.ImCoreService;
import com.sdunisi.oa.service.ImCoreService.LocalBinder;
import com.sdunisi.oa.service.NodeJsNoticeHelper;
import com.sdunisi.oa.version.FileProvider7;
import com.unicom.baseoa.detailwnd.DetailWnd;
import com.unicom.baseoa.imgcache.ImgCache;
import com.unicom.baseoa.myhttps.HttpUtilsSafe2;
import com.unicom.baseoa.selectfile.UploadFileUtil;
import com.unicom.baseoa.splash.WndSplash;
import com.unicom.baseoa.update.InitDataTask;
import com.unicom.baseoa.update.LoginTask;
import com.unicom.baseoa.update.UpdateHtmlTask;
import com.unicom.baseoa.util.CrashHandler;
import com.unicom.baseoa.util.HomeWatcher;
import com.unicom.baseoa.util.HomeWatcher.OnHomePressedListener;
import com.unicom.baseoa.util.PhoneInfoUtils;
import com.unicom.baseoa.util.TimeUtil;
import com.unicom.baseoa.util.Utility;
import com.unicom.config.OnClearCache;
import com.unicom.config.OnUploadLog;
import com.unicom.config.WndConfig;
import com.unicom.mRecorder.MovieMainActivity;
import com.unicom.sywq.R;
import com.wotool.http.DeviceHelper;
import com.wotool.http.HttpDocDown;
import com.wotool.http.HttpDocDown.OnHttpDocDownListener;
import com.wotool.http.HttpMultipartPost;
import com.wotool.http.HttpMultipartPostData;
import com.wotool.http.HttpRequestGridView;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.ActivityManager.RunningTaskInfo;
import android.app.AlarmManager;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.app.DownloadManager.Request;
import android.app.PendingIntent;
import android.app.ProgressDialog;
import android.content.BroadcastReceiver;
import android.content.ClipboardManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.content.res.Configuration;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.media.MediaPlayer;
import android.media.MediaRecorder;
import android.net.Uri;
import android.net.http.SslError;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.SystemClock;
import android.preference.PreferenceManager;
import android.provider.ContactsContract;
import android.provider.ContactsContract.CommonDataKinds.Email;
import android.provider.ContactsContract.CommonDataKinds.Nickname;
import android.provider.ContactsContract.CommonDataKinds.Note;
import android.provider.ContactsContract.CommonDataKinds.Organization;
import android.provider.ContactsContract.CommonDataKinds.Phone;
import android.provider.ContactsContract.CommonDataKinds.StructuredPostal;
import android.provider.MediaStore;
import android.support.v4.content.FileProvider;
import android.telephony.SmsManager;
import android.util.Log;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.view.Window;
import android.view.inputmethod.InputMethodManager;
//import android.webkit.CacheManager;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.JsResult;
import android.webkit.SslErrorHandler;
import android.webkit.WebBackForwardList;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebSettings.LayoutAlgorithm;
import android.webkit.WebSettings.ZoomDensity;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;
import unigo.utility.ImeiHelper;
import unigo.utility.ShakeInterface;
import unigo.utility.Worker;
import unigo.utility.cache.Cache;

public class WebViewWnd extends Activity implements OnHttpDocDownListener,BDLocationListener {
	
	private WebView webView = null;
	private WebView webView2 = null;
//	private WebView webView3 = null;
//	private WebView webView4 = null;
//	private WebView webView5 = null;
//	private WebView webView6 = null;
//	private WebView webView7 = null;
	private static final int SELECTIMG_MARK = 400;	//wangzl
	
    ProgressDialog pd=null;
    private UploadFileUtil uploadFileUtil;
	private Button homeBtn;
	private Button menu1Btn;
	private Button menu2Btn;
	private Button smsBtn;
	private Button menu3Btn;
	private Button menu4Btn;
	private Button exitBtn;
	
	private TextView homeTextView;
	private TextView menu1TextView;
	private TextView menu2TextView;
	private TextView smsTextView;
	private TextView menu3TextView;
	private TextView menu4TextView;
	private TextView exitTextView;
	private View  webViewLayout;
	private SharedPreferences settings;
	private String urlpara;
    private  ShakeInterface shake;
    private String curUrl;//当前页面的url地址
	ProgressDialog dialog = null;  
	private Bitmap bitmap = null;
	private RelativeLayout relativeLayout;
	private LocationClient mLocClient;
	private long t1;
	private long t2;
	public static WebViewWnd instance = null;
	private static HashMap map = new HashMap();
	private final int REQUEST_CONTACT = 2;
	private final int REQUEST_HOME = 10;
	private final int REQUEST_MENU1 = 11;
	private final int REQUEST_MENU2 = 12;
	private final int REQUEST_MENU3 = 13;
	private final int REQUEST_INITTOOL = 14;
	private final int REQUEST_MENU4 = 15;
	private final int PHOTO_REQUEST_GALLERY = 111;
	private final int PHOTO_REQUEST_CAREMA = 112;
	private final int PHOTO_REQUEST_CUT = 113;
	private final String PHOTO_FILE_NAME = "imoa";
	private File tempFile;
	
	private String contactId;
	private boolean clickflag=false;
	private boolean menushow = false;//标识菜单是否已显示
	public static Cookie cookie = null;
	private String picFilePath; 
	private String zid; //拍照图片对应的id
	private String mk_mc;//拍照对应的模块名称
	private String wjlj;//拍照对应的模块名称
	private String attachment;//拍照对应的模块名称
	private int outputXY;//拍照对应的模块名称
	private String wjcallback;
	private HomeWatcher mHomeWatcher;
	private static final String TAG = "WebViewWnd";
	private OnHomePressedListener OnHomePressedListener;
	private boolean onHomeFlag=false;
	private boolean activityResultFlag=true;
	private static final int SELECT_FILE = 998;
	//錄音
	private static String mFileName = null;
	private static String mFilePath = null;
	private MediaRecorder mRecorder = null;
	private MediaPlayer   mPlayer = null;
	private MP3Recorder recorder2 =null;
	private PopupWindow popupWindow =null;
	private String packageName="com.unicom.baseoa"; 
	private static final int PHOTOGRAPH_MARK = 300;	//wangzl
	private ViewOnClickListener viewOnClickListener = new ViewOnClickListener();
	private Handler handler=new Handler(){
    	public void handleMessage(Message msg)
	    {//定义一个Handler，用于处理工具栏按钮高亮显示
	      if (!Thread.currentThread().isInterrupted())
	      {
	        switch (msg.what)
	        {
	        case REQUEST_HOME:
	        	 homeBtn.setBackgroundResource(R.drawable.home_l);
				 menu1Btn.setBackgroundResource(R.drawable.menu1);
				 menu2Btn.setBackgroundResource(R.drawable.menu2);
				 menu3Btn.setBackgroundResource(R.drawable.menu3);
				 if(!"".equals(getUsername2())){
					findViewById(R.id.menu4Layout).setVisibility(View.VISIBLE);
				 }
				// findViewById(R.id.navigation).setVisibility(View.GONE);
	        	break;
	        case REQUEST_MENU1:
	        	homeBtn.setBackgroundResource(R.drawable.home);
				 menu1Btn.setBackgroundResource(R.drawable.menu1_l);
				 menu2Btn.setBackgroundResource(R.drawable.menu2);
				 menu3Btn.setBackgroundResource(R.drawable.menu3);
				// findViewById(R.id.navigation).setVisibility(View.VISIBLE);
	        	break;
	        case REQUEST_MENU2:
	        	homeBtn.setBackgroundResource(R.drawable.home);
				 menu1Btn.setBackgroundResource(R.drawable.menu1);
				 menu2Btn.setBackgroundResource(R.drawable.menu2_l);
				 menu3Btn.setBackgroundResource(R.drawable.menu3);
				// findViewById(R.id.navigation).setVisibility(View.VISIBLE);
	        	break;
	        case REQUEST_MENU3:
	        	homeBtn.setBackgroundResource(R.drawable.home);
				 menu1Btn.setBackgroundResource(R.drawable.menu1);
				 menu2Btn.setBackgroundResource(R.drawable.menu2);
				 menu3Btn.setBackgroundResource(R.drawable.menu3_l);
				// findViewById(R.id.navigation).setVisibility(View.VISIBLE);
	        	break;
	        case REQUEST_INITTOOL:
	    		homeBtn.setOnClickListener(viewOnClickListener);
	    		homeTextView.setOnClickListener(viewOnClickListener);
	    		menu1Btn.setOnClickListener(viewOnClickListener);
	    		menu1TextView.setOnClickListener(viewOnClickListener);
	    		menu2Btn.setOnClickListener(viewOnClickListener);
	    		menu2TextView.setOnClickListener(viewOnClickListener);
	    		menu3Btn.setOnClickListener(viewOnClickListener);
	    		menu3TextView.setOnClickListener(viewOnClickListener);
	    		menu4Btn.setOnClickListener(viewOnClickListener);
	    		menu4TextView.setOnClickListener(viewOnClickListener);
	        	break;
	        	
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
    Runnable   runnableUi=new  Runnable(){  
        @Override  
        public void run() {  
            //更新界面   
        	//findViewById(R.id.webview2).setVisibility(View.VISIBLE);
    	    findViewById(R.id.webview).setVisibility(View.GONE);
        }  
          
    };
    Runnable   showMenu=new  Runnable(){  
        @Override  
        public void run() {  
/*        	findViewById(R.id.navigation).setVisibility(View.VISIBLE);
        	//webView.reload();
        	ViewGroup.LayoutParams params = (ViewGroup.LayoutParams) webView.getLayoutParams();
            params.height -= 150; 
        	webViewLayout.invalidate();*/
			findViewById(R.id.navigation).setBackgroundDrawable(webView.getResources().getDrawable(R.drawable.navigation_bg));
			
			findViewById(R.id.cancelBtn).setVisibility(View.VISIBLE);
			findViewById(R.id.cancelTextView).setVisibility(View.VISIBLE);
			findViewById(R.id.homeBtn).setVisibility(View.VISIBLE);
			findViewById(R.id.homeTextView).setVisibility(View.VISIBLE);
			findViewById(R.id.menu1Btn).setVisibility(View.VISIBLE);
			findViewById(R.id.menu1TextView).setVisibility(View.VISIBLE);
			findViewById(R.id.menu2TextView).setVisibility(View.VISIBLE);
			findViewById(R.id.menu2Btn).setVisibility(View.VISIBLE);
			findViewById(R.id.menu3Btn).setVisibility(View.VISIBLE);
			findViewById(R.id.menu3TextView).setVisibility(View.VISIBLE);
			findViewById(R.id.menu4Btn).setVisibility(View.VISIBLE);
			findViewById(R.id.menu4TextView).setVisibility(View.VISIBLE);
        }  
          
    };
    Runnable   hideMenu=new  Runnable(){  
        @Override  
        public void run() {  
        	findViewById(R.id.navigation).setVisibility(View.GONE);
        }  
          
    };


/*	private Handler handler=new Handler(){
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
    };*/
	
	@SuppressLint("NewApi")
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		//无title  
		requestWindowFeature(Window.FEATURE_NO_TITLE);  
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            //透明状态栏
          //  getWindow().addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            //透明导航栏
           // getWindow().addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
		}
	 
		//全屏  
		//getWindow().setFlags(WindowManager.LayoutParams. FLAG_FULLSCREEN ,    
		        //      WindowManager.LayoutParams. FLAG_FULLSCREEN);   
		//getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);
		//getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE |WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN);
		setContentView(R.layout.webviewwnd);
		
		instance = this;
		
//		OnHomePressedListener=new OnHomePressedListener() {
//			@Override
//			public void onHomePressed() {
//				Log.e(TAG, "onHomePressed");
//				onHomeFlag=true;
//			}
//			@Override
//			public void onHomeLongPressed() {
//				Log.e(TAG, "onHomeLongPressed");
//			}
//		};
		
		init();	
		CrashHandler crashHandler = CrashHandler.getInstance();  
		crashHandler.init(this);  
		uploadFileUtil = new UploadFileUtil(this);
//		String str=null;
//		System.out.println(str.equals("ss"));
		settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		mLocClient = new LocationClient(getApplicationContext());
		mLocClient.registerLocationListener(this);
		//setLocationOption();
		
		//获取包名
		try {
			PackageManager pm = this.getPackageManager();
			PackageInfo pi = pm.getPackageInfo(this.getPackageName(), PackageManager.GET_ACTIVITIES);
			packageName=pi.packageName;
		} catch (NameNotFoundException e) {
			e.printStackTrace();
		}
		//System.out.println(packageName+"===="+this.getPackageName());
		String url = this.getIntent().getStringExtra("URL");//消息推送明细地址
		String noticeflag = this.getIntent().getStringExtra("ChatOrNotice");
		if (url!=null&&!"".equals(url)&&"1".equals(noticeflag))
		{
			//保存跳转信息
			 this.savePushmsgPara(url);
		}
		
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		Utility.iURL = settings.getString("httpMain","");

		//||!this.getString(R.string.url_new2).equals(Utility.iURL)
		if(Utility.iURL.equals("")){

			Utility.iURL =   this.getString(R.string.url_new2);  
			settings.edit().putString("httpMain", Utility.iURL).commit();
		}
		
		if (Utility.iURL==null||Utility.iURL.equals("")) {

			Intent intent=new Intent();
			intent.setClass(WebViewWnd.this, WndConfig.class);
			startActivity(intent);
			//finish();
		}
		if (Utility.iURL!=null&&!Utility.iURL.equals("")) {

			Intent intent=new Intent();
			intent.setClass(WebViewWnd.this, WndSplash.class);
			//intent.setClass(WebViewWnd.this, NewWebViewWnd.class);
			startActivity(intent);
			/*增量升级*/
			//if(!"0".equals(getString(R.string.IsopenZlsj))){
			//	initData();
			//}
		}
		if (Utility.iURL != null) {

//			/*增量升级*/
//			if(!"0".equals(getString(R.string.IsopenZlsj))){
//				if(!new File("data/data/"+packageName+"/files/wap_html").exists()){
//					initData();
//				}else{
//					loadurl(webView,"file:///data/data/"+packageName+"/files/wap_html/login.html");
//			  	    loadurl(webView2,"file:///data/data/"+packageName+"/files/wap_html/empty.html");
//				}
//			}else{
//				loadurl(webView,"file:///android_asset/wap/login.html");
//				loadurl(webView2,"file:///android_asset/wap/empty.html");
//			}
			
			new InitDataTask(this).execute();
			
			// 初始化合成对象
			mTts = SpeechSynthesizer.createSynthesizer(WebViewWnd.this, mTtsInitListener);
			mSharedPreferences = getSharedPreferences(TtsSettings.PREFER_NAME, MODE_PRIVATE);
			mToast = Toast.makeText(this,"",Toast.LENGTH_SHORT);
			
			//loadurl(webView,"http://172.16.8.30:8080/oa311/wap_yxpt/yxpt/khzf.html"); 
		}
		/*非增量升级*/
		//if("0".equals(getString(R.string.IsopenZlsj))){
			//loadurl(webView2,"file:///android_asset/wap/empty.html");
		//}
		//showPopUp(webView);
//		if(!"".equals(getLockscreenPwd())&&!"".equals(this.getPwdForLock())){
//			//openNewWin("/im/setting/passwordInput.html");
//			handler.post(new  Runnable(){
//				 public void run() { 
//					 /*增量升级路径*/
//					 if("0".equals(getString(R.string.IsopenZlsj))){
//						 loadurl(webView2,"file:///android_asset/wap/im/setting/passwordInput.html");
//					}else{
//						loadurl(webView2,"file:///data/data/"+packageName+"/files/wap_html/im/setting/passwordInput.html"); 
//					}
//					 webView.setVisibility(View.INVISIBLE);
//					 webView2.setVisibility(View.VISIBLE);
//				 }
//			}); 
//		}
		//new Version(this).check();//检查是否有版本更新
/*	    shake = new ShakeInterface(this);
		shake.registerOnShakeListener(new ShakeInterface.OnShakeListener() {
			
			@Override
			public void onShake() {
			 // loadurl(webView,"javascript:changeSkin()"); 
				changeSkin();
				  Timer timer = new Timer();
				  timer.schedule(new TimerTask(){
					  public void run(){
						  shake.setRecoding(false);
					  }
				  }, 2000);//
			}
		});
		shake.start();*/
	}
	public void loadInitHtml() {
		new Thread(){
			public void run(){
				new LoginTask(instance).execute();
			}
		}.start();
	}
	
	public void onLoginFinish(final String result) {
		unigo.utility.Log.write(1, "onLoginFinish", "result="+result+"SUCCESS.equals(result)="+("SUCCESS".equals(result)), "");
		if ("SUCCESS".equals(result)) {
			WebViewWnd.this.runOnUiThread(new Runnable() {
				public void run() {
					unigo.utility.Log.write(1, "WebViewWnd", "开始加载main.html和empty.html页面。。。", getUsername());
					loadurl(webView, "file:///data/data/" + packageName + "/files/wap_html/main.html");
					loadurl(webView2, "file:///data/data/" + packageName + "/files/wap_html/empty.html");
				}
			});
		} else {
			WebViewWnd.this.runOnUiThread(new Runnable() {
				public void run() {
					unigo.utility.Log.write(1, "WebViewWnd", "开始加载login.html和empty.html页面。。。", getUsername());
					loadurl(webView, "file:///data/data/" + packageName + "/files/wap_html/login.html");
					loadurl(webView2, "file:///data/data/" + packageName + "/files/wap_html/empty.html");
				}
			});
		}
		if (WndSplash.instance != null) {
			WndSplash.instance.close = true;
		}
	}
	
	//保存yhid
	public void logout() {
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("logout", "logout").commit();
	}
	
	private int onNum=0;
	@Override
	protected void onResume() {
		//System.out.println("222222222222222222222222222222222222+++++onResume"+onHomeFlag);
		//监听home建
//				mHomeWatcher = new HomeWatcher(this);
//				mHomeWatcher.setOnHomePressedListener(OnHomePressedListener);
//				mHomeWatcher.startWatch();
		if(!"".equals(getLockscreenPwd())&&!"".equals(this.getPwdForLock())&&activityResultFlag){
			onHomeFlag=false;
			handler.post(new  Runnable(){
				 public void run() { 
					if("0".equals(getString(R.string.IsopenZlsj))){
						 loadurl(webView2,"file:///android_asset/wap/im/setting/passwordInput.html");
					}else{
						loadurl(webView2,"file:///data/data/"+packageName+"/files/wap_html/im/setting/passwordInput.html"); 
					}
					 webView.setVisibility(View.INVISIBLE);
					 webView2.setVisibility(View.VISIBLE);
					 //////////findViewById(R.id.navigation).setVisibility(View.VISIBLE);
				 }
			});
		}
		activityResultFlag=true;
		//移动数据统计分析
				FlowerCollector.onResume(WebViewWnd.this);
				FlowerCollector.onPageStart(TAG);
		super.onResume();
	}

	@Override
	protected void onPause() {
		//System.out.println("1111111111111111111111111111111+++++onPause");
		//移动数据统计分析
				FlowerCollector.onPageEnd(TAG);
				FlowerCollector.onPause(WebViewWnd.this);
		  super.onPause();
		//Activity暂停时释放录音和播放对象
		  if (recorder2 != null) {
			  recorder2.stopRecording();
		  }
        if (mPlayer != null) {
            mPlayer.release();
            mPlayer = null;
        }
//		  mHomeWatcher.stopWatch();// 在onPause中停止监听，不然会报错的。
	}
	@SuppressLint({ "NewApi", "NewApi" })
	private void init(){
		homeBtn = (Button) findViewById(R.id.homeBtn);
		//homeBtn.setOnClickListener(viewOnClickListener);
	
		
		homeTextView = (TextView) findViewById(R.id.homeTextView);
		//homeTextView.setOnClickListener(viewOnClickListener);
		
		menu1Btn = (Button) findViewById(R.id.menu1Btn);
		//menu1Btn.setOnClickListener(viewOnClickListener);
	
		
		menu1TextView = (TextView) findViewById(R.id.menu1TextView);
		//menu1TextView.setOnClickListener(viewOnClickListener);
		
		menu2Btn = (Button) findViewById(R.id.menu2Btn);
		//menu2Btn.setOnClickListener(viewOnClickListener);
	
		
		menu2TextView = (TextView) findViewById(R.id.menu2TextView);
		//menu2TextView.setOnClickListener(viewOnClickListener);
		
		menu3Btn = (Button) findViewById(R.id.menu3Btn);
		//menu3Btn.setOnClickListener(viewOnClickListener);
		
		menu3TextView = (TextView) findViewById(R.id.menu3TextView);
		//menu3TextView.setOnClickListener(viewOnClickListener);
		menu4Btn = (Button) findViewById(R.id.menu4Btn);
		//menu3Btn.setOnClickListener(viewOnClickListener);
		
		menu4TextView = (TextView) findViewById(R.id.menu4TextView);
		//menu3TextView.setOnClickListener(viewOnClickListener);
		
		exitBtn = (Button) findViewById(R.id.cancelBtn);
		//exitBtn.setOnClickListener(viewOnClickListener);
		
		exitTextView = (TextView) findViewById(R.id.cancelTextView);
		//exitTextView.setOnClickListener(viewOnClickListener);
		
    	//进度条
    	pd=new ProgressDialog(this);
        pd.setProgressStyle(ProgressDialog.STYLE_SPINNER);
        pd.setMessage("数据载入中，请稍候...");
		
    	this.webView = (WebView) this.findViewById(R.id.webview);
    	this.webView2 = (WebView) this.findViewById(R.id.webview2);
//    	this.webView3 = (WebView) this.findViewById(R.id.webview3);
//    	this.webView4 = (WebView) this.findViewById(R.id.webview4);
//    	this.webView5 = (WebView) this.findViewById(R.id.webview5);
//    	this.webView6 = (WebView) this.findViewById(R.id.webview6);
//    	this.webView7 = (WebView) this.findViewById(R.id.webview7);
    	
    	//this.webView2 = new WebView(this);
    //	this.webView2 = (WebView) this.findViewById(R.id.webview2);
    	
    	/*this.webView.setScrollbarFadingEnabled(false);
    	this.webView.setScrollBarStyle(WebView.SCROLLBARS_OUTSIDE_OVERLAY);//滚动条风格
    	//Horizontal水平方向，Vertical竖直方向
    	webView.setHorizontalScrollBarEnabled(false);*/
     	//webView.setVerticalScrollBarEnabled(true);   
    	
    	//this.webView.getSettings().setAllowFileAccess(true);//设置允许访问文件数据
    	setWebView(this.webView);
    	setWebView(this.webView2);
//    	setWebView(this.webView3);
//    	setWebView(this.webView4);
//    	setWebView(this.webView5);
//    	setWebView(this.webView6);
//    	setWebView(this.webView7);
   }

	@SuppressLint("NewApi")
	private void setWebView(WebView webView) {
		//支持多点触屏
		webView.getSettings().setTextZoom(100);
		webView.setOnLongClickListener(new View.OnLongClickListener() {
            public boolean onLongClick(View v) {
                return true;
            }
        });
    	webView.getSettings().setBuiltInZoomControls(true); //支持多点触摸
    	webView.getSettings().setBuiltInZoomControls(true);//支持缩放功能
    	//webView.getSettings().setLightTouchEnabled(true);
    	webView.getSettings().setUseWideViewPort(true); //让浏览器支持用户自定义view
    	webView.getSettings().setLoadWithOverviewMode(true);//概览模式打开网页
		//webView.setWebChromeClient(new WebChromeClient());
		webView.getSettings().setJavaScriptEnabled(true);// 得到WebSetting对象，设置支持Javascript的参数
		webView.requestFocus();//触摸焦点起作用
		webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
		WebSettings webSettings=webView.getSettings();
		webSettings.setDomStorageEnabled(true);
		webSettings.setUseWideViewPort(true);
		webSettings.setLoadWithOverviewMode(true);
		//测试
		WebView.setWebContentsDebuggingEnabled(true);//添加调试
		//不使用缓存：
		//webView.getSettings().setCacheMode(webView.getSettings().LOAD_NO_CACHE); 
		//将一个当前的java对象绑定到一个javascript上面
		webView.addJavascriptInterface(this, "hosturl");
		webView.addJavascriptInterface(this, "username");
		//webView.addJavascriptInterface(this, "getUsername"); 
		webView.addJavascriptInterface(this, "navigation");//显示导航栏
		webView.addJavascriptInterface(this, "loadurl");
		webView.addJavascriptInterface(this, "urlpara");
		webView.addJavascriptInterface(this, "webview");
		this.webView.addJavascriptInterface(new GetContactInfo(this), "android");
		//webView.addJavascriptInterface(this, "window_location_href");
		try{
			if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB && Build.VERSION.SDK_INT<=17){
				webView.removeJavascriptInterface("searchBoxJavaBridge_");
				webView.removeJavascriptInterface("accessibility");
				webView.removeJavascriptInterface("accessibilityTraversal");
			}
		}catch(Exception e){
			
		}
         /**设置自适应宽度
          *  NORMAL：正常显示，没有渲染变化。
          *  SINGLE_COLUMN：把所有内容放到WebView组件等宽的一列中。
          *  NARROW_COLUMNS：可能的话，使所有列的宽度不超过屏幕宽度。
          */
		webView.getSettings().setLayoutAlgorithm(LayoutAlgorithm.NORMAL);
		//不保存密码
		webView.getSettings().setSavePassword(false);
		//使用localStorage则必须打开  
		webView.getSettings().setDomStorageEnabled(true); 

	    // webView.setInitialScale(67);//默认的缩放设置
		//webView.setInitialScale(100);//默认的缩放设置
		//设置页面固定大小
		webView.getSettings().setDefaultZoom(ZoomDensity.MEDIUM);//设置页面固定大小
		
		
		WebViewClient wvc = new WebViewClient() {
			 public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
//				 if(ImgCache.isImgHttpUrl(url)){
//					 String path = ImgCache.getImgCardUrl(url);
//					 if(path != null){
//						 try {
//	                         InputStream localCopy = new BufferedInputStream(new FileInputStream(path));
//	                         //当前只针对图片
//	                         WebResourceResponse response = new WebResourceResponse("image/*", "UTF-8", localCopy);
//	                         return response;
//	                     } catch (IOException e) {
//	                         e.printStackTrace();
//	                         LogException.log(instance, e);
//	                     }
//					 }
//                 }
                 return null;
             }
			 public boolean shouldOverrideUrlLoading(final WebView view,  String url) 
			 {
				if(url.indexOf(".do?")>0){
					String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
					SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
				    url =   url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
				}
				 Pattern p = Pattern.compile("/\\d{22}\\.[A-Za-z0-9]{1,4}$"); 
				 Matcher m = p.matcher(url); 
				 boolean b = m.find();
				 Log.v("shouldOverrideUrlLoading", b+"===="+url);
			      if (url.startsWith("sms:") || url.startsWith("tel:")) { 
//		                Intent intent = new Intent(Intent.ACTION_VIEW,Uri.parse(url)); 
		                Intent intent = new Intent(Intent.ACTION_CALL,Uri.parse(url)); 
		                startActivity(intent); 
		            }else{
//		            	if(url.endsWith(".png")||url.endsWith(".jpg")||url.endsWith(".JPEG")
//			    				||url.endsWith(".jpeg")||url.endsWith(".PNG")||url.endsWith(".JPG")
//			    				||url.endsWith(".gif")||url.endsWith(".GIF")){
//			    					showPopUp();
//			    					view.loadUrl(url);//载入网页
//			    		}else 
		            	url = url==null?"":url;
		            	if(url.toLowerCase().endsWith(".pdf")){
		            		String fileName = url.substring(url.lastIndexOf("/"));
		            		String path="";
		        			if (android.os.Environment.getExternalStorageState().equals(android.os.Environment.MEDIA_MOUNTED))
		        			{
		        				path = android.os.Environment.getExternalStorageDirectory().getPath();
		        				if (!path.endsWith("/"))
		        				{
		        					path += "/";
		        				}
		        				path = path + "Undownload/";
		        				File tmpFile = new File(path+fileName);
		        				if (tmpFile.exists())
		        				{
		        					Uri uri = Uri.fromFile(tmpFile);
				            		Intent intent = new Intent("android.intent.action.VIEW", uri);
				    				//intent.setClassName(WebViewWnd.this,"com.artifex.mupdfdemo.MuPDFActivity");
				    				intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
				    				intent.addCategory("android.intent.category.DEFAULT");
				    				//String authority = WebViewWnd.this.getPackageName() + ".fileprovider";
				    				//Uri uri1=FileProvider.getUriForFile(WebViewWnd.this, authority, tmpFile);
				    				intent.setDataAndType(uri, "application/pdf");
				    				
				    				startActivity(intent);
				    				return true;
		        				}
		        			}
		            		
		            		
		            	}
			    		if(b||url.endsWith(".mp4") || url.endsWith(".MP4")||url.endsWith(".flv") || url.endsWith(".FLV")||ImgCache.isImgHttpUrl(url)){
		            		if(!Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)){  
		            			Toast t=Toast.makeText(WebViewWnd.this, "无SD卡或SD卡不正常，["+Environment.getExternalStorageState()+"]", Toast.LENGTH_LONG);  
		            			//t.setGravity(Gravity.CENTER, 0, 0);  
		            			t.show();  
		            		}else{
		            			//进度条
		            			if(!ImgCache.isImgHttpUrl(url)){
		            				pd.setMessage("文件打开中，请稍后...");
			            			pd.setCancelable(false);
			            			pd.show();
		            			}
		            			final String url2=url;
		            			new Thread() {
		           				 @Override
		           				 public void run() {
			           					Uri uri = Uri.parse(url2);
				                        Intent intent = new Intent(Intent.ACTION_VIEW,uri);
				                        String fileName=Uri.decode(intent.getDataString());
				                        //System.out.println("fileName==="+fileName);
			           					 Worker worker=new Worker(1);
			           					if(url2.endsWith("&saveToAlbum")){
			           						try{
			           							String url3 = url2.replace("&saveToAlbum", "");
			           							String fn = fileName.replace("&saveToAlbum", "");
			           							if(url3.endsWith(".gif")||url3.endsWith(".GIF")){
					           						 HttpDocDown HttpDocDown=new HttpDocDown(WebViewWnd.this,url3,fn,"gif",true);
					           						 worker.doWork(HttpDocDown);
			           							}else{
			           								HttpDocDown HttpDocDown=new HttpDocDown(WebViewWnd.this,url3,fn,"sywq",true);
			           								worker.doWork(HttpDocDown);
			           							}
			           						}catch(Exception e){
			           							
			           						}
			           					 }else{
			           						 HttpDocDown HttpDocDown=new HttpDocDown(WebViewWnd.this,url2,fileName);
			           						 worker.doWork(HttpDocDown);
			           					 }
		           				     }
		           				 }.start();
		            		}
		            	}else if(url.endsWith(".m3u8")){
		            		Uri uri = Uri.parse(url);
		                   Intent intent = new Intent(Intent.ACTION_VIEW,uri);
		                   startActivity(intent);
		            	}else if(url.endsWith("&sysbrowser")){//系统浏览器打开链接
		            		url=url.substring(0, url.indexOf("&sysbrowser"));
		            		Uri uri = Uri.parse(url);
			                Intent intent = new Intent(Intent.ACTION_VIEW,uri);
			                startActivity(intent);
			            }else if(url.endsWith("&inbrowser")){//系统浏览器打开链接
		            		url=url.substring(0, url.indexOf("&inbrowser"));
		            		Intent intent = new Intent(instance, BrowserWnd.class);
							intent.putExtra("newUrl", url);
						    startActivity(intent);
			            } else {
			            	if(Build.VERSION.SDK_INT<26) {
		            		view.loadUrl(url);//载入网页
		            		return true;
			            	}else{
			            		return false;
			            	}
		            	}
		            }
			    	  
			    	  return true;   
  
	         }//重写点击动作,用webview载入
			 
				@Override
				public void onPageStarted(WebView view, String url, Bitmap favicon) {
					curUrl = url;
//					if(url.endsWith(".doc")){
//						//view.stopLoading();
//						HttpDocDown HttpDocDown=new HttpDocDown(WebViewWnd.this,url);
//					}

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

					if(url.indexOf("login.html")>0){//首页隐藏菜单
						//findViewById(R.id.navigation).setVisibility(View.GONE);
						findViewById(R.id.navigation).setBackgroundColor(Color.parseColor("#4a8bc2"));
						
						findViewById(R.id.cancelBtn).setVisibility(View.GONE);
						findViewById(R.id.cancelTextView).setVisibility(View.GONE);
						findViewById(R.id.homeBtn).setVisibility(View.GONE);
						findViewById(R.id.homeTextView).setVisibility(View.GONE);
						findViewById(R.id.menu1Btn).setVisibility(View.GONE);
						findViewById(R.id.menu1TextView).setVisibility(View.GONE);
						findViewById(R.id.menu2TextView).setVisibility(View.GONE);
						findViewById(R.id.menu2Btn).setVisibility(View.GONE);
						findViewById(R.id.menu3Btn).setVisibility(View.GONE);
						findViewById(R.id.menu3TextView).setVisibility(View.GONE);
						findViewById(R.id.menu4Btn).setVisibility(View.GONE);
						findViewById(R.id.menu4TextView).setVisibility(View.GONE);
						
					}
					super.onPageStarted(view, url, favicon);
					if(url.indexOf("desk.html")>0){
						 homeBtn.setBackgroundResource(R.drawable.home_l);
						 menu1Btn.setBackgroundResource(R.drawable.menu1);
						 menu2Btn.setBackgroundResource(R.drawable.menu2);
						 menu3Btn.setBackgroundResource(R.drawable.menu3);
					}/*else if(url.indexOf(getString(R.string.menu1_url))>0){
						 homeBtn.setBackgroundResource(R.drawable.home);
						 menu1Btn.setBackgroundResource(R.drawable.menu1_l);
						 menu2Btn.setBackgroundResource(R.drawable.menu2);
						 menu3Btn.setBackgroundResource(R.drawable.menu3);
					}else if(url.indexOf(getString(R.string.menu2_url))>0){
						 homeBtn.setBackgroundResource(R.drawable.home);
						 menu1Btn.setBackgroundResource(R.drawable.menu1);
						 menu2Btn.setBackgroundResource(R.drawable.menu2_l);
						 menu3Btn.setBackgroundResource(R.drawable.menu3);
					}else if(url.indexOf(getString(R.string.menu3_url))>0){
						 homeBtn.setBackgroundResource(R.drawable.home);
						 menu1Btn.setBackgroundResource(R.drawable.menu1);
						 menu2Btn.setBackgroundResource(R.drawable.menu2);
						 menu3Btn.setBackgroundResource(R.drawable.menu3_l);
					}*/
					if(url.indexOf("chat/chat.html")>-1){
						App.isChatPage=true;
						//findViewById(R.id.navigation_menu).setVisibility(View.GONE);
			        	//findViewById(R.id.navigation_msg).setVisibility(View.VISIBLE);
					}else{
						App.isChatPage=false;
						App.ChatwithYh="";
						//findViewById(R.id.navigation_msg).setVisibility(View.GONE);
			        	//findViewById(R.id.navigation_menu).setVisibility(View.VISIBLE);
					}
				}

				@Override
				public void onPageFinished(WebView view, String url) {

					super.onPageFinished(view, url);
					 if(url.endsWith(".mp4") || url.endsWith(".MP4"))
					 {  
//					     Intent i = new Intent(Intent.ACTION_VIEW);  
//						 i.setDataAndType(Uri.parse(url),"video/mp4");
//						 startActivity(i); 
						//进度条
//						 	pd.setMessage("文件打开中，请稍候...");
//							pd.setCancelable(false);
//							pd.show();
//					        
//						 Worker worker=new Worker(1);
//						HttpDocDown HttpDocDown=new HttpDocDown(WebViewWnd.this,url);
//						worker.doWork(HttpDocDown);
					}else if(url.indexOf("desk.html")>0){//						 
				//////////findViewById(R.id.navigation).setVisibility(View.VISIBLE);
					}
					 
					 if(url.indexOf("login.html")>0){
						 new UpdateHtmlTask(instance).execute();
					 }
					if(url.indexOf("main.html")>0){
						new UpdateHtmlTask(instance).execute();
					}
				}

				@Override
				public void onLoadResource(WebView view, String url) {
					super.onLoadResource(view, url);
				}

				@Override
				public void onReceivedError(WebView view, int errorCode,
						String description, String failingUrl) {
					urlpara="";
					if(failingUrl.contains("?")&&!failingUrl.startsWith("http://")){
					String[] temp = failingUrl.split("\\?");
					urlpara = "?"+temp[1];
					view.loadUrl(temp[0]);					 
					}else{
					super.onReceivedError(view, errorCode, description, failingUrl);
					Toast.makeText(WebViewWnd.this, "网络连接出错！", Toast.LENGTH_LONG).show();
					}
				}
				@Override
				public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
					handler.proceed();
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
//                   Uri uri = Uri.parse(url);
//                   Intent intent = new Intent(Intent.ACTION_VIEW,uri);
//                   startActivity(intent);
					if(!Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)){  
						Toast t=Toast.makeText(WebViewWnd.this, "需要SD卡。", Toast.LENGTH_LONG);  
						t.setGravity(Gravity.CENTER, 0, 0);  
						t.show();  
						return;  
					}
					Uri uri = Uri.parse(url);
                    Intent intent = new Intent(Intent.ACTION_VIEW,uri);
                    String fileName=Uri.decode(intent.getDataString());
					Worker worker=new Worker(1);
					HttpDocDown HttpDocDown=new HttpDocDown(WebViewWnd.this,url,fileName);
					worker.doWork(HttpDocDown);
                   
				}
			}});
	}
	
	protected void onNewIntent(Intent intent) {
		   super.onNewIntent(intent);
		   final String url = intent.getStringExtra("URL");//消息推送明细地址
		   String ChatOrNotice = intent.getStringExtra("ChatOrNotice");//推送or连天
//		   print2(url+",,,"+ChatOrNotice);
		   if("0".equals(ChatOrNotice)){
			if (url!=null&&!"".equals(url))
			{
				if("0".equals(getString(R.string.IsopenZlsj))){
					//loadurl(webView,"file:///android_asset/wap"+url);
					webView.loadUrl("javascript:sys_goURL('file:///android_asset/wap"+url+"')");
				}else{
					//loadurl(webView,"file:///data/data/"+packageName+"/files/wap_html"+url); 
					webView.loadUrl("javascript:sys_goURL('file:///data/data/"+packageName+"/files/wap_html"+url+"')");
				}
			}else{
				intent.setClass(WebViewWnd.this, WndSplash.class);
				startActivity(intent);
			   }
		   }else if("1".equals(ChatOrNotice)){
			   activityResultFlag=false;
			   webView2.setVisibility(View.INVISIBLE);
			   webView.setVisibility(View.VISIBLE);
			   if (url!=null&&!"".equals(url))
			   {
				   if("0".equals(getString(R.string.IsopenZlsj))){
						//loadurl(webView,"file:///android_asset/wap"+url);
						webView.loadUrl("javascript:sys_goURL('file:///android_asset/wap"+url+"')");
					}else{
						//loadurl(webView,"file:///data/data/"+packageName+"/files/wap_html"+url); 
						webView.loadUrl("javascript:sys_goURL('file:///data/data/"+packageName+"/files/wap_html"+url+"')");
					}
				   //webView.loadUrl("javascript:sys_goURL('"+url.split("\\?")[0]+"',"+url.split("\\?")[1]+")");
			   }else{
//				   intent.setClass(WebViewWnd.this, WndSplash.class);
//				   startActivity(intent);
//				   this.finish();
			   }
		   }else if("2".equals(ChatOrNotice)){
			   if (url!=null&&!"".equals(url))
			   {
				   WebViewWnd.this.runOnUiThread(new  Runnable(){
	    				public void run() { 
	    					WebViewWnd.this.webView.loadUrl("javascript:outChatMsg("+url+")");
	    				}
	    			});
			   }
		   }
	}
	private long firstTime=System.currentTimeMillis();
//	@Override
//	public boolean onKeyDown(int keyCode, KeyEvent event) {
////		if ((keyCode == KeyEvent.KEYCODE_BACK) && webView.canGoBack()) {
////			//webView.goBack();
////			exit();
////			//handler.sendEmptyMessage(0);
////			return true;
////		}else 
//		if(keyCode == KeyEvent.KEYCODE_BACK){
//			if(webView.getVisibility()==0){
//				String url=webView.getUrl();
//				if(url.endsWith(".png")||url.endsWith(".jpg")||url.endsWith(".JPEG")||url.endsWith(".jpeg")||url.endsWith(".PNG")||url.endsWith(".JPG")){
//					if(webView.canGoBack()){
//						if(popupWindow!=null){
//							popupWindow.dismiss();  
//						}
//						webView.goBack();
//						return true;
//					}
//				}
//				long secondTime = System.currentTimeMillis(); 
//				if (secondTime - firstTime > 1000) {//如果两次按键时间间隔大于800毫秒，则不退出 
//					//Toast.makeText(WebViewWnd.this, "再按一次返回键退出程序", Toast.LENGTH_SHORT).show(); 
//					Toast toast = Toast.makeText(WebViewWnd.this, "再按一次返回键退出程序", Toast.LENGTH_SHORT);
//					//toast.setGravity(Gravity.CENTER, 0, 0);
//					toast.show();
//					firstTime = secondTime;//更新firstTime 
//					return true; 
//				} else { 
//					//System.exit(0);//否则退出程序 
//					exit();
//					return true; 
//				}
//			}else{
//				return super.onKeyDown(keyCode, event);
//			}
//        } 
//		return super.onKeyDown(keyCode, event);
//	}
	
	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
 
		if(keyCode == KeyEvent.KEYCODE_BACK){
			
            WebBackForwardList mWebBackForwardList = webView.copyBackForwardList();
			
			if(webView.getVisibility()==0){
				String url=webView.getUrl()==null?"":webView.getUrl();
				if(url.endsWith(".png")||url.endsWith(".jpg")||url.endsWith(".JPEG")||url.endsWith(".jpeg")||url.endsWith(".PNG")||url.endsWith(".JPG")){
					if(webView.canGoBack()){
						if(popupWindow!=null){
							popupWindow.dismiss();  
						}
						webView.goBack();
						return true;
					}
				}
				boolean flag = ((url+"").toLowerCase()).contains("wap_html/main.html");
				boolean flag2 = (url+"").contains("chat.html")||(url+"").contains("groupChat.html");
				if(flag2 && webView.canGoBack()){
					if(popupWindow!=null){
						popupWindow.dismiss();  
					}
					stopSpeaking();
					webView.loadUrl("javascript:close_mui();");
					return true;
				}else if(!flag && webView.canGoBack()){
					if(popupWindow!=null){
						popupWindow.dismiss();  
					}
					stopSpeaking();
					webView.goBack();
					return true;
				}
//				else if (mWebBackForwardList.getCurrentIndex() > 0) {
//	                //获取历史列表
//	                String historyUrl = mWebBackForwardList.getItemAtIndex(mWebBackForwardList.getCurrentIndex() - 1).getUrl();
//	               
//	                webView.loadUrl(historyUrl);
//	                return true;
//	            }
				long secondTime = System.currentTimeMillis(); 
				if (secondTime - firstTime > 1000) {//如果两次按键时间间隔大于800毫秒，则不退出 
					//Toast.makeText(WebViewWnd.this, "再按一次返回键退出程序", Toast.LENGTH_SHORT).show(); 
					Toast toast = Toast.makeText(WebViewWnd.this, "再按一次返回键退出程序", Toast.LENGTH_SHORT);
					//toast.setGravity(Gravity.CENTER, 0, 0);
					toast.show();
					firstTime = secondTime;//更新firstTime 
					return true; 
				} else { 
					//System.exit(0);//否则退出程序 
					exit();
					return true; 
				}
			}else{
				return super.onKeyDown(keyCode, event);
			}
        } 
		return super.onKeyDown(keyCode, event);
	}

	public void exit() {
		if(pd!=null){	
		pd.cancel();
		pd.dismiss();
		}
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		final boolean openPushFlag=settings.getBoolean("openPushFlag", true);
		final boolean openCacheClear=settings.getBoolean("openCacheClear", false);
		
//		File file = CacheManager.getCacheFileBaseDir();
		File file = null;
		if (file != null && file.exists() && file.isDirectory()) {
			for (File item : file.listFiles()) {
				item.delete();
			}
			file.delete();
		}
		//APN 退出时设置********
//		Intent intent=new Intent();
//		intent.setClass(WebViewWnd.this, ApnActivity.class);
//		startActivityForResult(intent, 0);
		//APN 退出时设置********
		App.isChatPage=false;
		App.ChatwithYh="";

		if(!openPushFlag){
			WebViewWnd.this.stopIMService();
		}
		if(openCacheClear){
			new OnClearCache().ClearCache();
		}
		savePwdForLock("");
		webView.loadUrl("javascript:isChatPage=false;");
		unigo.utility.Log.write(1, "WebViewWnd", "退出成功",getUsername());
		WebViewWnd.this.finish();
		
		/*//退出时不提示
		 * AlertDialog.Builder builder = new AlertDialog.Builder(this);
		builder.setMessage("您确定要退出"+getString(R.string.app_name)+"吗?")
				.setCancelable(true)
				.setPositiveButton("确定", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int id) {
						
						File file = CacheManager.getCacheFileBaseDir();
						if (file != null && file.exists() && file.isDirectory()) {
							for (File item : file.listFiles()) {
								item.delete();
							}
							file.delete();
						}
						
						//APN 退出时设置********
//						Intent intent=new Intent();
//						intent.setClass(WebViewWnd.this, ApnActivity.class);
//						startActivityForResult(intent, 0);
						//APN 退出时设置********
						App.isChatPage=false;
						App.ChatwithYh="";

						if(!openPushFlag){
							WebViewWnd.this.stopIMService();
						}
						if(openCacheClear){
							new OnClearCache().ClearCache();
						}
						unigo.utility.Log.write(1, "WebViewWnd", "退出成功",getUsername());
						WebViewWnd.this.finish();
						dialog.cancel();
					}
				})
				.setNegativeButton("取消", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int id) {

						dialog.cancel();

					}
				});
		AlertDialog alert = builder.create();

		alert.show();
		*/
	}
	//重启
	public void ExitonRestart(){
		//System.exit(0);
		Intent i = getBaseContext().getPackageManager().getLaunchIntentForPackage(getBaseContext().getPackageName()); 
		i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP); 
		startActivity(i);
	}
	public void onHttpRequestGridView(HttpRequestGridView http)
	{
		
		if(((Boolean)http.getPrivateDate()).booleanValue())
		{
			return;
		}
	
	}
	 public void loadurl(final WebView view,final String url){
	           // handler.sendEmptyMessage(0);
				if(url.contains("?")){
					String[] temp = url.split("\\?");
					view.loadUrl(temp[0]);
					urlpara = temp[1];
				}else{
                    view.loadUrl(url);//载入网页
				}
	            //webView.loadUrl(url);
	           // webView.loadUrl("file:///android_asset/wap/login.html");
				//if(url.indexOf("login.html")>0){
	            // findViewById(R.id.navigation).setVisibility(View.GONE);
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
	public boolean onPrepareOptionsMenu(Menu menu){
		if(webView.getVisibility()==0){
			return true;
		}else{
			return false;
		}
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
			//WebViewWnd.this.deleteDatabase("webview.db");
			//WebViewWnd.this.deleteDatabase("webviewCache.db");
		   exit();
		   return true;
		   
		}else if(item.getItemId()==2){
			int[] hideItems = null;
			SharedPreferences settings2 = PreferenceManager.getDefaultSharedPreferences(this);// getSharedPreferences("settings",
			String khd_pushServerUrl=settings2.getString("httpMainIM", "");
			if(khd_pushServerUrl==null||"".equals(khd_pushServerUrl)||"undefined".equals(khd_pushServerUrl)){//设置界面选中开启消息推送时开启服务
				hideItems=new int[] { R.id.id_config_openpush };
			}
			Intent intent=new Intent();
			intent.setClass(WebViewWnd.this, WndConfig.class);
			intent.putExtra("hideItems", hideItems);
			startActivity(intent);
			//WebViewWnd.this.finish();
		}
		return super.onOptionsItemSelected(item);
	}
	class ViewOnClickListener implements OnClickListener
	{

		@Override
		public void onClick(View v){
		    //CookieManager cookieManager = CookieManager.getInstance();
		    //String loginCookie = cookieManager.getCookie("http://www.sdunicom.net/jcy");
           // Log.v("debug",loginCookie);
			removeUrlpara();
			clickflag=true;
			if (v.getId() == R.id.homeBtn || v.getId() == R.id.homeTextView)
			{
				 homeBtn.setBackgroundResource(R.drawable.home_l);
				 menu1Btn.setBackgroundResource(R.drawable.menu1);
				 menu2Btn.setBackgroundResource(R.drawable.menu2);
				 menu3Btn.setBackgroundResource(R.drawable.menu3);
				//WebViewWnd.this.asyncHttpRequest("","","");
				 webView.loadUrl("javascript:sys_goURL('./desk/main.js')");
				 //findViewById(R.id.navigation).setVisibility(View.GONE);
			}else if (v.getId() == R.id.menu1Btn || v.getId() == R.id.menu1TextView){
				 homeBtn.setBackgroundResource(R.drawable.home);
				 menu1Btn.setBackgroundResource(R.drawable.menu1_l);
				 menu2Btn.setBackgroundResource(R.drawable.menu2);
				 menu3Btn.setBackgroundResource(R.drawable.menu3);
				 webView.loadUrl("javascript:sys_goURL('"+getString(R.string.menu1_url)+"')");
			}else if (v.getId() == R.id.menu2Btn || v.getId() == R.id.menu2TextView){
				 homeBtn.setBackgroundResource(R.drawable.home);
				 menu1Btn.setBackgroundResource(R.drawable.menu1);
				 menu2Btn.setBackgroundResource(R.drawable.menu2_l);
				 menu3Btn.setBackgroundResource(R.drawable.menu3);
				 webView.loadUrl("javascript:sys_goURL('"+getString(R.string.menu2_url)+"')");
			}else if (v.getId() == R.id.menu3Btn || v.getId() == R.id.menu3TextView){
				 homeBtn.setBackgroundResource(R.drawable.home);
				 menu1Btn.setBackgroundResource(R.drawable.menu1);
				 menu2Btn.setBackgroundResource(R.drawable.menu2);
				 menu3Btn.setBackgroundResource(R.drawable.menu3_l);
				 webView.loadUrl("javascript:sys_goURL('"+getString(R.string.menu3_url)+"',{sjid:'14014'})");
			}else if (v.getId() == R.id.menu4Btn || v.getId() == R.id.menu4TextView){
				 clickflag=false;
				 if(checkBrowser("org.zywx.wbpalmstar.widgetone.uex11188130")){
					 //设置要启动应用程序的包名 与 要启动的Activity
					 ComponentName apk2Component = new ComponentName("org.zywx.wbpalmstar.widgetone.uex11188130", "org.zywx.wbpalmstar.engine.EBrowserActivity");
					 //创建意图与参数对象
					 Intent intent = new Intent();
					 Bundle bundle = new Bundle();
					 //传递给apk2的参数
					 bundle.putString("apk2username", getUsername2());
					 bundle.putString("apk2password", getPassword2());
					 bundle.putString("apk2flag", "sdunicom");
					 //将参数对象与apk2组件设置给意图
					 intent.putExtras(bundle);
					 intent.setComponent(apk2Component);
					 //启动意图,将会打开apk2
					 startActivity(intent);
				 }else{
					Toast t=Toast.makeText(WebViewWnd.this, "该应用不存在，请先安装！", Toast.LENGTH_LONG);  
					t.setGravity(Gravity.CENTER, 0, 0);  
					t.show();
				 }
			}else if (v.getId() == R.id.cancelBtn || v.getId() == R.id.cancelTextView)
			{
				 exit();
			}
		}
	}
	//展示弹出的返回框，在图片界面时
	private void showPopUp() {
		final LinearLayout layout = new LinearLayout(WebViewWnd.this);
		layout.setBackgroundDrawable(getResources().getDrawable(R.drawable.float_left_l));
		popupWindow = new PopupWindow(layout,65,65);
		//popupWindow.setFocusable(true);
		//popupWindow.setOutsideTouchable(false);
		popupWindow.setBackgroundDrawable(new BitmapDrawable());
		popupWindow.showAtLocation(webView, Gravity.BOTTOM|Gravity.LEFT, 30, 30);
		layout.setOnClickListener(new OnClickListener() {  
          @Override  
          public void onClick(View v) {  
              if(popupWindow.isShowing()) {  
                  // 隐藏窗口，如果设置了点击窗口外小时即不需要此方式隐藏  
            	  if(webView.canGoBack()){
            		  webView.goBack();
					}
            	  //webView.reload();
            	  popupWindow.dismiss();  
              } else {  
                  // 显示窗口  
            	  popupWindow.showAsDropDown(v);  
              }  
                
          }  
      });
	}
	//判断应用是否存在
	public boolean checkBrowser(String packageName) {
		if (packageName == null || "".equals(packageName))
			return false;
		try {
			ApplicationInfo info = getPackageManager().getApplicationInfo(
					packageName, PackageManager.GET_UNINSTALLED_PACKAGES);
			return true;
		} catch (NameNotFoundException e) {
			return false;
		}
	}
	  // 需要添加android.permission.GET_TASKS权限
	  protected static boolean isTopActivity(Activity activity) {
		  String packageName = "com.unicom.baseoa";
		  ActivityManager activityManager = (ActivityManager) activity.getSystemService(Context.ACTIVITY_SERVICE);
		  List<RunningTaskInfo> tasksInfo = activityManager.getRunningTasks(1);
		  if (tasksInfo.size() > 0) {
			  //System.out.println("---------------包名-----------"+ tasksInfo.get(0).topActivity.getPackageName());
			  // 应用程序位于堆栈的顶层
			  if (packageName.equals(tasksInfo.get(0).topActivity.getPackageName())) {
				  return true;
			  }
		  }
		  return false;
	  }

	public String getRecorderUrl(){
		String url = getString(R.string.url_playVoice);
		return url;
	}
	  //修改后的新的getHostUrl方法
		public String getHostUrl(){
			String url = Utility.iURL;
			if(url!=null&&!url.startsWith("https://")){
				url = "https://"+url;
			}
			return url;
		}
		
		
	public void Window_location(String url_para){
		urlpara="";
		urlpara = "?"+url_para;
	}
	//保存token
	public void saveToken(String cookieVlaue){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("sys_token_khd", cookieVlaue).commit();
		settings.edit().putString("logout", "null").commit();
		print("cookieVlaue="+cookieVlaue);
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
	public void savePushmsgPara(String pushmsgPara){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("pushmsgPara", pushmsgPara).commit();
	}
	public String getPushmsgPara(){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		String pushmsgPara  = settings.getString("pushmsgPara","");
		return pushmsgPara;
	}
	//设置apn连接
	public void setAPN(){
		Intent intent=new Intent();
		intent.setClass(this, ApnActivity.class);
		startActivityForResult(intent, 0);
	}
	//保存用户名
	public void saveUsername(String username,String yhxm){
		//将下面的工具栏解锁
		Message msg=new Message();
		msg.what=REQUEST_INITTOOL;
		handler.sendMessage(msg);
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("username", username).commit();
		settings.edit().putString("yhxm", yhxm).commit();
		unigo.utility.Log.write(1, "WebViewWnd", "登陆成功",username);
		//判断是否存在崩溃日志
		//checkCrashLog(username);
	}
	//保存部门id
	public void saveBmid(String bmid){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("bmid", bmid).commit();
	}
	//保存部门id
	public String getBmid(){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		String bmid  = settings.getString("bmid","");
		return bmid;
	}
	//保存yhid
	public void saveYhid(String yhid){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("yhid", yhid).commit();
	}
	//get yhid
	public String getYhid(){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		String yhid  = settings.getString("yhid","");
		return yhid;
	}
	//保存锁屏密码savePwdForLock
	public void saveLockscreenPwd(String pwd){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("lockscreenPwd", pwd).commit();
	}
	//get 锁屏密码
	public String getLockscreenPwd(){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		String pwd  = settings.getString("lockscreenPwd","");
		return pwd;
	}
	//保存登录密码，判断锁屏时使用
	public void savePwdForLock(String pwd){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("PwdForLock", pwd).commit();
	}
	//get 登录密码，判断锁屏时使用
	public String getPwdForLock(){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		String pwd  = settings.getString("PwdForLock","");
		return pwd;
	}
	//保存租户id savePwdForLock
		public void saveZhid(String zhid){
			SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
			settings.edit().putString("zhid", zhid).commit();
		}
		//get 获取id
		public String getZhid(){
			SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
			String pwd  = settings.getString("zhid","");
			return pwd;
		}
	public void mRecord(String zid,String mk_mc,String attachment,String callback) {
    	this.mk_mc = mk_mc;
    	this.zid=zid;
    	this.attachment=attachment;
    	this.wjcallback=callback;
    	
		Intent intent = new Intent();
		intent.setClass(WebViewWnd.this, MovieMainActivity.class);
		startActivityForResult(intent, 888);
	}
	//崩溃日志
	public void checkCrashLog(String username){
		final String path = Environment.getExternalStorageDirectory().toString();
		final String  sourcePath= path + "/Unlog/crasherror.log";
		if(new File(sourcePath).exists()){
			AlertDialog.Builder builder = new AlertDialog.Builder(this);
			builder.setTitle("存在需要上传的系统日志，请点击【确定】上传");
			builder.setCancelable(false);
			final String  sourcePathN= path + "/Unlog/sys_"+username+"_"+TimeUtil.getCurrentDateMis4()+".log";
			builder.setPositiveButton("确定", new DialogInterface.OnClickListener()
			{
				public void onClick(DialogInterface dialog, int id)
				{
					pd.setMessage("日志上传中，请稍后...");
					pd.setCancelable(false);
					pd.show();
					Handler handler = new Handler();
					handler.postDelayed(new Runnable()
					{
						public void run()
						{
							try {
								String sdState = Environment.getExternalStorageState();
								if (sdState.equals(Environment.MEDIA_MOUNTED)) {
									String url=WebViewWnd.instance.getHostUrl();
									url = url+"/khd/uploadlog.do?method=upload";
									File file1=new File(sourcePath);
									File file2=new File(sourcePathN);
									file1.renameTo(file2);
									String str=new OnUploadLog(WebViewWnd.this).uploadSubmit(url, null, sourcePathN);
									if(!"".equals(str)){
										//file2.delete();
									}
								}
							} catch (Exception e) {
								e.printStackTrace();
							}finally{
								pd.cancel();
								pd.dismiss();
							}
						}
					}, 500);
					dialog.dismiss();
				}
			});
			builder.setNegativeButton("取消", new DialogInterface.OnClickListener()
			{
				public void onClick(DialogInterface dialog, int id)
				{
					dialog.dismiss();
				}
			});
			AlertDialog alert = builder.create();
			alert.show();
		}
	}
	public String getUsername(){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		String username  = settings.getString("username","");
		//Log.e("WebViewWnd", "getUsername"+username);
		return username;
	}
	public String getYhxm(){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		String yhxm  = settings.getString("yhxm","");
		return yhxm;
	}
	//保存密码
	public void savePassword(String password){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("password", password).commit();
	}
	public String getPassword(){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		String password  = settings.getString("password","");
		return password;
	}
	//保存apk2的用户名
	public void saveUsername2(String username){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("apk2username", username).commit();
	}
	
	public String getUsername2(){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		String username  = settings.getString("apk2username","");
		return username;
	}
	//保存apk2的密码
	public void savePassword2(String password){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		settings.edit().putString("apk2password", password).commit();
	}
	public String getPassword2(){
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		String password  = settings.getString("apk2password","");
		return password;
	}
	public void showApk2btn(){
		findViewById(R.id.menu4Btn).setVisibility(View.VISIBLE);
		findViewById(R.id.menu4TextView).setVisibility(View.VISIBLE);
	}
	public void showNavigation(){
//////////findViewById(R.id.navigation).setVisibility(View.VISIBLE);
	}
	/** 
	* 获取版本号 
	* @return 当前应用的版本号 
	*/ 
	/*public String getVersion() { 
		String version="";
		try { 
			PackageManager manager = this.getPackageManager(); 
			PackageInfo info = manager.getPackageInfo(this.getPackageName(), 0); 
			version = info.versionName; 
		} catch (Exception e) { 
			e.printStackTrace(); 
		} 
		return version;
	}*/
	
	
	public String getVersion() throws Exception{
		String version = "";
		try {
			PackageManager manager = this.getPackageManager();
			PackageInfo info = manager.getPackageInfo(this.getPackageName(), 0);
			version = info.versionName;
		} catch (Exception e) {
			e.printStackTrace();
		}
		String v=settings.getString("curVersionCode", version);
		String lastversion = null;
		try {
			//注意:为了判断正在使用的就是最新的大版本,大版本只取本地的版本来显示
			String d2=version.substring(0,version.indexOf("("));
			//当服务端html 版本更新成功才保存服务端html版本,最后和大版本组装为一个用户可以看到的展示版本号
			String serverhtmlv=settings.getString("jackhtmlVersion", "0");
			//下面的指定不会为null
			lastversion=d2+"("+serverhtmlv+")";
		}catch (Exception e){
			//当程序异常,直接展示本地版本号
			return  v;
		}
		return lastversion;
	}
	
	
	public void loadHtml(final String url){
		this.runOnUiThread(new  Runnable(){  
	        @Override  
	        public void run() {
		  webView.loadUrl(url);
	        }
		});
	}
	public void saveUrlpara(String urlpara){
		map.put("urlpara", urlpara);
	}
	public String getUrlpara(){
		return (String)map.get("urlpara");
	}
	public void removeUrlpara(){
		map.clear();
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
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		SharedPreferences settings2 = PreferenceManager.getDefaultSharedPreferences(this);// getSharedPreferences("settings",
		boolean openPushFlag=settings.getBoolean("openPushFlag", true);
		String khd_pushServerUrl=settings2.getString("httpMainIM", "");
		if(khd_pushServerUrl!=null&&!"".equals(khd_pushServerUrl)&&!"undefined".equals(khd_pushServerUrl)&&openPushFlag){//设置界面选中开启消息推送时开启服务
			Intent i = new Intent(this, ImCoreService.class);
			startService(i);
		}
	 //NodeJsNoticeHelper.notice(this);
	}
	//关闭即时通信服务
		public void stopIMService(){
			//关闭定时器
			AlarmManager alarmMgr = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
			Intent intent = new Intent();
			intent.setAction("com.sdunisi.oa.service.IM_BASE_CORE_ACTION");
			intent.putExtra("bAlarm", true);
			int requestCode = 0;
			PendingIntent pendIntent = PendingIntent.getBroadcast(getApplicationContext(), requestCode, intent, PendingIntent.FLAG_CANCEL_CURRENT);
			alarmMgr.cancel(pendIntent);
			//关闭服务
			Intent i = new Intent(this, ImCoreService.class);
			stopService(i);
		}
		//取得消息
		private ImCoreService localService=null; 
		private SocketIOClient client=null;
		    private ServiceConnection mConnection = new ServiceConnection() {  
		        public void onServiceConnected(ComponentName className,IBinder localBinder) {  
		            localService = ((LocalBinder) localBinder).getService();  
		        }  
		        public void onServiceDisconnected(ComponentName arg0) {  
		            localService = null;  
		        }  
		    }; 
		    protected void onStart() {  
		        super.onStart();  
		        Intent intent = new Intent(this, ImCoreService.class);  
		        bindService(intent, mConnection, Context.BIND_AUTO_CREATE);  
		      //方式二:在Manifest.xml中设置IntentFilter  
		        //       测试发现方式二效果更好些  
//		        mAppBroadcastReceiver=new AppBroadcastReceiver();  
//		        IntentFilter intentFilter=new IntentFilter();  
//		        this.registerReceiver(mAppBroadcastReceiver,intentFilter);  
		    }  
		    protected void onStop() {  
		        super.onStop();  
		        unbindService(mConnection);  
		        stopPlayRecording();
		    }   
		    public void getChatMsg(String str,String params,String id,final String callback){
		    	client=localService.getClient();
		    	if(client!=null){
		    		if(!"".equals(id)){
		    			id=id.replace("yh","").replace("bm", "");
		    		}
		    		App.ChatwithYh=id;
		    		String strj="["+params+"]";
		    		JSONArray arr;
					try {
						arr = new JSONArray(strj);
						client.emit(str, arr,new Acknowledge(){
							@Override
							public void acknowledge(final JSONArray arguments) {
								WebViewWnd.this.runOnUiThread(new  Runnable(){
				    				public void run() { 
				    					WebViewWnd.this.webView.loadUrl("javascript:"+callback+"("+arguments+")");
				    				}
				    			});
							}
						});
					} catch (JSONException e) {
						e.printStackTrace();
					}
		    	}
		    }
		    boolean runflag=true;
		    public void inChatMsg(String str,String params){
		    	client=localService.getClient();
		    	if(client!=null){
		    		runflag=true;
		    		String strj="["+params+"]";
		    		JSONArray arr;
					try {
						arr = new JSONArray(strj);
						//20秒超时
						/*Handler handler = new Handler();
						handler.postDelayed(new Runnable()
						{
							@Override
							public void run() {
								runflag=false;
								Toast.makeText(WebViewWnd.this, "发送失败！", Toast.LENGTH_LONG).show();
								WebViewWnd.this.webView.loadUrl("javascript:sendFaile()");
							}
						}, 20000);*/
						client.emit(str, arr,new Acknowledge(){
							@Override
							public void acknowledge(final JSONArray arguments) {
								WebViewWnd.this.runOnUiThread(new  Runnable(){
				    				public void run() {
				    					if(runflag){
				    						Toast.makeText(WebViewWnd.this, "发送成功！", Toast.LENGTH_SHORT).show();
				    					}
				    				}
				    			});
							}
						});
					} catch (JSONException e) {
						e.printStackTrace();
					}
		    	}else{
		    		WebViewWnd.this.runOnUiThread(new  Runnable(){
	    				public void run() { 
	    					runflag=false;
	    					Toast.makeText(WebViewWnd.this, "发送失败！", Toast.LENGTH_LONG).show();
	    					WebViewWnd.this.webView.loadUrl("javascript:sendFaile()");
	    				}
	    			});
		    	}
		    }
	/**
	 * 解析im端的数据
	 */
    public void parseIMdate(final JSONArray arguments){
    	WebViewWnd.this.runOnUiThread(new  Runnable(){
			public void run() { 
				WebViewWnd.this.webView.loadUrl("javascript:sys_parseIMdate("+arguments+")");
			}
		});
    }
    /**
	 * 解析im端的数据,通知栏显示
	 */
    public void parseIMdate_notice(String arguments){
			Worker worker = new Worker(0);
				try {
					worker.doWork(new NodeJsNoticeHelper(this, new JSONObject(arguments)));
				} catch (JSONException e) {
					e.printStackTrace();
				}
    }
	/**
	 * 保存用户名 密码
	 */
	public void saveImNameAndPsd(String zzid,String username,String password,String device,String imei,String imsi,String khd_pushServerUrl)
	{
		SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(WebViewWnd.this);
		SharedPreferences.Editor edit = settings.edit();
		edit.putString(App.IM_USERNAME_KEY, username);
		edit.putString(App.IM_PASSWORD_KEY, password);
		edit.putString(App.IM_ZZID_KEY, zzid);
		edit.putString(App.IM_DEVICE_KEY, device);
		edit.putString(App.IM_IMEI_KEY, imei);
		edit.putString(App.IM_IMSI_KEY, imsi);
		edit.putBoolean(App.ACCOUNT_LOGIN_KEY, true);//保存用户状态
		edit.putString("httpMainIM", khd_pushServerUrl);
		edit.commit();
	}
	public String getMei(){
		return ImeiHelper.getImei(this);
	}
	public String getMsi(){
		return ImeiHelper.getImsi(this);
	}
	public String getImsiLogin(){
		return ImeiHelper.getImsiLogin(this);
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
	
	public String ReadFileContent(String url){
		if(!clickflag){
			if(url.indexOf("main.js")>0){
				Message msg=new Message();
				msg.what=REQUEST_HOME;
				handler.sendMessage(msg);
				
			}else if(getString(R.string.menu1_url).indexOf(url)>0){
				Message msg=new Message();
				msg.what=REQUEST_MENU1;
				handler.sendMessage(msg);
			}else if(getString(R.string.menu2_url).indexOf(url)>0){
				Message msg=new Message();
				msg.what=REQUEST_MENU2;
				handler.sendMessage(msg);
			}else if(getString(R.string.menu3_url).indexOf(url)>0){
				Message msg=new Message();
				msg.what=REQUEST_MENU3;
				handler.sendMessage(msg);
			}
		}
		clickflag=false;
		
//		else{
//			
//		}

/*		if(url.indexOf("main.js")>0){
			handler.post(hideMenu);
		}else{
			handler.post(showMenu);
		}*/
		if(url.indexOf("main.js")>0&&!menushow){
			handler.post(showMenu);
			menushow = true;
		}
		String fileName = "wap"+url;
        //String fileName = "yan.txt"; //文件名字
        String res=""; 
        try{ 
           InputStream in = getResources().getAssets().open(fileName);
           // \Test\assets\yan.txt这里有这样的文件存在
           int length = in.available();         
	        byte [] buffer = new byte[length];        
	        in.read(buffer); 
	        res = EncodingUtils.getString(buffer, "UTF-8");   
	        in.close();
        }catch(Exception e){ 
              e.printStackTrace();         
        }
         if(pd.isShowing()){//隐藏对话框
				Message msg=new Message();
				msg.what=1;
				handler.sendMessage(msg);
         }
            return res;
	}
	private WebView WebView1;
	public void openSomeWin(final String url,final String num){
		
		this.runOnUiThread(new  Runnable(){  
        @Override  
        public void run() {
        	//设置界面的布局
            relativeLayout = (RelativeLayout) findViewById(R.id.topRelativeLayout);
            LayoutParams params = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.FILL_PARENT,
            		ViewGroup.LayoutParams.WRAP_CONTENT);
          //再添加一个子布局
            WebView1 = new WebView(WebViewWnd.this);
            WebView1.setId(11);
            WebView1.setScrollbarFadingEnabled(true);
            WebView1.setLayoutParams(params);
            //将这个布局添加到主布局中
            //RelativeLayout.LayoutParams lp11 = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            //lp11.addRule(RelativeLayout.BELOW ,WebView1.getId());
            relativeLayout.addView(WebView1);
            setWebView(WebView1);
            loadurl(WebView1,"file:///android_asset/wap"+url);
         }
        });
	}
	public void closeSomeWin(){
		this.runOnUiThread(new  Runnable(){  
	        @Override  
	        public void run() {
	        	relativeLayout.removeView(WebView1);
	        }
		});
	}
	
	
	public void openNewWin(final String url){
		
		this.runOnUiThread(new  Runnable(){  
        @Override  
        public void run() {
        	/*增量升级路径*/
        	if("0".equals(getString(R.string.IsopenZlsj))){
        		WebViewWnd.this.webView2.loadUrl("javascript:sys_goURL('file:///android_asset/wap"+url+"')");
        	}else{
        		WebViewWnd.this.webView2.loadUrl("javascript:sys_goURL('file:///data/data/"+packageName+"/files/wap_html"+url+"')");
        	}
        	webView.setVisibility(View.INVISIBLE);
 	//////////findViewById(R.id.navigation).setVisibility(View.INVISIBLE);
		   webView2.setVisibility(View.VISIBLE);
         }
        } );
/*		handler.post(new  Runnable(){  
        @Override  
        public void run() {
 		   webView.setVisibility(View.INVISIBLE);
 		   findViewById(R.id.navigation).setVisibility(View.INVISIBLE);
		   webView2.setVisibility(View.VISIBLE);
         }
        }  
       ); */ 
	}
	public void closeWin(final String data){//返回WebViewWnd
      //  Intent intent = new Intent(); 
       // intent.putExtra("userData",data);   
       // setResult(Activity.RESULT_OK,intent);
        //finish();
		
		this.runOnUiThread(new  Runnable(){
			 public void run() { 
				 //webView2.loadUrl("javascript:userSelectDestor();");
				 webView.loadUrl("javascript:eval("+data+")");
				 webView2.setVisibility(View.INVISIBLE);
				 webView.setVisibility(View.VISIBLE);
			//////////findViewById(R.id.navigation).setVisibility(View.VISIBLE);
			 }
		});
/*        handler.post(new  Runnable(){
			 public void run() { 
				 webView2.setVisibility(View.INVISIBLE);
				 webView.setVisibility(View.VISIBLE);
				 findViewById(R.id.navigation).setVisibility(View.VISIBLE);
			 }
		}); */
		
	}
	//退出人员选择
	public void exitWin(){
		//this.webView2.loadUrl("javascript:userSelectDestor();");
        handler.post(new  Runnable(){
			 public void run() { 
				 webView2.setVisibility(View.INVISIBLE);
				 webView.setVisibility(View.VISIBLE);
				 //////////findViewById(R.id.navigation).setVisibility(View.VISIBLE);
			 }
		}); 
	}
	//退出锁屏界面
	public void exitLockWin(final int para){
        handler.post(new  Runnable(){
			 public void run() {
				 webView2.setVisibility(View.INVISIBLE);
				 webView.setVisibility(View.VISIBLE);
				 //System.out.println(webView.getUrl());
				if(webView.getUrl().indexOf("login.html")>-1){
					 webView.loadUrl("javascript:$('#password').val('"+getPwdForLock()+"');denglu();");
				}
				 if(para==2){
					 /*增量升级路径*/
		        	if("0".equals(getString(R.string.IsopenZlsj))){
		        		webView.loadUrl("javascript:sys_goURL('file:///android_asset/wap/login.html')");
		        	}else{
		        		webView.loadUrl("javascript:sys_goURL('file:///data/data/"+packageName+"/files/wap_html/login.html')");
		        	}
				 }
			 }
		}); 
	}
	 protected void onActivityResult(int requestCode, int resultCode, Intent data) {   
	        super.onActivityResult(requestCode, resultCode, data);   
	        if(requestCode==1 && resultCode==Activity.RESULT_OK){   
	            if(data != null) {   
	            	this.webView.loadUrl("javascript:eval("+data.getStringExtra("userData")+")");
	            }   
	        } else if(requestCode == PHOTOGRAPH_MARK){
            	//拍照后获取照片信息      wangzl
				//if (data != null) {
					if(Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)){
						File file = new File(tempFilePath, tempFileName);
						if(file.exists()){
							//上传图片
			                String url=this.getHostUrl();
			                url = url+"/jstx/default.do?method=uploadMobile";
							String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
							SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
						    url =   url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
						    Map paraMap = new HashMap();
						    paraMap.put("callback", "showPhotograph");
						    paraMap.put("jstx", "jstx");
						    paraMap.put("type", "img");
						    paraMap.put("fileName", tempFileName);
						    paraMap.put("filePath", tempFilePath + "/" + tempFileName);
			                uploadFile(url,paraMap,file);
						}
					}else{
						Toast t=Toast.makeText(WebViewWnd.this,"无SD卡或SD卡不正常，["+Environment.getExternalStorageState()+"]", Toast.LENGTH_LONG);  
            			t.show();
					}
				//}
            } else if(requestCode == SELECTIMG_MARK){
            	//在相册中选择图片后上传      wangzl
            	// 从相册返回的数据
                if (data != null) {
                    // 得到图片的全路径
                    Uri uri = data.getData();
                    if(null != uri){
                    	Bitmap image = null;
                    	try {
							image = MediaStore.Images.Media.getBitmap(this.getContentResolver(),uri);
							if(null != image){
								String[] proj = { MediaStore.Images.Media.DATA };
								Cursor cursor = this.getContentResolver().query(uri,proj,null,null,null);
								if(cursor.moveToFirst()){
									int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
									String path = cursor.getString(column_index);
									WebViewWnd.this.webView.loadUrl("javascript:uploadStroePic('"+path+"')");
								}
								cursor.close();
							}
						} catch (Exception e) {
							e.printStackTrace();
						}
                    }
                }
            }
	        activityResultFlag=false;
	        //通讯录处理
	        if (requestCode == REQUEST_CONTACT)
			{
				if (resultCode == RESULT_OK)
				{
					if (data == null)
					{
						return;
					}
					Uri result = data.getData();
					contactId = result.getLastPathSegment();
					final String info = getPhoneContacts(contactId);
					webView.loadUrl("javascript:back_txl('" + info + "')");  
				}
			}
            if (100 == requestCode) { // 系统相机返回处理 	            
	            //处理photo
	            
	            String pictureDir = "";
	            FileOutputStream fos = null;
	            BufferedOutputStream bos = null;
	            ByteArrayOutputStream baos = null;
	            File file = null;
	            try {	
                    BitmapFactory.Options options = new BitmapFactory.Options();
                    //开始读入图片，此时把options.inJustDecodeBounds 设回true了   
                    options.inJustDecodeBounds = true;   
                    Bitmap bitmap = BitmapFactory.decodeFile(picFilePath,options);//此时返回bm为空
                    int w = options.outWidth;   
                    int h = options.outHeight;
	                float hh = 800f;//这里设置高度为800f   
	                float ww = 600f;//这里设置宽度为600f   
	                //缩放比。由于是固定比例缩放，只用高或者宽其中一个数据进行计算即可,横屏、竖屏拍摄宽高比不同   
	                int be = 1;//be=1表示不缩放   
	                if (w > h && w > ww) {//如果宽度大的话根据宽度固定大小缩放   
	                    be = (int) (options.outWidth / ww);   
	                } else if (w < h && h > hh) {//如果高度高的话根据宽度固定大小缩放   
	                    be = (int) (options.outHeight / hh);   
	                }   
	                if (be <= 0)   
	                    be = 1; 
	                options.inSampleSize = be;//设置缩放比例   
                    options.inJustDecodeBounds = false;
                    //picFilePath="a"+picFilePath;
                    bitmap = BitmapFactory.decodeFile(picFilePath,options);

                    baos = new ByteArrayOutputStream();
	            	bitmap.compress(Bitmap.CompressFormat.JPEG, 100, baos);//
	            	
	                file = new File(picFilePath);
	                fos = new FileOutputStream(file);
	                bos = new BufferedOutputStream(fos);
	                byte[] byteArray = baos.toByteArray();
	                bos.write(byteArray);
	                pictureDir = file.getPath();
	                String url=this.getHostUrl();
	                url = url+"/UploadServlet";                
	                uploadSubmit(url,null,file);	 
	            } catch (Exception e) {
	                e.printStackTrace();
	            } finally {
	                if (baos != null) {
	                    try {
	                        baos.close();
	                    } catch (Exception e) {
	                        e.printStackTrace();
	                    }
	                }
	                if (bos != null) {
	                    try {
	                        bos.close();
	                    } catch (Exception e) {
	                        e.printStackTrace();
	                    }
	                }
	                if (fos != null) {
	                    try {
	                        fos.close();
	                    } catch (Exception e) {
	                        e.printStackTrace();
	                    }
	                }
	                if (bitmap != null && !bitmap.isRecycled()) {
	    	        	bitmap.recycle();
	    	        	bitmap = null;
	    	         }
	               // file.delete();
	            }
	            //处理结束
	            if (bitmap != null && !bitmap.isRecycled()) {
    	        	bitmap.recycle();
    	        	bitmap = null;
    	         }
	        }else if (200 == requestCode) { // 表单拍照上传
	        	Map paraMap = new HashMap();
	        	paraMap.put("zid", zid==null?"":zid);	
	        	paraMap.put("mk_mc", mk_mc==null?"":mk_mc);     	
	            
	            //处理photo
	            FileOutputStream fos = null;
	            BufferedOutputStream bos = null;
	            ByteArrayOutputStream baos = null;
	            File file = null;
	            try {	            	
	                   BitmapFactory.Options options = new BitmapFactory.Options();
	                    //开始读入图片，此时把options.inJustDecodeBounds 设回true了   
	                    options.inJustDecodeBounds = true;   
	                    Bitmap bitmap = BitmapFactory.decodeFile(picFilePath,options);//此时返回bm为空
	                    int w = options.outWidth;   
	                    int h = options.outHeight;
		                float hh = 800f;//这里设置高度为800f   
		                float ww = 600f;//这里设置宽度为600f 
		                //缩放比。由于是固定比例缩放，只用高或者宽其中一个数据进行计算即可,横屏、竖屏拍摄宽高比不同   
		                int be = 1;//be=1表示不缩放   
		                if (w > h && w > ww) {//如果宽度大的话根据宽度固定大小缩放   
		                    be = (int) (options.outWidth / ww);   
		                } else if (w < h && h > hh) {//如果高度高的话根据宽度固定大小缩放   
		                    be = (int) (options.outHeight / hh);   
		                }   
		                if (be <= 0)   
		                    be = 1; 
		                options.inSampleSize = be;//设置缩放比例   
	                    options.inJustDecodeBounds = false;
	                    bitmap = BitmapFactory.decodeFile(picFilePath,options);

	                    baos = new ByteArrayOutputStream();
		            	bitmap.compress(Bitmap.CompressFormat.JPEG, 100, baos);//

	                file = new File(picFilePath);
	                fos = new FileOutputStream(file);
	                bos = new BufferedOutputStream(fos);
	                byte[] byteArray = baos.toByteArray();
	                bos.write(byteArray);
	                String url=this.getHostUrl();
	                url = url+"/form/uploadFile.do?method=uploadFile";
					String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
					SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
				    url =   url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
	                
	                uploadFile(url,paraMap,file);	 
	            } catch (Exception e) {
	                e.printStackTrace();
	            } finally {
	                if (baos != null) {
	                    try {
	                        baos.close();
	                    } catch (Exception e) {
	                        e.printStackTrace();
	                    }
	                }
	                if (bos != null) {
	                    try {
	                        bos.close();
	                    } catch (Exception e) {
	                        e.printStackTrace();
	                    }
	                }
	                if (fos != null) {
	                    try {
	                        fos.close();
	                    } catch (Exception e) {
	                        e.printStackTrace();
	                    }
	                }
	                if (bitmap != null && !bitmap.isRecycled()) {
	    	        	bitmap.recycle();
	    	        	bitmap = null;
	    	         }
	               // file.delete();
	            }
	            //处理结束
	            if (bitmap != null && !bitmap.isRecycled()) {
    	        	bitmap.recycle();
    	        	bitmap = null;
    	         }
	        }
            
            if (requestCode == PHOTO_REQUEST_GALLERY) {
                // 从相册返回的数据
                if (data != null) {
                    // 得到图片的全路径
                    Uri uri = data.getData();
                    //解决小米手机选取照片时报路径错误的问题
                    String[] proj = { MediaStore.Images.Media.DATA };
                    Cursor actualimagecursor = managedQuery(uri,proj,null,null,null);
                    if(actualimagecursor!=null){
                    	int actual_image_column_index = actualimagecursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
                    	actualimagecursor.moveToFirst();
                    	picFilePath = actualimagecursor.getString(actual_image_column_index);
                    }else{
                    	if (uri != null) {
                    		String tmpPath = uri.getPath();
                    		if (tmpPath != null && (tmpPath.endsWith(".jpg") || tmpPath.endsWith(".png") || tmpPath.endsWith(".gif"))) {
                    			picFilePath = tmpPath;
                    		}
                    	}
                    }
                    //File file = new File(picFilePath);
                    if(outputXY==0){
                    	doPhotoNOcrop();
                    }else{
                    	crop(uri);
                    }
                }
     
            } else if (requestCode == PHOTO_REQUEST_CAREMA) {
                // 从相机返回的数据
            	if (resultCode == RESULT_OK) {
	                if (Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)) {
	                	if(outputXY==0){
	                    	doPhotoNOcrop();
	                    }else{
	                    	crop(Uri.fromFile(new File(picFilePath)));
	                    }
	                } else {
	                    Toast.makeText(this, "未找到存储卡，无法存储照片！", 0).show();
	                }
            	}
            } else if (requestCode == PHOTO_REQUEST_CUT) {
                // 从剪切图片返回的数据
                if (data != null) {
                    //Bitmap bitmap = data.getParcelableExtra("data");
                	Bitmap bitmap = decodeUriAsBitmap(Uri.fromFile(new File(FilePath)));//decode bitmap
                    doPhoto(bitmap);
                }
                try {
                    // 将临时文件删除
                	new File(picFilePath).delete();
                } catch (Exception e) {
                    e.printStackTrace();
                }
     
            }else if (requestCode == SELECT_FILE) {
            	if (data != null && uploadFileUtil!=null){
            		uploadFileUtil.doSelectFile(data);
            	}
            }else if (requestCode == 999) {
            	String scanResult="0";
            	if(data != null){
            		Bundle bundle = data.getExtras();
            		scanResult = bundle.getString("result");             
            		final String result=scanResult;
            		//根据条形码去数据库检索响应信息
            		WebViewWnd.this.runOnUiThread(new  Runnable(){
            			public void run() { 
            				WebViewWnd.this.webView.loadUrl("javascript:sys_yhqdjg('"+result+"')");
            			}
            		});
            	}
            }else if (requestCode == 777) {
            	String scanResult="1";
            	if(data != null){
            		Bundle bundle = data.getExtras();
            		scanResult = bundle.getString("result");    
            		bdyyResult = scanResult;
            		//根据条形码去数据库检索响应信息
            		WebViewWnd.this.runOnUiThread(new  Runnable(){
            			public void run() { 
            				WebViewWnd.this.webView.loadUrl("javascript:getBdyyResult()");
            			}
            		});
            	}
            }else if (requestCode == 888) {
            	String scanResult="0";
            	if(data != null){
            		Bundle bundle = data.getExtras();
            		scanResult = bundle.getString("result");             
            		final String result=scanResult;
            		AlertDialog.Builder builder = new AlertDialog.Builder(this);
            		builder.setMessage("是否上传该视频？")
    				.setCancelable(true)
    				.setPositiveButton("是", new DialogInterface.OnClickListener() {
    					public void onClick(DialogInterface dialog, int id) {
    						doVideoRecord(result);
    						dialog.cancel();
    					}
    				})
    				.setNegativeButton("否", new DialogInterface.OnClickListener() {
    					public void onClick(DialogInterface dialog, int id) {
    						new File(result).delete();
    						dialog.cancel();
    					}
    				});
            		AlertDialog alert = builder.create();
            		alert.show();
            	}
            }

	  }   
	 private Bitmap decodeUriAsBitmap(Uri uri){
		 Bitmap bitmap = null;
		 try {
		  bitmap = BitmapFactory.decodeStream(getContentResolver().openInputStream(uri));
		 } catch (Exception e) {
		  e.printStackTrace();
		  return null;
		 }
		 return bitmap;
		}
	 //
	 public void saomiao(){
		 Intent intent = new Intent();
		 intent.setClass(WebViewWnd.this, com.zxing.activity.CaptureActivity.class);
		 startActivityForResult(intent, 999);
	 }
	 /*
	     * 从相册获取
	     */
	    public void gallery(String zid,String mk_mc,String wjlj,String attachment,int outputXY) {
	    	this.mk_mc = mk_mc;
	    	this.zid=zid;
	    	this.wjlj=wjlj;
	    	this.attachment=attachment;
	    	this.outputXY=outputXY;
	    	
	        // 激活系统图库，选择一张图片
	        Intent intent = new Intent(Intent.ACTION_PICK);
	        intent.setType("image/*");
	        // 开启一个带有返回值的Activity，请求码为PHOTO_REQUEST_GALLERY
	        startActivityForResult(intent, PHOTO_REQUEST_GALLERY);
	    }
	 
	    /*
	     * 从相机获取
	     */
	    public void camera(String zid,String mk_mc,String wjlj,String attachment,int outputXY) {
	    	this.mk_mc = mk_mc;
	    	this.zid=zid;
	    	this.wjlj=wjlj;
	    	this.attachment=attachment;
	    	this.outputXY=outputXY;
	    	
	        // 激活相机
	        Intent intent = new Intent("android.media.action.IMAGE_CAPTURE");
	        // 判断存储卡是否可以用，可用进行存储
	        if (Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)) {
	        	String saveDir = Environment.getExternalStorageDirectory()+ "/imoa/";
	            File dir = new File(saveDir);
	            if (!dir.exists()) {
	                dir.mkdir();
	            }           
					picFilePath = saveDir + System.currentTimeMillis()+".jpg";           
				    intent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(new File(picFilePath))); 
	            
	        }
	        // 开启一个带有返回值的Activity，请求码为PHOTO_REQUEST_CAREMA
	        startActivityForResult(intent, PHOTO_REQUEST_CAREMA);
	    }
	    /*
	     * 剪切图片
	     */
	    String FilePath="";
	    private void crop(Uri uri) {
	    	String saveDir = Environment.getExternalStorageDirectory()+ "/imoa/";
            File dir = new File(saveDir);
            if (!dir.exists()) {
                dir.mkdir();
            }           
			FilePath = saveDir + this.getYhid()+".jpg";
	        // 裁剪图片意图
	        Intent intent = new Intent("com.android.camera.action.CROP");
	        intent.setDataAndType(uri, "image/*");
	        intent.putExtra("crop", "true");
	        // 裁剪框的比例，1：1
	        intent.putExtra("aspectX", 1);
	        intent.putExtra("aspectY", 1);
	        // 裁剪后输出图片的尺寸大小
	        intent.putExtra("outputX", outputXY);
	        intent.putExtra("outputY", outputXY);
//	        intent.putExtra("output", Uri.fromFile(new File(FilePath)));  // 专入目标文件 
//	        intent.putExtra("outputFormat", "JPEG");// 图片格式
//	        intent.putExtra("noFaceDetection", true);// 取消人脸识别
//	        intent.putExtra("return-data", true);
	        
	        intent.putExtra("scale", true);
	        intent.putExtra("return-data", false);
	        intent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(new File(FilePath)));
	        intent.putExtra("outputFormat", Bitmap.CompressFormat.JPEG.toString());
	        intent.putExtra("noFaceDetection", true); // no face detection
	        // 开启一个带有返回值的Activity，请求码为PHOTO_REQUEST_CUT
	        startActivityForResult(intent, PHOTO_REQUEST_CUT);
	    }
	    /*
	     * 处理图片上传,头像上传
	     */
	    private void doPhoto(Bitmap bitmap){
	    	
	    	Map paraMap = new HashMap();
        	paraMap.put("zid", zid==null?"":zid);	
        	paraMap.put("mk_mc", mk_mc==null?"":mk_mc);     	
        	paraMap.put("wjlj", wjlj==null?"":wjlj); 
        	paraMap.put("attachment", attachment==null?"":attachment); 
            //处理photo
            FileOutputStream fos = null;
            BufferedOutputStream bos = null;
            ByteArrayOutputStream baos = null;
            File file = null;
            try {	            	
                baos = new ByteArrayOutputStream();
            	//bitmap.compress(Bitmap.CompressFormat.JPEG, 100, baos);//
                fos = new FileOutputStream(FilePath);
                if (bitmap != null && !bitmap.isRecycled()) {
                	bitmap.compress(Bitmap.CompressFormat.JPEG, 100, baos);//
                }
                bos = new BufferedOutputStream(fos);
                byte[] byteArray = baos.toByteArray();
                bos.write(byteArray);
                String url=this.getHostUrl();
            	url = url+"/khd/uploadFile.do?method=uploadFile";
				String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
				SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
			    url =   url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
                
                uploadFile(url,paraMap,new File(FilePath));	 
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                if (baos != null) {
                    try {
                        baos.close();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                if (bos != null) {
                    try {
                        bos.close();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                if (fos != null) {
                    try {
                        fos.close();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                if (bitmap != null && !bitmap.isRecycled()) {
    	        	bitmap.recycle();
    	        	bitmap = null;
    	         }
               // file.delete();
            }
            //处理结束
            if (bitmap != null && !bitmap.isRecycled()) {
	        	bitmap.recycle();
	        	bitmap = null;
	         }
	    }
	    /*
	     * 处理图片上传,图片附件上传
	     */
	    private void doPhotoNOcrop(){
	    	Map paraMap = new HashMap();
        	paraMap.put("zid", zid==null?"":zid);	
        	paraMap.put("mk_mc", mk_mc==null?"":mk_mc);     	
        	paraMap.put("wjlj", wjlj==null?"":wjlj); 
        	paraMap.put("attachment", attachment==null?"":attachment); 
	    	//处理photo
            FileOutputStream fos = null;
            BufferedOutputStream bos = null;
            ByteArrayOutputStream baos = null;
            File file = null;
            try {	            	
                   BitmapFactory.Options options = new BitmapFactory.Options();
                    //开始读入图片，此时把options.inJustDecodeBounds 设回true了   
                    options.inJustDecodeBounds = true;   
                    Bitmap bitmap = BitmapFactory.decodeFile(picFilePath,options);//此时返回bm为空
                    int w = options.outWidth;   
                    int h = options.outHeight;
	                float hh = 800f;//这里设置高度为800f   
	                float ww = 600f;//这里设置宽度为600f 
	                //缩放比。由于是固定比例缩放，只用高或者宽其中一个数据进行计算即可,横屏、竖屏拍摄宽高比不同   
	                int be = 1;//be=1表示不缩放   
	                if (w > h && w > ww) {//如果宽度大的话根据宽度固定大小缩放   
	                    be = (int) (options.outWidth / ww);   
	                } else if (w < h && h > hh) {//如果高度高的话根据宽度固定大小缩放   
	                    be = (int) (options.outHeight / hh);   
	                }   
	                if (be <= 0)   
	                    be = 1; 
	                options.inSampleSize = be;//设置缩放比例   
                    options.inJustDecodeBounds = false;
                    bitmap = BitmapFactory.decodeFile(picFilePath,options);
                    baos = new ByteArrayOutputStream();
                    if (bitmap != null && !bitmap.isRecycled()) {
                    	bitmap.compress(Bitmap.CompressFormat.JPEG, 100, baos);//
                    }

                file = new File(picFilePath);
                fos = new FileOutputStream(file);
                bos = new BufferedOutputStream(fos);
                byte[] byteArray = baos.toByteArray();
                bos.write(byteArray);
                String url=this.getHostUrl();
            	url = url+"/khd/uploadFile.do?method=uploadFile";
				String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
				SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
			    url =   url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
                
                uploadFile(url,paraMap,file);	 
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                if (baos != null) {
                    try {
                        baos.close();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                if (bos != null) {
                    try {
                        bos.close();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                if (fos != null) {
                    try {
                        fos.close();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                if (bitmap != null && !bitmap.isRecycled()) {
    	        	bitmap.recycle();
    	        	bitmap = null;
    	         }
               //file.delete();
            }
            //处理结束
            if (bitmap != null && !bitmap.isRecycled()) {
	        	bitmap.recycle();
	        	bitmap = null;
	         }
	    }
	    /*
	     * 处理图片上传,图片附件上传
	     */
	    private void doVideoRecord(String videoPath){
	    	Map paraMap = new HashMap();
        	paraMap.put("zid", zid==null?"":zid);	
        	paraMap.put("mk_mc", mk_mc==null?"":mk_mc);     	
        	paraMap.put("attachment", attachment==null?"":attachment); 
        	paraMap.put("callback", wjcallback==null?"":wjcallback); 
	    	//处理photo
            File file = null;
            try {	   
            	file = new File(videoPath);
                String url=this.getHostUrl();
            	url = url+"/khd/uploadFile.do?method=uploadFile";
				String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
				SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
			    url =   url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
                uploadFile(url,paraMap,file);	 
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
               //file.delete();
            }
	    }
	 	//doc 直接打开
		public void startWordFileIntent(String param){
			Intent intent = getFileIntent(param);
			
			String type = getMIMEType(param);
			if("application/pdf".equals(type)){
				Uri uri = Uri.parse(param);
				Intent intent2 = new Intent("android.intent.action.VIEW", uri);
				intent2.setClassName(WebViewWnd.this,"com.artifex.mupdfdemo.MuPDFActivity");
				intent2.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
				startActivity(intent2);
				return ;
			}
			
			
			try{
				if(downMP3flag){
					this.startActivity(intent);
				}else{
					startPlayServer();
				}
				downMP3flag=true;
			}catch(Exception e){
				String path = android.os.Environment.getExternalStorageDirectory().getPath();
				Toast.makeText(WebViewWnd.this, "附件已下载完毕，由于您未安装相应程序，请手动在"+path+"/Undownload目录中操作", Toast.LENGTH_LONG).show();  
			}
		}
		public Intent getFileIntent(String fileName) {
			Uri uri = Uri.fromFile(new File(fileName));
			String type = getMIMEType(fileName);
			Intent intent = new Intent();
			// Intent intent = new Intent("android.intent.action.VIEW");
			intent.setAction("android.intent.action.VIEW");
			intent.addCategory("android.intent.category.DEFAULT");
			intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			intent.setDataAndType(uri, type);
			return intent;
		}

		private String getMIMEType(String fName) {
			String type = "";

			String end = fName.substring(fName.lastIndexOf(".") + 1, fName.length()).toLowerCase();

			/* 依扩展名的类型决定MimeType */
			if (end.equals("pdf")) {
				type = "application/pdf";//
			} else if (end.equals("m4a") || end.equals("mp3") || end.equals("mid")
					|| end.equals("xmf") || end.equals("ogg") || end.equals("wav")) {
				type = "audio/*";
			} else if (end.equals("3gp") || end.equals("mp4")||end.equals("swf")||end.equals("flv")) {
				type = "video/*";
			} else if (end.equals("jpg") || end.equals("gif") || end.equals("png")
					|| end.equals("jpeg") || end.equals("bmp")) {
				type = "image/*";
			} else if (end.contains("doc")) {
				type = "application/msword";
			} else if (end.contains("xls")) {
				type = "application/vnd.ms-excel";
			} else if (end.contains("ppt")) {
				type = "application/vnd.ms-powerpoint";
			} else {
				type = "*/*";
			}
			return type;
		}

		@Override
		public void onHttpDocDown(HttpDocDown http) {
			if(http.getSucceed()==true){
				startWordFileIntent(http.getCardURL());
				pd.cancel();
				pd.dismiss();
			}else{
				Toast t=Toast.makeText(WebViewWnd.this, http.getReason(), Toast.LENGTH_LONG);  
				t.setGravity(Gravity.CENTER, 0, 0);  
				t.show();
				pd.cancel();
				pd.dismiss();
				return; 
			}
		}
		//原始拍照上传函数，调用sevliat
		public void setpic(){
			Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE); 
            String saveDir = Environment.getExternalStorageDirectory()+ "/imoa/";
            File dir = new File(saveDir);
            if (!dir.exists()) {
                dir.mkdir();
            }           
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
			      String dateStr = sdf.format(new Date());
            picFilePath = saveDir + dateStr+"-"+System.currentTimeMillis()+".png";           
			intent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(new File(picFilePath))); 
			
			startActivityForResult(intent, 100);
		}
		//拍照函数
		public void takePictures(String zid,String mk_mc){
			this.mk_mc = mk_mc;
			this.takePictures(zid);
		}
		//拍照函数
		public void takePictures(String zid){
			Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE); 
			this.zid = zid;
			
            String saveDir = Environment.getExternalStorageDirectory()+ "/imoa/";
            File dir = new File(saveDir);
            if (!dir.exists()) {
                dir.mkdir();
            }           
				SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
			    String dateStr = sdf.format(new Date());
			    picFilePath = saveDir + dateStr+"-"+System.currentTimeMillis()+".jpg";           
			    intent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(new File(picFilePath))); 
				startActivityForResult(intent, 200);
		}
		
		 //当录音按钮被click时调用此方法，开始或停止录音
	    public void onRecord(boolean start) {
	        if (start) {
	            startRecording();
	        } else {
	            stopRecording();
	        }
	    }

	    //当播放按钮被click时调用此方法，开始或停止播放
	    public void onPlay(boolean start,String filename) {
	    	mFileName=filename;
	        if (start) {
	            startPlaying();
	        } else {
	            stopPlaying();
	        }
	    }
	  //开始录音
	    private void startRecording() {
	        String saveDir = Environment.getExternalStorageDirectory()+ "/imoa/";
            File dir = new File(saveDir);
            if (!dir.exists()) {
                dir.mkdir();
            }           
			SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd-HHmmssSSS");
		    String dateStr = sdf.format(new Date());
		    //mFileName = dateStr+"-"+System.currentTimeMillis()+".amr"; 
		    mFileName = dateStr; 
		    mFilePath = saveDir + mFileName+".mp3"; 
		    WebViewWnd.this.runOnUiThread(new  Runnable(){
				public void run() { 
					loadurl(webView,"javascript:returnFileName('"+mFileName+"')");
				}
			});
		  //amr格式录制
	        /*mRecorder = new MediaRecorder();
	        //设置音源为Micphone
	        mRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
	        //设置封装格式
	        mRecorder.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP);
	        mRecorder.setOutputFile(mFilePath);
	        //设置编码格式
	        mRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);
	        try {
	            mRecorder.prepare();
	        } catch (IOException e) {
	        	e.printStackTrace();
	            Log.e(TAG, "prepare() failed");
	        }
	        mRecorder.start();
	       */
		    //MP3录制
	        recorder2 = new MP3Recorder(mFilePath,8000);
		    try{
		    	recorder2.startRecording();
		    }catch(Exception e){
		    	e.printStackTrace();
	            //Log.e(TAG, "prepare() failed");
		    }
	    }
	    //结束录音
	    private void stopRecording() {
//	        mRecorder.stop();
//	        mRecorder.release();
//	        mRecorder = null;
	    	try {
				recorder2.stopRecording();
			} catch (Exception e) {
				e.printStackTrace();
			}
	    }
	    //開始播放
	    private void startPlaying() {
	        mPlayer = new MediaPlayer();
	        String saveDir = Environment.getExternalStorageDirectory()+ "/imoa/";
            File dir = new File(saveDir);
            if (!dir.exists()) {
                dir.mkdir();
            }           
		    mFilePath = saveDir + mFileName+".mp3";
	        try {
	        	//设置要播放的文件
	            mPlayer.setDataSource(mFilePath);
	            mPlayer.prepare();
	            //播放之
	            mPlayer.start();
	        } catch (IOException e) {
	        	e.printStackTrace();
	            //Log.e(TAG, "prepare() failed");
	        }
	    }

	    //停止播放
	    private void stopPlaying() {
	    	if(mPlayer!=null){
	    		mPlayer.release();
	    		mPlayer = null;
	    	}
	    }
	    //播放服务器上的录音，先下载
	    private boolean downMP3flag=true;
	    public void onPlayServer(String filepath) {
	    	//进度条
//			pd.setMessage("文件打开中，请稍后...");
//			pd.setCancelable(false);
//			pd.show();
			mFileName=new File(filepath).getName();
			final String url2=filepath;
			downMP3flag=false;
			Uri uri = Uri.parse(url2);
            Intent intent = new Intent(Intent.ACTION_VIEW,uri);
            String fileName=Uri.decode(intent.getDataString());
			 Worker worker=new Worker(1);
			 HttpDocDown HttpDocDown=new HttpDocDown(WebViewWnd.this,url2,fileName);
			 worker.doWork(HttpDocDown);
	    }
	    //播放服务器上的录音
	    private void startPlayServer() {
	        mPlayer = new MediaPlayer();
	        String saveDir = Environment.getExternalStorageDirectory()+ "/Undownload/";
		    mFilePath = saveDir + mFileName;
	        try {
	        	//设置要播放的文件
	            mPlayer.setDataSource(mFilePath);
	            mPlayer.prepare();
	            //播放之
	            mPlayer.start();
	        } catch (IOException e) {
	        	e.printStackTrace();
	            //Log.e(TAG, "prepare() failed");
	        }
	    }
	    //上传录音
	    public void uploadSoundFile(String filename){
            String saveDir = Environment.getExternalStorageDirectory()+ "/imoa/";
            picFilePath = saveDir + filename+".mp3";           
            File file = new File(picFilePath);
            String url=this.getHostUrl();
            url = url+"/UploadServletSound";                
            try {
				uploadSubmit(url,null,file);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	  //附件选择
  		public void getAllFiles(String folderpath,final String callback){
  			String fileP=Environment.getExternalStorageDirectory().toString();
  			if(!"".equals(folderpath)){
  				fileP=folderpath;
  			}
  			File root=new File(fileP);
  			File files[] = root.listFiles(getFileExtensionFilter("."));  
  			JSONArray jsonarr=new JSONArray();
  			try {
  		        if(files != null){
  		        	if(files.length>0){
  		        		Arrays.sort(files);  //进行排序
  		        		for (int i=0;i<files.length;i++){  
  		        			File f = files[i];
  	        				JSONObject map=new JSONObject();
  	        				map.put("name", f.getName());
  	        				if(f.isDirectory()){  
  	        					map.put("flag","1");//文件夹
  	        				}else{  
  	        					// 获取文件的最后修改日期
  	        					long modTime = f.lastModified();
  	        					SimpleDateFormat dateFormat =new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
  	        					map.put("flag","0");//文件
  	        					map.put("size",getFileSize(f.length()));
  	        					map.put("time", dateFormat.format(new Date(modTime)));
  	        				}  
  	        				jsonarr.put(i, map);
  		        		}
  		        		jsonarr.put(files.length, fileP);
  		        		final JSONArray json=jsonarr;
  		        		unigo.utility.Log.write(1, "getAllFiles", json.toString(), "");
  		        		WebViewWnd.this.runOnUiThread(new  Runnable(){
  		        			public void run() { 
  		        				WebViewWnd.this.webView.loadUrl("javascript:"+callback+"("+json+")");
  		        			}
  		        		});
  		        	}else{
  		        		Toast.makeText(WebViewWnd.this, "该文件夹为空", Toast.LENGTH_SHORT).show();
  		        	}
  		        }
  	        } catch (Exception e) {
  	        	e.printStackTrace();
  	        }
  		}
  		//过滤文件名
  		public static FilenameFilter getFileExtensionFilter(String extension) {
  	        final String _extension = extension;
  	        return new FilenameFilter() {
  	            public boolean accept(File file, String name) {
  	                boolean ret = name.startsWith(_extension); 
  	                return !ret;
  	            }
  	        };
  	    }
  		//文件大小
  		private String getFileSize(double filesize){
  			String sizeStr="0",sizedw="B";
  			if(filesize/1024>1){
  				if(filesize/1024>1024){
  					filesize=filesize/1024/1024;
  					sizedw="M";
  				}else{
  					filesize=filesize/1024;
  					sizedw="K";
  				}
  			}
  			if(String.valueOf(filesize).indexOf(".")>-1){
  				sizeStr=String.format("%.2f", filesize);
  			}else{
  				sizeStr=filesize+"";
  			}
  			return sizeStr+sizedw;
  		}
  		//上传选择的附件
  	    public void KhduploadFile(String filepath,String zid,String mk_mc,String wjlj,String attachment){
  	    	Map paraMap = new HashMap();
          	paraMap.put("zid", zid==null?"":zid);	
          	paraMap.put("mk_mc", mk_mc==null?"":mk_mc);     	
          	paraMap.put("wjlj", wjlj==null?"":wjlj); 
          	paraMap.put("attachment", attachment==null?"":attachment);
  	    	File file = new File(filepath);
              String url=this.getHostUrl();
              url = url+"/khd/uploadFile.do?method=uploadFile";
  			String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
  			SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
  		    url =   url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");            
              uploadFile(url,paraMap,file);
  		}
		//上傳文件
		public  void uploadFile(String url, Map<String, String> param,
	             File file)  {
			if(file==null){
				return ;
			}
			long size = file.length();
			String size_limit = "50";
			 
			float limit = 0;
			try{
				limit = Float.valueOf(size_limit);
				limit = limit*1024*1024;//转换成单位B
			}catch(Exception e){
				
			}
			if(size>limit){
				Toast.makeText(WebViewWnd.instance, "文件不能超过"+size_limit+"MB", Toast.LENGTH_LONG).show();
				return ;
			}
			//Log.e("WebViewWnd1", "开始上传文件 parm="+param+" file="+file+" url="+url);
			final HttpMultipartPostData post = new HttpMultipartPostData(this, file,url,param);
			post.execute();
			//45秒超时
			Handler handler = new Handler();
			handler.postDelayed(new Runnable()
			{
			  @Override
			  public void run() {
			      if ( post.getStatus() == AsyncTask.Status.RUNNING || post.getStatus() == AsyncTask.Status.PENDING){
			    	  post.hideProgressDialog();
			    	  post.cancel(true);
			    	  Toast.makeText(WebViewWnd.this, "请求超时，请检查网络.", Toast.LENGTH_SHORT).show();
			      }
			  }
			}, 120000);
		}
		
		public  void uploadSubmit(String url, Map<String, String> param,
	             File file) throws Exception {
			final HttpMultipartPost post = new HttpMultipartPost(this, file,url,param);
			post.execute();
			//45秒超时
			Handler handler = new Handler();
			handler.postDelayed(new Runnable()
			{
			  @Override
			  public void run() {
			      if ( post.getStatus() == AsyncTask.Status.RUNNING || post.getStatus() == AsyncTask.Status.PENDING){
			    	  post.hideProgressDialog();
			    	  post.cancel(true);
			    	  Toast.makeText(WebViewWnd.this, "请求超时，请检查网络.", Toast.LENGTH_SHORT).show();
			      }
			  }
			}, 120000);
	   }
		//定时定位定时器
		private PendingIntent pendIntentDW=null;
		private void setLocationAlarm(){
			AlarmManager alarmMgr = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
			Intent intent = new Intent();
			intent.setAction("com.sdunisi.oa.service.IM_Location_CORE_ACTION");
			int requestCode = 1;
			pendIntentDW = PendingIntent.getBroadcast(getApplicationContext(), requestCode, intent, PendingIntent.FLAG_CANCEL_CURRENT);
			// 按时间段发送广播
			long triggerAtTime = SystemClock.elapsedRealtime();
			alarmMgr.setRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAtTime, 300000L, pendIntentDW);
		}
		//定位
		private void setLocationOption(){
			LocationClientOption option = new LocationClientOption();
		   option.setOpenGps(true);                                //  打开G
		   option.setCoorType("bd09ll");                           //  设置坐标类型
		   option.setServiceName("com.baidu.location.service_v2.9");
		   option.setPoiExtraInfo(true);   
		   option.setAddrType("all");
		   option.setScanSpan(100);
		   option.setPriority(LocationClientOption.GpsFirst);      //  设置网络优先
		   option.setPoiNumber(10);
		   option.disableCache(true);
			mLocClient.setLocOption(option);
		}
		@Override
		public void onReceiveLocation(BDLocation location) {                                                                                    
		    StringBuilder sb = new StringBuilder();                                                                                    
		    sb.append("时间: ");                                                                                    
		    sb.append(location.getTime());                                                                                    
		    sb.append("\n纬度: ");                                                                                    
		    sb.append(location.getLatitude());                                                                                    
		    sb.append("\n经度: ");                                                                                    
		    sb.append(location.getLongitude());                                                                                    
		    sb.append("\n误差径: ");                                                                                    
		    sb.append(location.getRadius());                                                                                    
		    if (location.getLocType() == BDLocation.TypeGpsLocation) {                                                                                    
		        sb.append("\n速度: ");                                                                                    
		        sb.append(location.getSpeed());                                                                                    
		        sb.append("\n卫星: ");                                                                                    
		        sb.append(location.getSatelliteNumber());                                                                                    
		    } else if (location.getLocType() == BDLocation.TypeNetWorkLocation) {                                                                                    
		        sb.append("\n地址: ");                                                                                    
		        sb.append(location.getAddrStr());                                                                                    
		    }   
		    //此处调用wap页面中的js方法将获取的位置信息传回  
		    loadurl(webView,"javascript:loadlocation('"+location.getLatitude()+"','"+location.getLongitude()+"','"+location.getTime()+"','"+location.getAddrStr()+"')");
		    if (mLocClient != null && mLocClient.isStarted()){
		    	mLocClient.stop();
		    }
		    /*
		     * 定时定位信息保存
		    try {
		    	HttpClient httpClient = new DefaultHttpClient();
		    	String url="/ssdwxx/default.do?method=saveSsdwsj&jd="+location.getLongitude()+"&wd="+location.getLatitude()+"&wzxx="+location.getAddrStr()+"";
		    	String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
				SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
		    	final String settingUrl = settings.getString("httpMain", ""); 
				url = settingUrl  + url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
		    	HttpGet httpPost = new HttpGet(url);
		    	HttpResponse response = httpClient.execute(httpPost);
		    	if(response.getStatusLine().getStatusCode()==200){ 
		    		//String result = EntityUtils.toString(response.getEntity()); 
		    	} 
			} catch (ClientProtocolException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			*/
		}    	
		public void setlocation(){
			setLocationOption();
			if (mLocClient != null ){
				mLocClient.start();
				if( mLocClient.isStarted()){
					mLocClient.requestLocation();	
//					 mLocClient.stop();
				}
			}
		}
		
		public void paizhao(){
			setlocation();
			setpic();
		}
		
		@Override
		public void onReceivePoi(BDLocation arg0) {
			// TODO Auto-generated method stub
			
		}
		public void showM(){
			//handler.post(showMenu);
		}
		public void hideM(){
			//handler.post(hideMenu);
		}
		//初始的请求方法
//		public void asyncHttpRequest(String url,String data,final String sys_timeStamp,final String callback){
//			String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
//			SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
//			AsyncHttpClient client = new AsyncHttpClient(true,80,443);
//			
//			//保存服务端返回的cookie
//	    	final PersistentCookieStore myCookieStore = new PersistentCookieStore(this);
//	    	client.setCookieStore(myCookieStore);
//	    	final String settingUrl = settings.getString("httpMain", ""); 
//			url = settingUrl  + url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
//			print("urllllllllllllllllll="+url);
//			//url = url+"&"+java.net.URLEncoder.encode(data);;
//			//url = url.replaceAll(" ", "%20");
//			System.out.println("11111111111="+url);
//			String[] dataArr = data.split("&");
//			//String[] dataArr ={};
//			RequestParams params = new RequestParams();
//			Map map=new HashMap();
//			for(String param:dataArr){
//				String key ="";
//				String value = "";
//				int index=param.indexOf("=");
//				if(index==-1){
//					continue;
//				}
//				key=param.substring(0, index);
//				value=param.substring(index+1, param.length());
//				Set set=new HashSet();
//				 if(map.containsKey(key)){
//					 set=(Set)map.get(key);
//				 }
//				set.add(value);
//				map.put(key,set);
//				params.put(key, set);
//			}
//            //url=java.net.URLEncoder.encode(url);
//			client.post(url, params, new AsyncHttpResponseHandler() {
//			    @Override
//			    public void onSuccess(String response) {
//			    	print("GGGGG::::::"+response);
//			    	if(!"".equals(callback)){
//			    		System.out.println("3333333333333333");
//			    		String str="";
//			    		if(response.indexOf("login.do?method=exit")>-1){
//			    			str="{\"error\":\""+response+"\"}";
//			    		}else{
//			    			str=response;
//			    		}
//			    		final String response2=str;
//			    		print("WebViewWnd.this.webView.isShown()="+WebViewWnd.this.webView.isShown());
//			    		print("WebViewWnd.this.webView2.isShown()="+WebViewWnd.this.webView2.isShown());
////			    		if(WebViewWnd.this.webView.isShown()){
//			    			WebViewWnd.this.runOnUiThread(new  Runnable(){
//			    				public void run() { 
//			    					WebViewWnd.this.webView.loadUrl("javascript:"+callback+"("+response2+",'"+sys_timeStamp+"')");
//			    				}
//			    			});
//			    			
////			    		}
//			    		if(WebViewWnd.this.webView2.isShown()){
//			    			WebViewWnd.this.runOnUiThread(new  Runnable(){
//			    				public void run() { 
//			    					WebViewWnd.this.webView2.loadUrl("javascript:"+callback+"("+response2+",'"+sys_timeStamp+"')");
//			    				}
//			    				});
//			    			
//			    		}
//			    	}
//			    	
//			    }
//				@Override
//				public void onFailure(Throwable error, String content)
//				{
//					System.out.println("444444444444444444444");
//					System.out.println("error1:"+error+" content1:"+content);
//					if(WebViewWnd.this.webView.isShown()){
//						WebViewWnd.this.runOnUiThread(new  Runnable(){
//		    				public void run() { 
//		    					WebViewWnd.this.webView.loadUrl("javascript:exceptionCallBack()");
//		    				}
//		    				});
//					}
//					if(WebViewWnd.this.webView2.isShown()){
//						WebViewWnd.this.runOnUiThread(new  Runnable(){
//		    				public void run() { 
//		    					WebViewWnd.this.webView2.loadUrl("javascript:exceptionCallBack()");
//		    				}
//		    				});
//					}
//					
//					//Log.e(TAG , "onFailure error : " + error.toString() + "content : " + content);
//				}
//			});
//
//		}
		
		
		//添加ssl
		public void asyncHttpRequest(String url,String data,final String sys_timeStamp,final String callback){
			String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
			SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
			AsyncHttpClient client = new AsyncHttpClient(true,80,443);
			
			//保存服务端返回的cookie
	    	final PersistentCookieStore myCookieStore = new PersistentCookieStore(this);
	    	client.setCookieStore(myCookieStore);
	    	final String settingUrl = settings.getString("httpMain", ""); 
			url = settingUrl  + url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");

			//url = url+"&"+java.net.URLEncoder.encode(data);;
			//url = url.replaceAll(" ", "%20");
			//System.out.println("11111111111="+url);
			String[] dataArr = data.split("&");
			//String[] dataArr ={};
			RequestParams params = new RequestParams();
			Map map=new HashMap();
			for(String param:dataArr){
				String key ="";
				String value = "";
				int index=param.indexOf("=");
				if(index==-1){
					continue;
				}
				key=param.substring(0, index);
				value=param.substring(index+1, param.length());
				Set set=new HashSet();
				 if(map.containsKey(key)){
					 set=(Set)map.get(key);
				 }
				set.add(value);
				map.put(key,set);
				params.put(key, set);
			}
            //url=java.net.URLEncoder.encode(url);
			final String finalUrl = url;
			HttpUtilsSafe2.getInstance().post(this, url, data, new HttpUtilsSafe2.OnRequestCallBack() {
			
			@Override
			public void onSuccess(String response) {
				// TODO Auto-generated method stub
				//Log.e("LoginTask", "https请求成功 response="+response);
		    	if(!"".equals(callback)){
		    		//System.out.println("3333333333333333");
		    		String str="";
		    		if(response.indexOf("login.do?method=exit")>-1){
		    			str="{\"error\":\""+response+"\"}";
		    		}else{
		    			str=response;
		    		}
		    		final String response2=str;
					Log.e("HTTP url: ", finalUrl +"\n"+"result: "+response2);
		    		print("WebViewWnd.this.webView.isShown()="+WebViewWnd.this.webView.isShown());
		    		print("WebViewWnd.this.webView2.isShown()="+WebViewWnd.this.webView2.isShown());
//		    		if(WebViewWnd.this.webView.isShown()){
		    			WebViewWnd.this.runOnUiThread(new  Runnable(){
		    				public void run() { 
		    					WebViewWnd.this.webView.loadUrl("javascript:"+callback+"("+response2+",'"+sys_timeStamp+"')");
		    				}
		    			});
		    			
//		    		}
		    		if(WebViewWnd.this.webView2.isShown()){
		    			WebViewWnd.this.runOnUiThread(new  Runnable(){
		    				public void run() { 
		    					WebViewWnd.this.webView2.loadUrl("javascript:"+callback+"("+response2+",'"+sys_timeStamp+"')");
		    				}
		    				});
		    			
		    		}
		    	}
				
			}
			
			@Override
			public void onFail(Exception e) {
				// TODO Auto-generated method stub
				//Log.e("LoginTask", "https请求错误");
				//System.out.println("444444444444444444444");
				//System.out.println("error:"+e+" content:"+e);
				if(WebViewWnd.this.webView.isShown()){
					WebViewWnd.this.runOnUiThread(new  Runnable(){
	    				public void run() { 
	    					WebViewWnd.this.webView.loadUrl("javascript:exceptionCallBack()");
	    				}
	    				});
				}
				if(WebViewWnd.this.webView2.isShown()){
					WebViewWnd.this.runOnUiThread(new  Runnable(){
	    				public void run() { 
	    					WebViewWnd.this.webView2.loadUrl("javascript:exceptionCallBack()");
	    				}
	    				});
				}
				
				//Log.e(TAG , "onFailure error : " + error.toString() + "content : " + content);
			}
		});

		}
		   //拿到自己的证书
		   X509Certificate getX509Certificate(Context context) throws IOException, CertificateException {
		       InputStream in = context.getAssets().open("domain");
		       CertificateFactory instance = CertificateFactory.getInstance("X.509");
		       X509Certificate certificate = (X509Certificate) instance.generateCertificate(in);
		       return certificate;
		   }
		//修改后的请求方法
//		public void asyncHttpRequest(String url,String data,final String sys_timeStamp,final String callback){
//			String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
//			SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
//			AsyncHttpClient client = new AsyncHttpClient(true,80,443);
//			//保存服务端返回的cookie
//	    	final PersistentCookieStore myCookieStore = new PersistentCookieStore(this);
//	    	client.setCookieStore(myCookieStore);
//	    	final String settingUrl = settings.getString("httpMain", ""); 
//			url = settingUrl  + url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
//			print("urllllllllllllllllll="+url);
//			//url = url+"&"+java.net.URLEncoder.encode(data);;
//			//url = url.replaceAll(" ", "%20");
//			System.out.println("11111111111="+url);
//			String[] dataArr = data.split("&");
//			//String[] dataArr ={};
//			RequestParams params = new RequestParams();
//			Map map=new HashMap();
//			for(String param:dataArr){
//				String key ="";
//				String value = "";
//				int index=param.indexOf("=");
//				if(index==-1){
//					continue;
//				}
//				key=param.substring(0, index);
//				value=param.substring(index+1, param.length());
//				Set set=new HashSet();
//				 if(map.containsKey(key)){
//					 set=(Set)map.get(key);
//				 }
//				set.add(value);
//				map.put(key,set);
//				params.put(key, set);
//			}
//			HttpUtilsSafe2.getInstance().get(this, url, new HttpUtilsSafe2.OnRequestCallBack() {
//				
//				@Override
//				public void onSuccess(String response) {
//					// TODO Auto-generated method stub
//					Log.e("LoginTask", "https请求成功");
//			    	print("GGGGG::::::"+response);
//			    	if(!"".equals(callback)){
//			    		System.out.println("3333333333333333");
//			    		String str="";
//			    		if(response.indexOf("login.do?method=exit")>-1){
//			    			str="{\"error\":\""+response+"\"}";
//			    		}else{
//			    			str=response;
//			    		}
//			    		final String response2=str;
//			    		print("WebViewWnd.this.webView.isShown()="+WebViewWnd.this.webView.isShown());
//			    		print("WebViewWnd.this.webView2.isShown()="+WebViewWnd.this.webView2.isShown());
////			    		if(WebViewWnd.this.webView.isShown()){
//			    			WebViewWnd.this.runOnUiThread(new  Runnable(){
//			    				public void run() { 
//			    					WebViewWnd.this.webView.loadUrl("javascript:"+callback+"("+response2+",'"+sys_timeStamp+"')");
//			    				}
//			    			});
//			    			
////			    		}
//			    		if(WebViewWnd.this.webView2.isShown()){
//			    			WebViewWnd.this.runOnUiThread(new  Runnable(){
//			    				public void run() { 
//			    					WebViewWnd.this.webView2.loadUrl("javascript:"+callback+"("+response2+",'"+sys_timeStamp+"')");
//			    				}
//			    				});
//			    			
//			    		}
//			    	}
//					
//				}
//				
//				@Override
//				public void onFail(Exception e) {
//					// TODO Auto-generated method stub
//					Log.e("LoginTask", "https请求错误");
//					System.out.println("444444444444444444444");
//					System.out.println("error:"+e+" content:"+e);
//					if(WebViewWnd.this.webView.isShown()){
//						WebViewWnd.this.runOnUiThread(new  Runnable(){
//		    				public void run() { 
//		    					WebViewWnd.this.webView.loadUrl("javascript:exceptionCallBack()");
//		    				}
//		    				});
//					}
//					if(WebViewWnd.this.webView2.isShown()){
//						WebViewWnd.this.runOnUiThread(new  Runnable(){
//		    				public void run() { 
//		    					WebViewWnd.this.webView2.loadUrl("javascript:exceptionCallBack()");
//		    				}
//		    				});
//					}
//					
//					//Log.e(TAG , "onFailure error : " + error.toString() + "content : " + content);
//				}
//			});
//		}
		

		
		public WebView getWebView(){
			return this.webView;
		}
		
 
			private int clearCacheFolder(File dir, long numDays) {                    
				int deletedFiles = 0;                   
				if (dir!= null && dir.isDirectory()) {                           
					try {                                  
						for (File child:dir.listFiles()) {                        
							Log.i("info", "child=========="+child.getName());   
							unigo.utility.Log.write(1, "WebViewWnd", "清除缓存，缓存文件child==="+child.getName(),getUsername());
							if (child.isDirectory()) {                                        
								deletedFiles += clearCacheFolder(child, numDays);                                
							}                          
							if (child.lastModified() < numDays) {                               
								if (child.delete()) {                                                 
									deletedFiles++;                                     
								}                          
							}                      
						}                           
					} catch(Exception e) {                         
						e.printStackTrace();                  
					}               
				}                 
				return deletedFiles;           
			}
			///////结束***********************************

			//获得手机端的通讯录
			private String getPhoneContacts(String contactId)
			{
				String title = "";
				JSONObject jsonObject = new JSONObject();
				try
				{
					Cursor phoneCursor = getContentResolver().query(Phone.CONTENT_URI, null, Phone.CONTACT_ID + "=?", new String[] { contactId }, null);
					if (phoneCursor.moveToFirst())
					{
						String name = phoneCursor.getString(phoneCursor.getColumnIndex(Phone.DISPLAY_NAME));
						jsonObject.put("name", name);
					}
					// 获得联系人的电话号码
					int phoneCount = 0;
					Cursor cursor = getContentResolver().query(ContactsContract.Contacts.CONTENT_URI, null, null, null, null);
					if(cursor.moveToFirst()){
						phoneCount = cursor.getInt(cursor.getColumnIndex(ContactsContract.Contacts.HAS_PHONE_NUMBER));

					}
					cursor.close();
					if (phoneCount > 0)
					{
						if (phoneCursor.moveToFirst())
						{
							do
							{
								// 遍历所有的电话号码
								String phoneNumberType = phoneCursor.getString(phoneCursor.getColumnIndex(Phone.TYPE));
								String phoneNumber = phoneCursor.getString(phoneCursor.getColumnIndex(Phone.NUMBER));
								switch (Integer.parseInt(phoneNumberType))
								{
								case Phone.TYPE_HOME:
									// title="家庭电话";
									title = "hometel";
									break;
								case Phone.TYPE_MOBILE:
									// title="手机号码";
									title = "mobiletel";
									break;
								case Phone.TYPE_WORK:
									// title="办公电话";
									title = "worktel";
									break;
								case Phone.TYPE_FAX_WORK:
									// title="单位传真";
									title = "workfax";
									break;
								case Phone.TYPE_FAX_HOME:
									// title="住宅传真";
									title = "homefax";
									break;
								case Phone.TYPE_WORK_MOBILE:
									// title="单位手机";
									title = "workmobile";
									break;
								default:
									// title="其他";
									title = "othertel";
									break;
								}
								jsonObject.put(title, phoneNumber);
							}
							while (phoneCursor.moveToNext());
						}
						phoneCursor.close();
					}
					// 获得联系人的EMAIL
					Cursor emailCursor = getContentResolver().query(Email.CONTENT_URI, null, Email.CONTACT_ID
							+ " = " + contactId, null, null);

					if (emailCursor.moveToFirst())
					{
						do
						{
							// 遍历所有的email
							String emailtype = emailCursor.getString(emailCursor.getColumnIndex(Email.TYPE));
							String email = emailCursor.getString(emailCursor.getColumnIndex(Email.DATA1));

							switch (Integer.parseInt(emailtype))
							{
							case Email.TYPE_HOME:
								// title="家用";
								title = "homeemail";
								break;
							case Email.TYPE_WORK:
								// title="单位";
								title = "workemail";
								break;
							case Email.TYPE_OTHER:
								// title="其他";
								title = "otheremail";
								break;
							case Email.TYPE_MOBILE:
								// title="手机";
								title = "mobileemail";
								break;
							default:
								title = "otheremail";
								break;
							}
							jsonObject.put(title, email);
						}
						while (emailCursor.moveToNext());
					}
					emailCursor.close();

					// 获得邮编等信息
					Cursor postalCursor = getContentResolver().query(StructuredPostal.CONTENT_URI, null,
							StructuredPostal.CONTACT_ID + " = " + contactId, null, null);

					if (postalCursor.moveToFirst())
					{
						do
						{
							String postaltyle = postalCursor.getString(postalCursor.getColumnIndex(StructuredPostal.TYPE));
							String country = postalCursor.getString(postalCursor.getColumnIndex(StructuredPostal.COUNTRY));
							String city = postalCursor.getString(postalCursor.getColumnIndex(StructuredPostal.CITY));
							String street = postalCursor.getString(postalCursor.getColumnIndex(StructuredPostal.STREET));
							String postcode = postalCursor.getString(postalCursor.getColumnIndex(StructuredPostal.POSTCODE));
							switch (Integer.parseInt(postaltyle))
							{
							case StructuredPostal.TYPE_HOME:
								// title="家用";
								title = "homeaddr";
								break;
							case StructuredPostal.TYPE_WORK:
								// title="单位";
								title = "workaddr";
								break;
							case StructuredPostal.TYPE_OTHER:
								// title="其他";
								title = "otheraddr";
								break;

							default:
								// title="其他";
								title = "otheraddr";
								break;
							}
							if (country == null || country.equals("null"))
							{
								country = "";
							}
							if (city == null || city.equals("null"))
							{
								city = "";
							}
							if (street == null || street.equals("null"))
							{
								street = "";
							}
							if (postcode == null || postcode.equals("null"))
							{
								postcode = "";
							}

							String addr = "国家：" + country + ",城市：" + city + ",街道：" + street + ",邮编：" + postcode;
							jsonObject.put(title, addr);
						}
						while (postalCursor.moveToNext());
					}
					postalCursor.close();

					/*
					// 获得IM
					Cursor imCursor = getContentResolver().query(Data.CONTENT_URI, null, Im.CONTACT_ID + "=" + contactId + " AND "
							+ ContactsContract.Data.MIMETYPE + "='" + Im.CONTENT_ITEM_TYPE + "'", null, null);
					if (imCursor.moveToFirst())
					{
						do
						{
							String IM = imCursor.getString(imCursor.getColumnIndex(Im.DATA));
							int type = imCursor.getInt(imCursor.getColumnIndex(Im.PROTOCOL));
							switch (type)
							{
							case -1:
								title = "Custom";
								break;
							case 0:
								title = "AIM";
								break;
							case 1:
								title = "MSN";
								break;
							case 2:
								title = "YAHOO";
								break;
							case 3:
								title = "SKYPE";
								break;
							case 4:
								title = "QQ";
								break;
							case 5:
								title = "GoogleTalk";
								break;
							case 6:
								title = "ICQ";
								break;
							case 7:
								title = "JABBER";
								break;
							case 8:
								title = "NETMEETING";
								break;
							}

							jsonObject.put(title, IM);
						}
						while (imCursor.moveToNext());

					}
					imCursor.close();

					// 获取website
					Cursor websiteCursor = getContentResolver().query(ContactsContract.Data.CONTENT_URI, new String[] { Website.URL },
							Website.CONTACT_ID + " = " + contactId + " AND " + ContactsContract.Data.MIMETYPE + "='"
									+ Website.CONTENT_ITEM_TYPE + "'", null, null);

					if (websiteCursor.moveToFirst())
					{
						do
						{
							String websitetype = websiteCursor.getString(websiteCursor.getColumnIndex(Website.TYPE));
							String website = websiteCursor.getString(websiteCursor.getColumnIndex(Website.URL));
							switch (Integer.parseInt(websitetype))
							{
							case Website.TYPE_BLOG:
								// title="博客";
								title = "blog";
								break;
							case Website.TYPE_FTP:
								title = "ftp";
								break;
							case Website.TYPE_HOME:
								title = "home";
								break;
							case Website.TYPE_HOMEPAGE:
								title = "homepage";
								break;
							case Website.TYPE_OTHER:
								title = "other";
								break;
							case Website.TYPE_WORK:
								title = "work";
								break;
							default:
								title = "other";
								break;
							}
							jsonObject.put(title, website);
						}
						while (websiteCursor.moveToNext());
					}
					websiteCursor.close();
		*/
					// 获得note
					Cursor noteCursor = getContentResolver().query(ContactsContract.Data.CONTENT_URI, new String[] { Note.NOTE },
							Note.CONTACT_ID + " = " + contactId + " AND " + ContactsContract.Data.MIMETYPE + "='"
									+ Note.CONTENT_ITEM_TYPE + "'", null, null);

					if (noteCursor.moveToFirst())
					{
						String note = noteCursor.getString(noteCursor.getColumnIndex(Note.NOTE));
						title = "note";// 个性签名
						jsonObject.put(title, note);
					}
					noteCursor.close();

					// 获得nickname
					Cursor nicknameCursor = getContentResolver().query(ContactsContract.Data.CONTENT_URI, new String[] { Nickname.NAME },
							Nickname.CONTACT_ID + "=" + contactId + " AND " + ContactsContract.Data.MIMETYPE + "='"
									+ Nickname.CONTENT_ITEM_TYPE + "'", null, null);

					if (nicknameCursor.moveToFirst())
					{
						String nickname = nicknameCursor.getString(nicknameCursor.getColumnIndex(Nickname.NAME));
						title = "nickname";// 昵称
						jsonObject.put(title, nickname);
					}
					nicknameCursor.close();

					// 获得organization
					Cursor orgCursor = getContentResolver().query(ContactsContract.Data.CONTENT_URI, new String[] { Organization.COMPANY,
							Organization.TITLE }, Organization.CONTACT_ID + "=" + contactId + " AND "
							+ ContactsContract.Data.MIMETYPE + "='" + Organization.CONTENT_ITEM_TYPE + "'", null, null);

					if (orgCursor.moveToFirst())
					{
						do
						{
							String orgtype = "";
							try
							{
								orgtype = orgCursor.getString(orgCursor.getColumnIndex(Organization.TYPE));
							}
							catch (Exception e)
							{
								orgtype = "";
							}
							String company = orgCursor.getString(orgCursor.getColumnIndex(Organization.COMPANY));
							String position = orgCursor.getString(orgCursor.getColumnIndex(Organization.TITLE));
							if (!orgtype.equals(""))
							{
								switch (Integer.parseInt(orgtype))
								{
								case Organization.TYPE_WORK:
									title = "companyorg";
									break;
								case Organization.TYPE_OTHER:
									title = "otherorg";
									break;

								default:
									title = "otherorg";
									break;
								}
							}
							else
							{
								title = "org";
							}
							if (company == null || company.equals("null"))
							{
								company = "";
							}
							if (position == null || position.equals("null"))
							{
								position = "";
							}
							String org = "公司：" + company + "职位: " + position;
							jsonObject.put(title, org);
						}
						while (orgCursor.moveToNext());
					}
					orgCursor.close();

		            JSONArray jsonArray = new JSONArray();  
		            jsonArray.put(jsonObject);  
					return jsonArray.toString();
				}
				catch (Exception e)
				{
					e.printStackTrace();
				}
				return null;
			}
			public void startPlayer(String isSeek,String url,String wjbt) {
//				Intent intent = new Intent(WebViewWnd.this, PlayerVideoActivity.class);
//				//Uri uri = Uri.parse(url);
//				intent.putExtra("videoUrl", url);
//				intent.putExtra("isSeek", isSeek);
//				intent.putExtra("videoName", wjbt);
//				WebViewWnd.this.startActivity(intent);
			}
			public void PlayCompletion(final int curp){
				WebViewWnd.this.runOnUiThread(new  Runnable(){
    				public void run() { 
    					webView.loadUrl("javascript:playerstop("+curp+")");
    				}
    			});
			}
			
			 public void loadurl_embed(String url){
					Intent intent = new Intent(this, BrowserWnd.class);
					intent.putExtra("newUrl", url);
				    startActivity(intent);
			}
			public void loadurl_new(String url){
			    Uri uri = Uri.parse(url);
                Intent intent = new Intent(Intent.ACTION_VIEW,uri);
                startActivity(intent);
			}
			public void loadurl_dfjn(String url){
				Intent intent = new Intent(this, BrowserWnd.class);
				intent.putExtra("newUrl", url);
				intent.putExtra("wap_html", "yes");
				startActivity(intent);
			}
			
			private String bdyyResult = "";
			public String getBdyyResult(){
				return bdyyResult;
			}
			public void bdyy(){
//				Intent intent = new Intent(this, BaiduVoiceRecog.class);
//				 
//				startActivityForResult(intent,777);
			}
			
			public void selectFile(String zid, String mk_mc, String wjlj,
					String attachment, String callback,String sizeLimit) {
				 uploadFileUtil.selectFile(zid, mk_mc, wjlj, attachment, callback, SELECT_FILE,sizeLimit);
			}
			
			public void viewDetail(String url){
				Intent intent = new Intent(this, DetailWnd.class);
				intent.putExtra("newUrl", url);
			    startActivity(intent);
			}
			
			public void openXiaoyu(String url){
        		Uri uri = Uri.parse(url);
                Intent intent = new Intent(Intent.ACTION_VIEW,uri);
                startActivity(intent);
			}
			
			//以下是即时通讯需要的方法
			
			/**
			 * 调用麦克风录音	wangzl
			 */
			private String recordingPath = null;
			private String recordingName = null;
			public void startRecording(String status){
				mRecorder =  new MediaRecorder();
				// 设置音频来源(一般为麦克风)
		        mRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
		        // 设置音频输出格式（默认的输出格式）  
		        mRecorder.setOutputFormat(MediaRecorder.OutputFormat.DEFAULT);  
		        // 设置音频编码方式（默认的编码方式）  
		        //mRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.DEFAULT);
		        mRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
		        recordingFileName();
		        mRecorder.setOutputFile(recordingPath+"/"+recordingName);
		        try {
			        mRecorder.prepare();
			        mRecorder.start();
			        if("apply".equals(status)){
			        	mRecorder.setOnErrorListener(null);
						mRecorder.setOnInfoListener(null);  
						mRecorder.setPreviewDisplay(null);
			        	mRecorder.stop();
			            mRecorder.release();
			            mRecorder =  null;
			        }
				} catch (IOException e1) {
					e1.printStackTrace();
				}
			}
			
			/**
			 * 获取当前日期	wangzl
			 * @return
			 */
			public String getCurrDate(){
				SimpleDateFormat simple = new SimpleDateFormat("yyyy-MM-dd");
				return simple.format(new Date()).toString();
			}
			
			/**
			 * 录音文件保存路径	wangzl
			 * @return
			 */
			public void recordingFileName() {
				if(Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)){
					File appDir = new File(Environment.getExternalStorageDirectory()
			                .getAbsolutePath(), "jstx_folder");
					if(!appDir.exists()){
						appDir.mkdir();
					}
					recordingPath = appDir.getPath();
					recordingName = getCurrDate() + System.currentTimeMillis() + ".aac";
					//System.out.println(recordingPath);
					
				}
		    }
			
			/**
			 * 停止录音	wangzl
			 */
			public void stopRecording(String status){
				mRecorder.setOnErrorListener(null);
				mRecorder.setOnInfoListener(null);  
				mRecorder.setPreviewDisplay(null);
				mRecorder.stop();
		        mRecorder.release();
		        mRecorder =  null;
		        if(!status.equals("nocommit")){
		        	uploadAll(recordingPath+"/"+recordingName,recordingName,"recording","showRecording");
		        }
		        
			}
			
			/**
			 * 上传相册中的图片，移动客户端的文件	wangzl
			 */
			public void uploadAll(String filePath,String fileName,String type,String callback){
				//上传图片
		        String url=this.getHostUrl();
		        url = url+"/jstx/default.do?method=uploadMobile";
				String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
				SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
			    url =   url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
			    Map paraMap = new HashMap();
			    paraMap.put("callback",callback);
			    paraMap.put("jstx", "jstx");
			    paraMap.put("type", type);
			    if(type.equals("recording")){
			    	paraMap.put("fileName", fileName);
			    }else{
			    	paraMap.put("fileName", getCurrDate() + System.currentTimeMillis() + fileName);
			    }
			    paraMap.put("filePath", filePath);
			    File file = new File(filePath);
		        uploadFile(url,paraMap,file);
			}
			
			public void selectImg(){
			    Intent intent = new Intent(Intent.ACTION_PICK,MediaStore.Images.Media.EXTERNAL_CONTENT_URI);  
			    startActivityForResult(intent, SELECTIMG_MARK);
			}
			
			public void selectGif(){
				if (android.os.Environment.getExternalStorageState().equals(android.os.Environment.MEDIA_MOUNTED))
				{
					String path = android.os.Environment.getExternalStorageDirectory().getPath();
					if (!path.endsWith("/"))
					{
						path += "/";
					}
					path = path + "gif/";
					File tmpFile = new File(path);
					if(tmpFile==null||!tmpFile.exists()){
						tmpFile.mkdirs();
					}
					Uri uri = Uri.fromFile(tmpFile);
					Intent intent = new Intent(Intent.ACTION_PICK);  
					intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
					intent.setDataAndType(uri, "image/*");
					startActivityForResult(intent, SELECTIMG_MARK);
				}
			}
			
			/**
			 * 删除拍照图片		wangzl
			 * @param filePath
			 */
			public void delTempFile(String filePath){
				File file = new File(filePath);
				if(file.exists()){
					file.delete();
				}
			}
			public void copy(String copy){
				// 从API11开始android推荐使用android.content.ClipboardManager
		        // 为了兼容低版本我们这里使用旧版的android.text.ClipboardManager，虽然提示deprecated，但不影响使用。
		        ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
		        // 将文本内容放到系统剪贴板里。
		        cm.setText(copy);
//		        if(copy.contains("img"))
//		        {
//		        	String[] str = copy.split("\"");
//		        	WebViewWnd.this.webView.loadUrl("javascript:copyImg('"+str[1]+"')");
//		        }
		       
			}
			
			public String paste(){
				ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
				return cm.getText()==null?"":cm.getText().toString();
			}
			
			
			static ThreadLocal<MediaPlayer> s = new ThreadLocal<MediaPlayer>();

			/**
			 * 播放录音	wangzl
			 */
			public void playRecording(String filePath){
				Log.e("playRecording before",filePath);
				if(filePath.startsWith(getString(R.string.url))){
					filePath = filePath.replace(getString(R.string.url),getString(R.string.url_playVoice));
				}
				Log.e("playRecording after ",filePath);
				if(s.get()!=null){
					if(s.get().isPlaying()){
						s.get().stop();
					}
				}
				try {
					 MediaPlayer mediaPlayer = new MediaPlayer();
					 s.set(mediaPlayer);
					 mediaPlayer.setDataSource(filePath);
					 mediaPlayer.prepare();
					 mediaPlayer.start();

				} catch (IllegalArgumentException e) {
					e.printStackTrace();
				} catch (IllegalStateException e) {
					e.printStackTrace();
				} catch (IOException e) {
					e.printStackTrace();
				}
				
			}
			
			public void stopPlayRecording(){
				if(s.get()!=null){
					if(s.get().isPlaying()){
						s.get().stop();
						s.get().release();
						s.remove();
					}
				}
			}
			
			/**
			 * 手机下载文件	wangzl
			 * @param url	文件路径
			 * @param filename	文件名称
			 */
			public void downloadFile(final String url,final String filename){
				String path = Environment.getExternalStorageDirectory().getPath();
			    File file = new File(path + "/chatDownload",filename.substring(23));
			    
		        Intent i = new Intent();        
		        i.setAction("android.intent.action.VIEW");    
		        Uri content_url = Uri.parse(url+filename);   
		        i.setData(content_url);  
		        startActivity(i);
			    
//			    //文件存在直接打开，否则先下载再打开
//			    if(file.isFile() && file.exists()){
//			    	//file.delete();
//			    	openFile(new File(path + "/chatDownload",filename.substring(23)),url+filename);
//			    }else{
//			    	Log.e("sssssssss","执行到下载"+"url="+url+"filename="+filename);
//				    	DownloadManager downloadManager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
//						DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url + filename));
//					    //设置在什么网络情况下进行下载
////					    request.setAllowedNetworkTypes(Request.NETWORK_WIFI);
//					    //设置通知栏标题
//					    request.setNotificationVisibility(Request.VISIBILITY_VISIBLE);
//					    request.setTitle(filename.substring(23));
//					    request.setAllowedOverRoaming(false);
//					    //设置文件存放目录
//					    request.setDestinationInExternalPublicDir("chatDownload", filename.substring(23));
//					    Long id = downloadManager.enqueue(request);
//					    listener(id,filename.substring(23),url+filename);
////				    	print(url+filename);
////				    	new Thread() {
////	          				 @Override
////	          				 public void run() {
////		           					 Worker worker=new Worker(1);
////		           					 HttpDocDown HttpDocDown=new HttpDocDown(WebViewWnd.this,url + filename,filename);
////		           					 worker.doWork(HttpDocDown);
////	          				     }
////	          				 }.start();
//			    }
			}
			
			/**
			 * 下载完成后，提醒下载成功
			 * @param Id	下载任务id
			 * @param filename	下载文件名称
			 */
			private BroadcastReceiver broadcastReceiver;
			private void listener(final long Id,final String filename,final String video_url) {
			    //注册广播监听系统的下载完成事件
			    IntentFilter intentFilter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
			    broadcastReceiver = new BroadcastReceiver() {
			        @Override
			        public void onReceive(Context context, Intent intent) {
			            long ID = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
			            if (ID == Id) {
			                Toast.makeText(getApplicationContext(), filename + " 下载完成!", Toast.LENGTH_LONG).show();
			            	String path = Environment.getExternalStorageDirectory().getPath();
			            	openFile(new File(path + "/chatDownload",filename),video_url);
			            }
			        }
			    };
			    registerReceiver(broadcastReceiver, intentFilter);
			}
//			//20211013修改查看聊天文件失败
//			/** 
//			 * 调用系统程序打开文件
//			 * @param file 
//			 */  
//			private void openFile(File file){
//			    Intent intent = new Intent();
//			    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
//			    //设置intent的Action属性 
//			    intent.setAction(Intent.ACTION_VIEW);
//			    //获取文件file的MIME类型 
//			    String type = getMIMEType(file.getAbsolutePath());
//			    FileProvider7.setIntentDataAndType(WebViewWnd.this, intent, type, file, true);
//			    //设置intent的data和Type属性。
//			    //intent.setDataAndType(Uri.fromFile(file), type);
//			    //跳转
//			    startActivity(intent);
//			}
			
			/** 
			 * 调用系统程序打开文件
			 * @param file 
			 */  
			private void openFile(File file,String video_url){
			    Intent intent = new Intent();
			    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			    //设置intent的Action属性 
			    intent.setAction(Intent.ACTION_VIEW);
			    //获取文件file的MIME类型 
			    String type = getMIMEType(file.getAbsolutePath());
			    //设置intent的data和Type属性。
			    intent.setDataAndType(Uri.fromFile(file), type);
			    //跳转
			    startActivity(intent);

			    
			}
			
//			//附件选择
//	  		public void getAllFiles(String folderpath,final String callback){
//	  			String fileP=Environment.getExternalStorageDirectory().toString();
//	  			if(!"".equals(folderpath)){
//	  				fileP=folderpath;
//	  			}
//	  			File root=new File(fileP);
//	  			File files[] = root.listFiles(getFileExtensionFilter("."));  
//	  			JSONArray jsonarr=new JSONArray();
//	  			try {
//	  		        if(files != null){
//	  		        	if(files.length>0){
//	  		        		Arrays.sort(files);  //进行排序
//	  		        		for (int i=0;i<files.length;i++){  
//	  		        			File f = files[i];
//	  	        				JSONObject map=new JSONObject();
//	  	        				map.put("name", f.getName());
//	  	        				if(f.isDirectory()){  
//	  	        					map.put("flag","1");//文件夹
//	  	        				}else{  
//	  	        					// 获取文件的最后修改日期
//	  	        					long modTime = f.lastModified();
//	  	        					SimpleDateFormat dateFormat =new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//	  	        					map.put("flag","0");//文件
//	  	        					map.put("size",getFileSize(f.length()));
//	  	        					map.put("time", dateFormat.format(new Date(modTime)));
//	  	        				}  
//	  	        				jsonarr.put(i, map);
//	  		        		}
//	  		        		jsonarr.put(files.length, fileP);
//	  		        		final JSONArray json=jsonarr;
//	  		        		WebViewWnd.this.runOnUiThread(new  Runnable(){
//	  		        			public void run() { 
//	  		        				WebViewWnd.this.webView.loadUrl("javascript:"+callback+"("+json+")");
//	  		        			}
//	  		        		});
//	  		        	}else{
//	  		        		Toast.makeText(WebViewWnd.this, "该文件夹为空", Toast.LENGTH_SHORT).show();
//	  		        	}
//	  		        }
//	  	        } catch (Exception e) {
//	  	        	e.printStackTrace();
//	  	        }
//	  		}
//	  		//过滤文件名
//	  		public static FilenameFilter getFileExtensionFilter(String extension) {
//	  	        final String _extension = extension;
//	  	        return new FilenameFilter() {
//	  	            public boolean accept(File file, String name) {
//	  	                boolean ret = name.startsWith(_extension); 
//	  	                return !ret;
//	  	            }
//	  	        };
//	  	    }
//	  		//文件大小
//	  		private String getFileSize(double filesize){
//	  			String sizeStr="0",sizedw="B";
//	  			if(filesize/1024>1){
//	  				if(filesize/1024>1024){
//	  					filesize=filesize/1024/1024;
//	  					sizedw="M";
//	  				}else{
//	  					filesize=filesize/1024;
//	  					sizedw="K";
//	  				}
//	  			}
//	  			if(String.valueOf(filesize).indexOf(".")>-1){
//	  				sizeStr=String.format("%.2f", filesize);
//	  			}else{
//	  				sizeStr=filesize+"";
//	  			}
//	  			return sizeStr+sizedw;
//	  		}
			
		  //上传选择的附件
	  	    public void KhduploadFile(String filepath,String zid,String mk_mc,String wjlj,String attachment,String callback){
	  	    	Map paraMap = new HashMap();
	          	paraMap.put("zid", zid==null?"":zid);	
	          	paraMap.put("mk_mc", mk_mc==null?"":mk_mc);     	
	          	paraMap.put("wjlj", wjlj==null?"":wjlj); 
	          	paraMap.put("attachment", attachment==null?"":attachment);
	          	paraMap.put("callback", callback==null?"":callback);
	  	    	File file = new File(filepath);
	              String url=this.getHostUrl();
	              url = url+"/khd/uploadFile.do?method=uploadFile";
	  			String str = WebViewWnd.this.getString(R.string.SETTING_INFOS);
	  			SharedPreferences settings = WebViewWnd.this.getSharedPreferences(str, 0);
	  		    url =   url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");            
	              uploadFile(url,paraMap,file);
	  		}
	  	    
	  	  /**
			 * 主动关闭系统键盘	wangzl
			 * @return
			 */
			public void closeRcord(){
				InputMethodManager imm = (InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE); 
				boolean isOpen = imm.isActive();//isOpen若返回true，则表示输入法打开
				if(isOpen){
					imm.hideSoftInputFromWindow(WebViewWnd.this.getCurrentFocus().getWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
				}
			}
			
			/**
			 * 调用手机摄像头  wangzl
			 */
			String tempFileName = null;
			String tempFilePath = null;
			public void photograph(){
				Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
				intent.putExtra(MediaStore.EXTRA_VIDEO_QUALITY, 1);
				//tempFilePath = Environment.getExternalStorageDirectory().getAbsolutePath() + "/jstx_folder";
				if(Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)){
					File appDir = new File(Environment.getExternalStorageDirectory()
			                .getAbsolutePath(), "jstx_folder");
					if(!appDir.exists()){
						appDir.mkdir();
					}
					tempFilePath = appDir.getPath();
				}
				tempFileName = getCurrDate() + System.currentTimeMillis() + ".jpg";
				File out = new File(tempFilePath + "/" + tempFileName);
				Uri uri = Uri.fromFile(out);
				intent.putExtra(MediaStore.EXTRA_OUTPUT,uri);
				startActivityForResult(intent,PHOTOGRAPH_MARK);
			}

			
 


 
	// 语音合成对象
	private SpeechSynthesizer mTts;
 
	// 缓冲进度
	private int mPercentForBuffering = 0;
	// 播放进度
	private int mPercentForPlaying = 0;
	 
	private Toast mToast;
	private SharedPreferences mSharedPreferences;
	
 
	LinkedList<String> textList = null;
	public void startSpeaking(String text){
		textList = new LinkedList<String>();
		if(text.length()>4000){
			textList.add(text.substring(0, 4000));
			textList.add(text.substring(4000));
		}else{
			textList.add(text);
		}
		if(textList.size()>0){
			startSpeaking(textList.getFirst(),0);
			textList.removeFirst();
		}
	}
	 
 public void startSpeaking(String text,int flag){
//	 Regex regex = new Regex("<.+?>", RegexOptions.IgnoreCase);
//     string strOutput = regex.Replace(strHtml, "");//替换掉"<"和">"之间的内容
//     strOutput = strOutput.Replace("<", "");
//     strOutput = strOutput.Replace(">", "");
//     strOutput = strOutput.Replace("&nbsp;", "");

	 
		 	// 移动数据分析，收集开始合成事件
			FlowerCollector.onEvent(WebViewWnd.this, "tts_play");
			
			// 设置参数
			setParam();
			 if(null != mTts){
			int code = mTts.startSpeaking(text, mTtsListener);
 
			
			if (code != ErrorCode.SUCCESS) {
				showTip("语音合成失败,错误码: " + code);
			}}
 }
 public void stopSpeaking(){
			 if(null != mTts){
				 
				 mTts.stopSpeaking();
			 }
 }
 public void pauseSpeaking(){
	 if(null != mTts){
			mTts.pauseSpeaking();
	 }
 }
 public void resumeSpeaking(){
	 if(null != mTts){
			mTts.resumeSpeaking();
	 }
		 
	}
	private int selectedNum = 0;
	 
	/**
	 * 初始化监听。
	 */
	private InitListener mTtsInitListener = new InitListener() {
		@Override
		public void onInit(int code) {
			Log.d(TAG, "InitListener init() code = " + code);
			if (code != ErrorCode.SUCCESS) {
        		showTip("初始化失败,错误码："+code);
        	} else {
				// 初始化成功，之后可以调用startSpeaking方法
        		// 注：有的开发者在onCreate方法中创建完合成对象之后马上就调用startSpeaking进行合成，
        		// 正确的做法是将onCreate中的startSpeaking调用移至这里
//        		showTip("语音朗读初始化成功!");
			}		
		}
	};

	/**
	 * 合成回调监听。
	 */
	private SynthesizerListener mTtsListener = new SynthesizerListener() {
		
		@Override
		public void onSpeakBegin() {
//			showTip("开始播放");
		}

		@Override
		public void onSpeakPaused() {
//			showTip("暂停播放");
		}

		@Override
		public void onSpeakResumed() {
//			showTip("继续播放");
		}

		@Override
		public void onBufferProgress(int percent, int beginPos, int endPos,String info) {
			// 合成进度
			mPercentForBuffering = percent;
			showTip(String.format(getString(R.string.tts_toast_format),
					mPercentForBuffering, mPercentForPlaying));
		}

		@Override
		public void onSpeakProgress(int percent, int beginPos, int endPos) {
			// 播放进度
			mPercentForPlaying = percent;
			showTip(String.format(getString(R.string.tts_toast_format),
					mPercentForBuffering, mPercentForPlaying));
		}

		@Override
		public void onCompleted(SpeechError error) {
			if (error == null) {
//				showTip("播放完成");
				if(textList!=null && textList.size()>0){
					startSpeaking(textList.getFirst(),0);
					textList.removeFirst();
				}else{
					WebViewWnd.this.runOnUiThread(new Runnable() {
						@Override
						public void run() {
							// TODO Auto-generated method stub
							webView.loadUrl("javascript:onSpeakCompleted();");
						}
					});
				}
			} else if (error != null) {
				showTip(error.getPlainDescription(true));
			}
		}

		@Override
		public void onEvent(int eventType, int arg1, int arg2, Bundle obj) {
			// 以下代码用于获取与云端的会话id，当业务出错时将会话id提供给技术支持人员，可用于查询会话日志，定位出错原因
			// 若使用本地能力，会话id为null
			//	if (SpeechEvent.EVENT_SESSION_ID == eventType) {
			//		String sid = obj.getString(SpeechEvent.KEY_EVENT_SESSION_ID);
			//		Log.d(TAG, "session id =" + sid);
			//	}
		}
	};

	private void showTip(final String str) {
		mToast.setText(str);
		mToast.show();
	}

	/**
	 * 参数设置
	 * @return
	 */
	private void setParam(){
		// 清空参数
		mTts.setParameter(SpeechConstant.PARAMS, null);
		// 引擎类型
		String mEngineType = SpeechConstant.TYPE_CLOUD;

		// 根据合成引擎设置相应参数
		if(mEngineType.equals(SpeechConstant.TYPE_CLOUD)) {
			mTts.setParameter(SpeechConstant.ENGINE_TYPE, SpeechConstant.TYPE_CLOUD);
			// 设置在线合成发音人
			mTts.setParameter(SpeechConstant.VOICE_NAME, "xiaoyan");
			//设置合成语速
			mTts.setParameter(SpeechConstant.SPEED, mSharedPreferences.getString("speed_preference", "50"));
			//设置合成音调
			mTts.setParameter(SpeechConstant.PITCH, mSharedPreferences.getString("pitch_preference", "50"));
			//设置合成音量
			mTts.setParameter(SpeechConstant.VOLUME, mSharedPreferences.getString("volume_preference", "50"));
		}else {
			mTts.setParameter(SpeechConstant.ENGINE_TYPE, SpeechConstant.TYPE_LOCAL);
			// 设置本地合成发音人 voicer为空，默认通过语记界面指定发音人。
			mTts.setParameter(SpeechConstant.VOICE_NAME, "");
			/**
			 * TODO 本地合成不设置语速、音调、音量，默认使用语记设置
			 * 开发者如需自定义参数，请参考在线合成参数设置
			 */
		}
		//设置播放器音频流类型
		mTts.setParameter(SpeechConstant.STREAM_TYPE, mSharedPreferences.getString("stream_preference", "3"));
		// 设置播放合成音频打断音乐播放，默认为true
		mTts.setParameter(SpeechConstant.KEY_REQUEST_FOCUS, "true");

		// 设置音频保存路径，保存音频格式支持pcm、wav，设置路径为sd卡请注意WRITE_EXTERNAL_STORAGE权限
		// 注：AUDIO_FORMAT参数语记需要更新版本才能生效
		mTts.setParameter(SpeechConstant.AUDIO_FORMAT, "wav");
		mTts.setParameter(SpeechConstant.TTS_AUDIO_PATH, Environment.getExternalStorageDirectory()+"/msc/tts.wav");
	}
	
	@Override
	protected void onDestroy() {
		super.onDestroy();
		
		if( null != mTts ){
			mTts.stopSpeaking();
			// 退出时释放连接
			mTts.destroy();
		}
		stopPlayRecording();
	}
	
	 public void print(final String text){
//		 unigo.utility.Log.write(1, "TEST", text,getUsername());
//		 WebViewWnd.instance.runOnUiThread(new Runnable() {
//				
//				@Override
//				public void run() {
//					// TODO Auto-generated method stub
//					Toast.makeText(WebViewWnd.instance, text, Toast.LENGTH_LONG).show();
//				}
//			});
	 }
	 public void print2(final String text){
		 unigo.utility.Log.write(1, "TEST", text,getUsername());
		 WebViewWnd.instance.runOnUiThread(new Runnable() {
				
				@Override
				public void run() {
					// TODO Auto-generated method stub
					Toast.makeText(WebViewWnd.instance, text, Toast.LENGTH_LONG).show();
				}
			});
	 }
	 
	 /** 
	     * 直接调用短信接口发短信 
	     * @param phoneNumber 
	     * @param message 
	     */  
	public void sendSMS(String selfPhone,String targetPhone,String message){  
		final Context context = WebViewWnd.instance;
		PhoneInfoUtils piu = new PhoneInfoUtils(context);
		if(piu.getNativePhoneNumber()==null||"".equals(piu.getNativePhoneNumber())){
			Toast.makeText(context,"没有获取到手机号!", Toast.LENGTH_LONG).show();
			return ;
		}
		if(!"中国联通".equals(piu.getProvidersName())){
			Toast.makeText(context,"仅支持联通手机号!", Toast.LENGTH_LONG).show();
			return ;
		}
		String SENT_SMS_ACTION = "SENT_SMS_ACTION";  
		Intent sentIntent = new Intent(SENT_SMS_ACTION);  
		PendingIntent sentPI = PendingIntent.getBroadcast(context, 0, sentIntent, 0);  
		// register the Broadcast Receivers  
		context.registerReceiver(new BroadcastReceiver() {  
		    @Override  
		    public void onReceive(Context _context, Intent _intent) {  
		        switch (getResultCode()) {  
		              case Activity.RESULT_OK:  
		                   Toast.makeText(context,"您已提交查询，请及时查看短信！", Toast.LENGTH_LONG).show();  
		        break;  
		          case SmsManager.RESULT_ERROR_GENERIC_FAILURE:  
		        break;  
		          case SmsManager.RESULT_ERROR_RADIO_OFF:  
		        break;  
		          case SmsManager.RESULT_ERROR_NULL_PDU:  
		        break;  
		        }  
		    }  
		}, new IntentFilter(SENT_SMS_ACTION));  
		 
		String DELIVERED_SMS_ACTION = "DELIVERED_SMS_ACTION";  
		Intent deliverIntent = new Intent(DELIVERED_SMS_ACTION);  
		PendingIntent deliverPI = PendingIntent.getBroadcast(context, 0,  
		       deliverIntent, 0);  
		context.registerReceiver(new BroadcastReceiver() {  
		   @Override  
		   public void onReceive(Context _context, Intent _intent) {  
//		       Toast.makeText(context, "对方已经接收", Toast.LENGTH_SHORT) .show();  
		   }  
		}, new IntentFilter(DELIVERED_SMS_ACTION));  
		
	        //获取短信管理器   
	        android.telephony.SmsManager smsManager = android.telephony.SmsManager.getDefault();  
	        //拆分短信内容（手机短信长度限制）    
	        List<String> divideContents = smsManager.divideMessage(message);   
	        for (String text : divideContents) {    
	            smsManager.sendTextMessage(targetPhone, selfPhone, text, sentPI, deliverPI);   
	        }  
	    }  
	 

}

