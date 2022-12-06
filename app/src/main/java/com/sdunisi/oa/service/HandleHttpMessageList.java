package com.sdunisi.oa.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.json.JSONArray;
import org.json.JSONObject;

import unigo.utility.ByteHelper;
import unigo.utility.Common;
import unigo.utility.HttpHandler;
import unigo.utility.Worker;
import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.sdunisi.oa.App;
import com.sdunisi.oa.im.HttpImResponse;
import com.unicom.sywq.R;

class HandleHttpMessageList extends HttpHandler
{
	private Context context;
	private String groupName;
	private JSONArray messages;
	private boolean succeed = false;
	private String reason = "";

	public HandleHttpMessageList(Context context, InputStream din, String groupName)
	{
		try
		{
			this.context = context;
			this.groupName = groupName;
			din = ByteHelper.debugInputStream(din, "utf-8");
			handleJson(din, "utf-8");
		}
		catch (Exception e)
		{
		}
	}

	private void handleJson(InputStream din, String textCode) throws Exception
	{

		BufferedReader br = new BufferedReader(new InputStreamReader(din, textCode));

		String data = "";
		StringBuffer sb = new StringBuffer();
		while ((data = br.readLine()) != null)
		{
			sb.append(data);
		}
		String result = sb.toString();
		if (Common.debug)
		{
			Log.d("result_messagelist", result);
		}
		Log.d("result_messagelist", result);
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
			messages = jsons.optJSONArray("msgList");
			if (messages == null || messages.length() <= 0)
			{
				break;
			}
			for (int i = 0; i < messages.length(); i++)
			{
				JSONObject message = messages.optJSONObject(i);

				SharedPreferences settings =PreferenceManager.getDefaultSharedPreferences(context);;
				String username = settings.getString(App.IM_USERNAME_KEY, "");
				ContentValues cvs = new ContentValues();
				cvs.put("groupname", groupName);
				cvs.put("user", username);
				// JSONArray names=message.names();
				// if(names!=null)
				// {
				// for(int j=0;j<names.length();j++)
				// {
				// String name=names.optString(j);
				// String value=message.optString(name, "");
				// cvs.put(name, value);
				// }
				// IdbHelper.getInstance(context).insertMessage(cvs);
				// }
				String id = message.optString("id", "");
				cvs.put("id", id);
				String value = message.optString("sr", "");
				cvs.put("sr", value);
				String ar = message.optString("ar", "");
				cvs.put("ar", ar);
				value = message.optString("c", "");
				cvs.put("content", value);
				value = message.optString("s", "");
				cvs.put("sender", value);
				value = message.optString("yhid", "");
				cvs.put("yhid", value);
				value = message.optString("rr", "");
				cvs.put("rr", value);
				value = message.optString("l", "");
				cvs.put("show_level", value);
				value = message.optString("u", "");
				cvs.put("url", value);
				value = message.optString("t", "");
				cvs.put("title", value);
				value = message.optString("groupid", "");
				cvs.put("groupid", value);
				value = message.optString("st", "");
				cvs.put("create_time", value);
				value = message.optString("ywid", "");
				cvs.put("ywid", value);
				value = message.optString("a", "");
				cvs.put("a", value);
				if(IdbHelper.getInstance(context).insertMessage(cvs)>-1)
				{
					//send arrive
					if(ar.contains("1"))
					{
						Worker worker = new Worker(1);
						HttpImResponse http=new HttpImResponse(0,context,id);
						worker.doWork(http);
					}

				}

			}
			break;
		}

		// notice();
	}

	

}
