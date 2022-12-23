package com.sdunisi.oa.service;

import java.util.Calendar;
import java.util.TimeZone;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import unigo.utility.Md5;
import unigo.utility.RunnableEx;
import unigo.utility.Worker;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Binder;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;
import android.preference.PreferenceManager;
import android.util.Log;
import android.webkit.WebView;
import android.widget.Toast;

import com.async.http.AsyncHttpClient;
import com.async.http.AsyncHttpRequest;
import com.async.http.socketio.Acknowledge;
import com.async.http.socketio.ConnectCallback;
import com.async.http.socketio.DisconnectCallback;
import com.async.http.socketio.EventCallback;
import com.async.http.socketio.ExceptionCallback;
import com.async.http.socketio.JSONCallback;
import com.async.http.socketio.ReconnectCallback;
import com.async.http.socketio.SocketIOClient;
import com.async.http.socketio.SocketIORequest;
import com.async.http.socketio.StringCallback;
import com.sdunisi.oa.App;
import com.unicom.baseoa.WebViewWnd;
import com.unicom.baseoa.util.TimeUtil;
import com.unicom.sywq.R;
import com.wotool.http.HttpLoginOpenfire;

public class ImCoreService extends Service 
{
	private Thread threadLogin = null;
	private boolean debug = false;
	private static final String TAG="ImCoreService";
	private boolean isDiconnected = false;
	public static boolean mConnected = false;
	private String olduser="";
	private String oldpass="";
	private SocketIOClient client=null;
	
	public void onCreate()
	{
		super.onCreate();
		//unigo.utility.Log.write(1, TAG+":onCreate", "Service用户onCreate",olduser);
		//setForeground(true);
	}

	public int onStartCommand(Intent intent, int flags, int startId)
	{
		SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(this);// getSharedPreferences("settings",
		String username = settings.getString(App.IM_USERNAME_KEY, "");
		String password = settings.getString(App.IM_PASSWORD_KEY, "");
		//unigo.utility.Log.write(1, TAG+":onStartCommand", "before keepAlive==============",username);
		keepAlive();
		if(client!=null){
			if(client.isConnected() && olduser.equals(username)&& oldpass.equals(password)){//服务启动中,并且用户无变化无需再启
				//Log.d(TAG, String.format("ImService 运行中用户一致========== %s", mConnected));
				unigo.utility.Log.write(1, TAG+":onStartCommand", "websocket用户与登录用户一致，无需重新连接",username);
			}else{
				if(client.isConnected()){
					unigo.utility.Log.write(1, TAG+":onStartCommand", "websocket用户与登录用户不一致，关闭连接",username);
					//msger.close();
					isDiconnected=true;
					client.disconnect();
					//Log.d(TAG, String.format("ImService 我已关闭********** %s", msger.isConnection()));
				}else{
					unigo.utility.Log.write(1, TAG+":client is not null", "Service用户初始登录NODEJS服务器",username);
					startLogin();
				}
			}
		}else{
			if(!mConnected){
				unigo.utility.Log.write(1, TAG+":client is null", "初始登录NODEJS服务器~~mConnected="+mConnected,username);
				startLogin();
			}
		}
		//startLogin();
		return START_REDELIVER_INTENT;
	}

	public void onDestroy()
	{
		super.onDestroy();
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		unigo.utility.Log.write(1, TAG+":onDestroy", "onDestroy==============",olduser);
		if(client!=null&&mConnected){
			client.disconnect();
		}
	}
	
