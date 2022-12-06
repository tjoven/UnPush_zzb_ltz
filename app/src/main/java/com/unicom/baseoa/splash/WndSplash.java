package com.unicom.baseoa.splash;

import java.util.Timer;
import java.util.TimerTask;

import com.unicom.baseoa.util.NetConnection;
import com.unicom.sywq.R;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.Window;
import android.view.WindowManager;
import android.widget.LinearLayout;
import unigo.utility.HttpHandler;


public class WndSplash extends Activity {
   
	private static final int MAXNEST=100000;//xml节点最大数
	private LinearLayout splash_backgroud;
	private static final int REQUEST_SPLASH=10;
	public static WndSplash instance = null;
	
	public static boolean close = false;
	
	// 初始化定时器
	private Timer timer = null;
	
	private void startTimer(){
		timer = new Timer();
        long begin = System.currentTimeMillis();
        final long end = begin + 3*1000;//3秒后关闭
        timer.schedule(new TimerTask() {

    	    @Override
    	    public void run() {
    	    	if(System.currentTimeMillis()>end && close){
    	    		if(timer != null){
    	    	        timer.cancel();
    	    	        // 一定设置为null，否则定时器不会被回收
    	    	        timer = null;
    	    	    }
    	    		finish();
    	    	}
    	    }
    	}, 100, 100);

	}
	
	@Override
	public void overridePendingTransition(int enterAnim, int exitAnim) {
	    super.overridePendingTransition(0, 0);
	}
	
	 /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
		this.requestWindowFeature(Window.FEATURE_NO_TITLE);
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            //透明状态栏
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            //透明导航栏
           // getWindow().addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
		}
        setContentView(R.layout.splash);
        instance = this;
        inti();
        startTimer();
    }
    /**
     * 
     * inti()  初始化控件 
     * @创建人：ligw    
     * @创建时间：2013-1-7下午03:20:44
     * @修改人：
     * @修改时间：
     */
    private void inti(){
    	HttpHandler.nMaxNest=MAXNEST;
    	
    	//splash_backgroud=(LinearLayout)findViewById(R.id.splash_backgroud);
    	//splash_backgroud.setBackgroundResource(R.drawable.splash);
/*   	try{
   		InputStream in = getResources().getAssets().open("test.zip");
   		String ff = getFilesDir().getAbsolutePath();
    	new FileUtil().unZip(in,"/data/data/com.unicom.lwoa/files/");
   		String html = "<html>";
   		html = html+"<script>alert('kkkk');</script>";
   		html = html+"ceshi:<input type='text' name='aa'/>";
   		html = html+"ceshi:<input type='text' name='aa'/>";
   		html = html+"ceshi:<input type='text' name='aa'/>";
   		html = html+"ceshi:<input type='text' name='aa'/>";
   		html = html+"ceshi:<input type='text' name='aa'/>";
   		html = html+"ceshi:<input type='text' name='aa'/>";
   		html = html+"ceshi:<input type='text' name='aa'/>";
   		html = html+"</html>";
   	    FileOutputStream outStream = this.openFileOutput("login.html", Context.MODE_PRIVATE);
         outStream.write(html.getBytes());
         outStream.close();  
    	}catch(Exception ex){
    		ex.printStackTrace();
    	}*/
 

    }
	
	@Override
	protected void onResume() {
		super.onResume();
		checkNetwork();
		//new Version(this).check();//检查是否有版本更新
	}
	/**
	 * 
	 * checkNetwork()    检查网络是否有效    
	 * @Exception 异常对象    
	 * @创建人：ligw    
	 * @创建时间：2013-1-7下午03:09:28
	 * @修改人：
	 * @修改时间：
	 */
	private void checkNetwork(){
		if(NetConnection.isConnected(this)){
			//skipActivity();
		}else{
			showAlert("错误", this.getString(R.string.network_Invalid), true);
		}
	}
    /**
     * 
     * skipActivity() 跳转       
     * @创建人：ligw    
     * @创建时间：2013-1-7下午03:18:51
     * @修改人：
     * @修改时间：
     */
    private void skipActivity(){
    	Message message = new Message();
    	message.what = REQUEST_SPLASH;
    	mHandler.sendEmptyMessageDelayed(REQUEST_SPLASH, 2000);
    }
    
	private Handler mHandler = new Handler() {
		public void handleMessage(Message msg) {
			int what = msg.what;
			if(what == REQUEST_SPLASH){
				//App.startActivity("com.unicom.notice.queue.WndQueue");
				//Intent intent=new Intent();
				//intent.setClass(WndSplash.this, WebViewWnd.class);
				//startActivity(intent);
				finish();
				WndSplash.this.finish();
			}
		}
	};
	
	
	public void showAlert(String title, String message, boolean bExit)
	{
		final boolean b = bExit;
		AlertDialog alert = new AlertDialog.Builder(this).create();
		alert.setTitle(title);
		alert.setMessage(message);
		alert.setButton(DialogInterface.BUTTON_POSITIVE, "确认", new DialogInterface.OnClickListener()
		{
			public void onClick(DialogInterface dialog, int which)
			{
				if (b)
				{
					WndSplash.this.finish();
				}
			}
		});
		alert.show();
	}
	
}