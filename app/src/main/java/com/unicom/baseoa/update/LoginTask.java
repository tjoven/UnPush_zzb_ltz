package com.unicom.baseoa.update;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;

import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.PersistentCookieStore;
import com.loopj.android.http.RequestParams;
import com.unicom.baseoa.WebViewWnd;
//import com.unicom.baseoa.application.App;
import com.unicom.baseoa.myhttps.HttpUtilsSafe2;
import com.unicom.sywq.R;

import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.util.Log;
import android.widget.Toast;

public class LoginTask {

	private SharedPreferences settings;// 配置文件
	private WebViewWnd context;
	
	private String	username = null;
	private String	password = null; 
	private String	zhid = null;
	private String	device = null;
	private String	mei = null; 
	private String	msi = null; 

	public LoginTask(WebViewWnd ac) {
		context = ac;
		settings = context.getSharedPreferences(context.getString(R.string.SETTING_INFOS), 0);
	}

	public void execute() {
		try {
			 login();
		} catch (Exception e) {
			LogException.log(context, e) ;
			WebViewWnd.instance.onLoginFinish("");
		}
	}
 
	private void login(){
		username = context.getUsername();
		password = context.getPassword();
		String logout = settings.getString("logout", "");
		print("username="+username+",,,passwordExists="+!"".equals(password)+",,,logout="+logout);
		if("logout".equals(logout)){//用户注销登录
			WebViewWnd.instance.onLoginFinish("");
			return ;
		}
		if(username==null||"".equals(username)||password==null||"".equals(password)){
			WebViewWnd.instance.onLoginFinish("");
			return ;
		}
		zhid = context.getZhid();
		if(zhid==null||"".equals(zhid)){
			zhid = "0";
		}
		device = context.getDeviceInfo();
		mei = context.getMei();
		msi = context.getImsiLogin();
	 
		String url = "/khd/login.do?method=login&mei=" + mei + "&device=" + device + "&msi=46001123456&username=" + username + "&password=" + password + "&zhid=" + zhid ;
		String settingUrl = settings.getString("httpMain", ""); 
		url = settingUrl  + url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
		//url = url+"&"+java.net.URLEncoder.encode(data);;
		//url = url.replaceAll(" ", "%20");
		print("执行登录::::"+url);
//		sys_ajaxPost(url,"");
		//之前的登录方式http
		//httpGet(url);
		//之后的登录方式https
		//httpsPost(url);
		
//		HttpUtilsSafe2.getInstance().get(context, url, new HttpUtilsSafe2.OnRequestCallBack() {
//			
//			@Override
//			public void onSuccess(String s) {
//				// TODO Auto-generated method stub
//				Log.e("LoginTask", "https请求成功");
//				loginResult(s);
//			}
//			
//			@Override
//			public void onFail(Exception e) {
//				// TODO Auto-generated method stub
//				Log.e("LoginTask", "https请求错误");
//			}
//		});
		WebViewWnd.instance.onLoginFinish("");
	}
	
	
	
	//登录换成https
//	public void httpsPost(String url){
//		 OkHttpPost.asyncHttpRequest(context, url, "data", "sys_timeStamp",  "callback",null,null,new OkHttpPostListener() {
//				
//			@Override
//			public void onOkHttpPostResponse(String result, final String callback,final String sys_timeStamp,final String auth2) {
//				// TODO Auto-generated method stub
//				if(!"".equals(callback)){
//		    		
//		    		String str="";
//		    		if(result.indexOf("login.do?method=exit")>-1){
//		    			str="{\"error\":\""+result+"\"}";
//		    		}else{
//		    			str=result;
//		    		}
//		    		
//		    		final String param = str;
//		    		final String serverResponse=result;
//		    		 
//		    			WebViewWnd.instance.runOnUiThread(new Runnable() {
//							
//							@Override
//							public void run() {
//								// TODO Auto-generated method stub
//								//App.securityLoadUrl(WebViewWnd.instance.getWebView(),"javascript:"+callback+"("+param+",'"+sys_timeStamp+"')");
//								//App.securityLoadUrl(WebViewWnd.instance.getWebView2(),"javascript:"+callback+"("+param+",'"+sys_timeStamp+"')");
//								loginResult(serverResponse);
//							}
//						});
//		    		} 
//		    	 
//			 
//			}
//			
//			@Override
//			public void onOkHttpPostFailure() {
//				// TODO Auto-generated method stub
//				
//			}
//		});
//
//	}
	
	
	
	
	
	public void httpGet(String url){
		try {
			HttpParams params = new BasicHttpParams();
			HttpConnectionParams.setConnectionTimeout(params, 3000);
			HttpConnectionParams.setSoTimeout(params, 3000);
			DefaultHttpClient httpClient = new DefaultHttpClient(params);
			HttpGet httpGet = new HttpGet(url);
			HttpResponse response = httpClient.execute(httpGet);
			String serverResponse = "";
			// 判断是否请求成功
			if (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
				// 获得响应信息
				serverResponse = EntityUtils.toString(response.getEntity());
				print("登录接口返回的数据:::" + response);
				loginResult(serverResponse);
				return ;
			}
		} catch (Exception e) {
			LogException.log(context, e);
		}
		print("网连接失败:::" + url);
		WebViewWnd.instance.onLoginFinish("");
	}
	
	public void sys_ajaxPost(String url,String data){
		String[] dataArr = data.split("&");
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
		AsyncHttpClient client = new AsyncHttpClient();
		//保存服务端返回的cookie
    	final PersistentCookieStore myCookieStore = new PersistentCookieStore(context);
    	client.setCookieStore(myCookieStore);
    	client.setTimeout(3000);
    	
		client.post(url, params, new AsyncHttpResponseHandler() {
		    @Override
		    public void onSuccess(String response) {
		    	print("登录接口返回的数据:::"+response);
		    	loginResult(response);
		    }
			@Override
			public void onFailure(Throwable error, String content)
			{
				print("登录失败:::"+content);
				LogException.log(context, error);
				WebViewWnd.instance.onLoginFinish("");
			}
		});
	}
	
	private void loginResult(String json){
		try{
			//测试
			Log.e("loginTask","json="+json);
			JSONObject jo = new JSONObject(json);
			if ("1".equals(jo.getString("result"))) {
				context.saveUsername(username, jo.getString("yhxm"));
				context.savePwdForLock(password);
				context.saveYhid(jo.getString("yhid"));
				context.saveBmid(jo.getString("bmid"));
				context.saveZhid(zhid);
				//消息推送启动******
				String khd_pushServerUrl = jo.getString("khd_pushServerUrl");
				context.saveImNameAndPsd(zhid, username, password, device, mei, msi, khd_pushServerUrl);
				context.startIMService();
				//保存token
				context.saveToken(jo.getString("sys_token_khd"));
				WebViewWnd.instance.onLoginFinish("SUCCESS");
				return ;
			}
		}catch(Exception e){
			LogException.log(context, e);
		}
		WebViewWnd.instance.onLoginFinish("");
	}
  
	private void print(final String text) {
		unigo.utility.Log.write(1, "UpdateHtmlTask", text, "");
//		context.runOnUiThread(new Runnable() {
//			@Override
//			public void run() {
//				Toast.makeText(context, text, Toast.LENGTH_LONG).show();
//			}
//		});
	}
 
}