	public void startLogin(){
		//Log.d(TAG, threadLogin+"!!!!!!!!!!!!!!!!!!!!");
		if (threadLogin == null)
		{
			Thread t = new Thread(new Runnable()
			{
				public void run()
				{
					try
					{
//						Thread.sleep(3000);
//						loginIm();
						//isLogin();
					}
					catch (Exception e)
					{
						e.printStackTrace();
					}
					threadLogin = null;
				}
			});
			t.start();
			threadLogin = t;
		}
	}
    /**
     * 
     * isLogin()   登录状态查询
     * @param   name    
     * @return String    DOM对象      
     * @Exception 异常对象    
     * @创建人：ligw    
     * @创建时间：2012-12-24下午05:21:21
     * @修改人：
     * @修改时间：
     */
	private void isLogin(){
		String token="";
		String str = this.getString(R.string.SETTING_INFOS);
		SharedPreferences settings = this.getSharedPreferences(str, 0);
		token=settings.getString("sys_token_khd", "");
		//token=App.token;
		String[] strs={token};
		
		HttpLoginOpenfire http = new HttpLoginOpenfire(this,strs);
		http.setPrivateDate(Boolean.FALSE);
		Worker worker=new Worker(1);
		worker.doWork(http);
	}
	
	
	

	private void loginIm(){
		final SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(this);// getSharedPreferences("settings",
		String username = settings.getString(App.IM_USERNAME_KEY, "");
		this.olduser=username;
		String password = settings.getString(App.IM_PASSWORD_KEY, "");
		String zzid = settings.getString(App.IM_ZZID_KEY, "");
		String device = settings.getString(App.IM_DEVICE_KEY, "");
		String imei = settings.getString(App.IM_IMEI_KEY, "");
		String imsi = settings.getString(App.IM_IMSI_KEY, "");
		oldpass=password;
		password = Md5.getMd5(password);
		String str = settings.getString("httpMainIM", "");
		
		final SocketIORequest req = new SocketIORequest(str,"","zzid="+zzid+"&un="+username+"&pass="+password+"&device="+device+"&imei="+imei+"&imsi="+imsi+"&ct=chat,");
        req.setLogging("SdunicomIM", Log.VERBOSE);
        SocketIOClient.connect(AsyncHttpClient.getDefaultInstance(), req, new ConnectCallback() {
            @Override
            public void onConnectCompleted(Exception ex, final SocketIOClient client) {
               //assertNull(ex);
            	ImCoreService.this.client=client;
            	unigo.utility.Log.write(1, TAG+":isConnected", req.getUri()+">>isConnected:"+client.isConnected(),olduser);
            	ImCoreService.mConnected=client.isConnected();
            	//client.isConnected();
            	//client.disconnect();
                client.setStringCallback(new StringCallback() {
                    @Override
                    public void onString(String string, Acknowledge acknowledge) {
                    	Log.d("333setStringCallback", "333setStringCallback");
                    }
                });
                client.on("r", new EventCallback() {
                    @Override
                    public void onEvent(JSONArray arguments, Acknowledge acknowledge) {
                    	try {
                    		fetchChatMsg(arguments.getJSONArray(0).getJSONObject(0));
//            				fetchNotices(arguments.getJSONArray(0).getJSONObject(0).getString("msg"));
            				acknowledge.acknowledge(new JSONArray());//回复node端
            				unigo.utility.Log.write(1, TAG+":onEvent", String.format("Got event %s: %s", "r", arguments.toString()),olduser);
            			} catch (JSONException e) {
            				e.printStackTrace();
            			}
                    }
                });
                client.on("m", new EventCallback() {
                    @Override
                    public void onEvent(JSONArray arguments, Acknowledge acknowledge) {
                    	try {
                    		WebViewWnd.instance.parseIMdate(arguments);
                    		String e = arguments.getJSONObject(0).getString("e");
                    		if(acknowledge!=null&&"nm".equals(e)){
                    			JSONObject d = arguments.getJSONObject(0).getJSONObject("d");
                    			String i=d.getString("i");
                    			System.out.println(App.isChatPage+"=========="+App.ChatwithYh+"==========="+i);
                    			if(App.isChatPage&&App.ChatwithYh.equals(i)){
                    				acknowledge.acknowledge(new JSONArray("[1]"));//回复node端
                    			}else{
                    				acknowledge.acknowledge(new JSONArray("[0]"));//回复node端
                    			}
                    		}
            				//fetchChatMsg(arguments);
            				unigo.utility.Log.write(1, TAG+":onEvent", String.format("Got event %s: %s", "m", arguments.toString()),olduser);
            			} catch (Exception e) {
            				e.printStackTrace();
            			}
                    }
                });
                //client.emit(name, args, acknowledge);
                client.setJSONCallback(new JSONCallback() {
                    @Override
                    public void onJSON(JSONObject json, Acknowledge acknowledge) {
                    	unigo.utility.Log.write(1, TAG+":onJSON", "onJSON success！",olduser);
                    }
                });
                client.setDisconnectCallback(new DisconnectCallback() {
					@Override
					public void onDisconnect(Exception e) {
						unigo.utility.Log.write(1, TAG+":onDisconnect", "onDisconnect success！",olduser);
						if(isDiconnected&&!client.isConnected()){
//							unigo.utility.Log.write(1, TAG+":onDisconnect", "不同用户登录，新用户开始登录",olduser);
							unigo.utility.Log.write(1, TAG+":onDisconnect", "连接断开成功,开始重连",olduser);
							ImCoreService.mConnected=client.isConnected();
							startLogin();
						}
//						toast("消息推送断开成功");
						isDiconnected=false;
					}
				});
                client.setReconnectCallback(new ReconnectCallback() {
					
					@Override
					public void onReconnect() {
						ImCoreService.this.client=client;
						ImCoreService.mConnected=client.isConnected();
						unigo.utility.Log.write(1, TAG+":onReconnect", "onReconnect success！",olduser);
					}
				});
                client.setExceptionCallback(new ExceptionCallback() {
					@Override
					public void onException(Exception e) {
						unigo.utility.Log.write(1, TAG+":onException", "onException success！",olduser);
					}
				});
            }
        });

	}

