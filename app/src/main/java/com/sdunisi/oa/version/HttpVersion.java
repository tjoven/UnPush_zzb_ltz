package com.sdunisi.oa.version;

import java.io.InputStream;

import unigo.utility.HttpBase;
import unigo.utility.RunCancelable;
import android.app.Activity;
import android.content.SharedPreferences;
import android.util.Log;

import com.unicom.sywq.R;

class HttpVersion extends HttpBase implements RunCancelable
{
	//private final String URL = "/khd/version.do?method=query&sys_token_khd=";
	private final String URL = "/khd/version.do?method=query";
	private Activity context;

	public HttpVersion(Activity context)
	{
		this.context = context;
		String str = context.getString(R.string.SETTING_INFOS);
		SharedPreferences settings = context.getSharedPreferences(str, 0);
		//str = settings.getString("httpMain", "") + URL + settings.getString("sys_token_khd", "");
//		str =  settings.getString("httpMain", "") + URL;
		str =  settings.getString("httpMain", "") + context.getString(R.string.versionUrl);
		setUrl(str);
		setMethod("GET");
	}

	protected void GetRecvData(InputStream din)
	{
		try
		{
			new HandlerHttpVersion(context, din);
		}
		catch (Exception e)
		{
		}
	}

	public void run()
	{
		startHttp();
	}

	public void cancel()
	{
		cancelHttp();
	}
}
