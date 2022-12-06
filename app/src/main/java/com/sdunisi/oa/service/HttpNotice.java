package com.sdunisi.oa.service;

import java.io.InputStream;

import org.json.JSONArray;
import org.json.JSONObject;

import unigo.utility.Common;
import unigo.utility.HttpBase;
import unigo.utility.RunCancelable;
import unigo.utility.Worker;
import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.sdunisi.oa.App;
import com.unicom.sywq.R;

class HttpNotice extends HttpBase implements RunCancelable
{
	private final String URL = "/khd/msg.do?method=queryMsgGroup&sys_token_khd=";
	private Context context;
	private String msg;
	private HandleHttpNotice handleHttpNotice;
	private JSONArray groups = null;

	public HttpNotice(Context context, String msg)
	{
		this.context = context;
		this.msg = msg;
		String str = context.getString(R.string.SETTING_INFOS);
		SharedPreferences settings = context.getSharedPreferences(str, 0);
		str = settings.getString("httpMain", "") + URL + settings.getString("sys_token_khd", "");

		SharedPreferences settings2 = PreferenceManager.getDefaultSharedPreferences(context);// getSharedPreferences("settings",
		String username = settings2.getString(App.IM_USERNAME_KEY, "");
		String password = settings2.getString(App.IM_PASSWORD_KEY, "");
		str=str+"&UserName="+username;
		str=str+"&Password="+password;
		if (Common.debug)
			Log.d("URL", str);
		setUrl(str);
		setMethod("GET");
	}

	protected void GetRecvData(InputStream din)
	{
		try
		{
			handleHttpNotice = new HandleHttpNotice(context, din, msg);
		}
		catch (Exception e)
		{
		}
	}

	protected void end(int code, String err)
	{

		if (handleHttpNotice == null)
		{
			return;
		}
		groups = handleHttpNotice.getGroups();
		if (groups == null)
		{
			return;
		}
		Worker worker = new Worker();
		int count = groups.length();
		try
		{
			for (int i = 0; i < count; i++)
			{

				JSONObject group = groups.optJSONObject(i);
				HttpMessageList http = new HttpMessageList(context, group);
				if (i == count - 1)
				{
					http.setPrivateDate(Boolean.valueOf(true));
				}
				else
				{
					http.setPrivateDate(Boolean.valueOf(false));

				}
				worker.doWork(http);
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
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