	private void keepAlive()
	{
		//unigo.utility.Log.write(1, TAG+":keepAlive", "runing.......",olduser);
		AlarmManager alarmMgr = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
		Intent intent = new Intent();
		intent.setAction("com.sdunisi.oa.service.IM_BASE_CORE_ACTION");
		intent.putExtra("bAlarm", true);
		int requestCode = 0;
		PendingIntent pendIntent = PendingIntent.getBroadcast(getApplicationContext(), requestCode, intent, PendingIntent.FLAG_CANCEL_CURRENT);
		alarmMgr.cancel(pendIntent);
		// 按时间段发送广播
		Calendar cal = Calendar.getInstance(TimeZone.getDefault());
		int h = cal.get(Calendar.HOUR_OF_DAY);
		long l = System.currentTimeMillis();
		long triggerAtTime = SystemClock.elapsedRealtime() + 60000L;
		if (h >= 7 && h < 22)
			l += 55000L;
			//l +=180000L;
		else
			l += 3600000L;
		//Log.d(TAG, "keepAlive~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
//		alarmMgr.set(AlarmManager.RTC_WAKEUP, l, pendIntent);
		alarmMgr.setRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAtTime, 60000L, pendIntent);
	}
	
	private void toast(String message)
	{
		Looper.prepare();
		Handler handler = new Handler();
		handler.post(new RunnableEx(message)
		{
			protected void doRun(Object obj)
			{
				String message = (String) obj;
				Toast.makeText(getApplicationContext(), message, Toast.LENGTH_LONG).show();
			}
		});
		Looper.loop();
	}

	private void fetchNotices(String msg)
	{
		Worker worker = new Worker(0);
		worker.doWork(new NodeJsNoticeHelper(this, msg));
	}
	private void fetchChatMsg(JSONObject arguments)
	{
//		toast(arguments.toString());
		Worker worker = new Worker(0);
		worker.doWork(new NodeJsNoticeHelper(this, arguments));
	}
	private final IBinder binder = new LocalBinder();  
    public class LocalBinder extends Binder {  
    	public ImCoreService getService() {  
            return ImCoreService.this;  
        }  
    }  
    public IBinder onBind(Intent intent) {  
        return binder;  
    } 
    public SocketIOClient getClient(){
    	return client;
    }
}
