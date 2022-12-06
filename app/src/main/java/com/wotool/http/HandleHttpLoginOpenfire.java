package com.wotool.http;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import org.json.JSONObject;

import com.sdunisi.oa.App;

import unigo.utility.HttpHandler;
import android.content.Context;
import android.util.Log;

public class HandleHttpLoginOpenfire extends HttpHandler
{
	private boolean succeed = false;
	private String reason = null;

	public HandleHttpLoginOpenfire(Context context, InputStream din, String textCode)
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
		}
		else if (reason == null || reason.trim().length() < 1)
		{
			reason = App.HTTPREASON_SERVER;
		}

	}

}
