package com.wotool.http;

import java.io.InputStream;
import java.net.HttpURLConnection;

import unigo.utility.Common;
import unigo.utility.HttpRun;
import unigo.utility.RunnableEx;
import android.content.SharedPreferences;
import android.util.Log;

import com.unicom.baseoa.WebViewWnd;
import com.unicom.sywq.R;

public class HttpRequestGridView extends HttpRun
{

	private WebViewWnd context;
	public static final String TAG = "HttpRequestGridView";
	private final String URL = "/khd/menu.do?method=query&sys_token_khd=";
	private HandleHttpRequestGridView handleHttpRequestGridView;
	private boolean succeed;
	private String reason;

	public HttpRequestGridView(WebViewWnd context)
	{
		this.context = context;

		String str = context.getString(R.string.SETTING_INFOS);
		SharedPreferences settings = context.getSharedPreferences(str, 0);
		str = settings.getString("httpMain", "") + URL;
		str = str + settings.getString("sys_token_khd", "");

		setUrl(str);
		setMethod("GET");

		if (Common.debug)
		{
			Log.d(TAG + "URL", str);
		}
	}



	protected void GetRecvData(InputStream din)
	{
		try
		{
			handleHttpRequestGridView = new HandleHttpRequestGridView(context, din, "utf-8");
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
		if (handleHttpRequestGridView != null)
		{
			succeed = handleHttpRequestGridView.getSucceed();
			reason = handleHttpRequestGridView.getReason();
		}

		if (context != null)
		{
			RunnableEx re = new RunnableEx(this)
			{
				protected void doRun(Object obj)
				{
					context.onHttpRequestGridView((HttpRequestGridView) obj);
				}
			};
			context.runOnUiThread(re);
		}

	}

	protected void setRequestProperty(HttpURLConnection conn)
	{
		conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
	}

	public interface OnHttpLoginListener
	{
		//public void onHttpLogin(HttpLogin http);
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
