package com.wotool.http;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URLEncoder;

import unigo.utility.Common;
import unigo.utility.HttpRun;
import unigo.utility.RunnableEx;
import android.app.Activity;
import android.content.SharedPreferences;
import android.util.Log;

import com.unicom.sywq.R;

public class HttpExitApp extends HttpRun
{
	private boolean succeed;
	private String reason;
	private Activity context;
	public static final String TAG = "HttpExitApp";
	private final String URL = "/khd/login.do?method=logout";
	private HandleExitApp handleExitApp;

	public HttpExitApp(Activity context, String[] strs)
	{

		this.context = context;
		this.setTimeout(5*1000);
		String str = context.getString(R.string.SETTING_INFOS);
		SharedPreferences settings = context.getSharedPreferences(str, 0);
		str = settings.getString("httpMain", "") + URL;
		try
		{
			str = str + "&sys_token_khd=" + URLEncoder.encode(strs[0], "UTF-8");
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}

		setUrl(str);
		setMethod("GET");

		if (Common.debug)
			Log.d(TAG + "URL", str);
	}

	protected void GetRecvData(InputStream din)
	{
		try
		{
			handleExitApp = new HandleExitApp(context, din, "utf-8");
		}
		catch (Exception e)
		{
		}
	}

	protected void end(int code, String err)
	{

		if (code != 200)
		{
			succeed = false;
			reason = reason + code + err;
		}
		if (handleExitApp != null)
		{
			succeed = handleExitApp.getSucceed();
			reason = handleExitApp.getReason();
		}

		
		if (context != null)
		{
			RunnableEx re = new RunnableEx(this)
			{
				protected void doRun(Object obj)
				{
					((OnHttpExitAppListener) context).onHttpExitApp((HttpExitApp) obj);
				}
			};
			context.runOnUiThread(re);
		}

	}



	protected void setRequestProperty(HttpURLConnection conn)
	{
		conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
	}

	public interface OnHttpExitAppListener
	{
		public void onHttpExitApp(HttpExitApp http);
	}

	public boolean getSucceed()
	{
		// TODO Auto-generated method stub
		return succeed;
	}

	public String getReason()
	{
		// TODO Auto-generated method stub
		return reason;
	}
}
