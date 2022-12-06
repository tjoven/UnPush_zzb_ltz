package com.sdunisi.oa.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.json.JSONArray;
import org.json.JSONObject;

import unigo.utility.ByteHelper;
import unigo.utility.HttpHandler;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.sdunisi.oa.App;
import com.unicom.sywq.R;

class HandleHttpNotice extends HttpHandler
{
	private Context context;
	private JSONArray groups;
	private boolean succeed = false;
	public HandleHttpNotice(Context context, InputStream din, String msg)
	{
		try
		{
			this.context = context;
			din = ByteHelper.debugInputStream(din, "utf-8");
			handleXml(din, "utf-8");
		}
		catch (Exception e)
		{
		}
	}

	private void handleXml(InputStream din, String textCode) throws Exception
	{

		BufferedReader br = new BufferedReader(new InputStreamReader(din, textCode));

		String data = "";
		StringBuffer sb = new StringBuffer();
		while ((data = br.readLine()) != null)
		{
			sb.append(data);
		}
		String result = sb.toString();
		Log.d("result_", result);
		JSONObject jsons = new JSONObject(result);
		String sucssNum = jsons.optString("result");
		if (sucssNum != null && sucssNum.contains("1"))
		{
			succeed = true;
		}
		if(!succeed)
		{
			String errorMessage = jsons.optString("errorMessage");
			if(errorMessage.contains("会话信息失效"))
			{
				NoticeHelper.notifyLogin(context, false);
			}
			return;
		}
		while (succeed)
		{
			if(jsons.has("token"))
			{
				String token=jsons.optString("token");
				App.token = token;
				String str = context.getString(R.string.SETTING_INFOS);
				SharedPreferences settings = context.getSharedPreferences(str, 0);
				settings.edit().putString("sys_token_khd", token).commit();
			}
			groups = jsons.getJSONArray("msgGroup");
			break;
		}
		// notice();
	}

	
	public JSONArray getGroups()
	{
		// TODO Auto-generated method stub
		return groups;
	}
}
