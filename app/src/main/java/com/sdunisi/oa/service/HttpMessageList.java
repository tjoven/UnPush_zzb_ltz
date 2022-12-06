package com.sdunisi.oa.service;

import java.io.InputStream;

import org.json.JSONObject;

import unigo.utility.Common;
import unigo.utility.HttpBase;
import unigo.utility.RunCancelable;
import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.sdunisi.oa.App;
import com.unicom.sywq.R;

class HttpMessageList extends HttpBase implements RunCancelable
{
	public static final String TAG = "HttpMessageList";
	private final String URL = "/khd/msg.do?method=queryMsgList&type=unRead&msgNum=100&groupId=";
	private Context context;
	private HandleHttpMessageList handleHttpMessageList;
	private JSONObject group = null;

	public HttpMessageList(Context context, JSONObject group)
	{
		this.context = context;
		this.group = group;
		String str = context.getString(R.string.SETTING_INFOS);
		SharedPreferences settings = context.getSharedPreferences(str, 0);
		String id = "1";
		try
		{
			id = group.optString("groupid", "1");

		}
		catch (Exception e)
		{
			e.printStackTrace();
		}

		str = settings.getString("httpMain", "") + URL + id + "&sys_token_khd=" + settings.getString("sys_token_khd", "");

		
		SharedPreferences settings2 = PreferenceManager.getDefaultSharedPreferences(context);// getSharedPreferences("settings",
		String username = settings2.getString(App.IM_USERNAME_KEY, "");
		String password = settings2.getString(App.IM_PASSWORD_KEY, "");
		str=str+"&UserName="+username;
		str=str+"&Password="+password;
		if (Common.debug)
			Log.d(TAG + "URL", str);
		setUrl(str);
		setMethod("GET");
	}

	protected void GetRecvData(InputStream din)
	{
		try
		{
			String groupName = group.optString("group_title", "未命名");
			handleHttpMessageList = new HandleHttpMessageList(context, din, groupName);
		}
		catch (Exception e)
		{
		}
	}

	protected void end(int code, String err)
	{

		if (handleHttpMessageList == null)
		{
			return;
		}
		Boolean b = (Boolean) this.getPrivateDate();
		if (b.booleanValue())
		{
			NoticeHelper.notice(context);
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
