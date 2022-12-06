package com.wotool.http;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.json.JSONArray;
import org.json.JSONObject;

import com.sdunisi.oa.App;
import com.wotool.db.DbHelper;

import unigo.utility.HttpHandler;
import android.content.Context;
import android.util.Log;

public class HandleHttpRequestGridView extends HttpHandler
{
	private boolean succeed = false;
	private String reason = null;

	public HandleHttpRequestGridView(Context context, InputStream din, String textCode)
	{
		try
		{
			handleJson(context, din, textCode);
		}
		catch (Exception e)
		{
			reason = App.HTTPREASON_LOCALPARSE;
		}
	}

	public boolean getSucceed()
	{
		return succeed;
	}

	public String getReason()
	{
		return reason;
	}

	private void handleJson(Context context, InputStream din, String textCode) throws Exception
	{

		BufferedReader br = new BufferedReader(new InputStreamReader(din, textCode));
		String data = "";
		StringBuffer sb = new StringBuffer();
		while ((data = br.readLine()) != null)
		{
			sb.append(data);
		}
		String result = sb.toString();
		Log.d("result", result);

		JSONObject jsons = new JSONObject(result);
		String result_suc = jsons.optString("result");
		reason = jsons.optString("errorMessage");
		if (result_suc != null && "1".equals(result_suc.trim()))
		{
			succeed = true;
			
			String sql = "delete from " + DbHelper.TABLE_MENU_NAME + "";
			DbHelper.getInstance(context).executeSql(sql);
			
			JSONArray menus = jsons.optJSONArray("menu");
			if (menus != null && menus.length() > 0)
			{
				for (int i = 0; i < menus.length(); i++)
				{
					JSONObject menu = menus.optJSONObject(i);
					String title = menu.optString("title", "");
					String iconUrl = menu.optString("iconUrl", "");
					String url = menu.optString("url", "");
					String msgCount = menu.optString("msgCount", "");

					sql = "insert into " + DbHelper.TABLE_MENU_NAME 
							+ "(" + DbHelper.MENUTABLE_FIELD_TITLE + "," 
							+ DbHelper.MENUTABLE_FIELD_REQUESTURL+ "," 
							+ DbHelper.MENUTABLE_FIELD_ICONURL + "," 
							+ DbHelper.MENUTABLE_FIELD_MSGCOUNT 
							+ ")values('" 
							+ title + "','" 
							+ url + "','"
							+ iconUrl + "','" 
							+ msgCount + "')";
					DbHelper.getInstance(context).executeSql(sql);
				}
			}

		}
		else if (reason == null || reason.trim().length() < 1)
		{
			reason = App.HTTPREASON_SERVER;
		}

	}

}
