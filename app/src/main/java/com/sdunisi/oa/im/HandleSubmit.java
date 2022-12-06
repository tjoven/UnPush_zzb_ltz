package com.sdunisi.oa.im;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.json.JSONObject;

import unigo.utility.HttpHandler;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.sdunisi.oa.App;
import com.unicom.sywq.R;

public class HandleSubmit extends HttpHandler
{
	private boolean bSucceed = false;
	private String reason = null;

	public HandleSubmit(Context context, InputStream din, String textCode)
	{
		try
		{
			handleJson(context,din, textCode);
		}
		catch (Exception e)
		{
			reason ="发送失败，请重试！";
		}
	}

	public boolean isSucceed()
	{
		return bSucceed;
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
		bSucceed = jsons.optString("result").contains("1");
		reason = jsons.optString("msg");
		if(bSucceed)
		{
			if(jsons.has("token"))
			{
				String token=jsons.optString("token");
				App.token = token;
				String str = context.getString(R.string.SETTING_INFOS);
				SharedPreferences settings = context.getSharedPreferences(str, 0);
				settings.edit().putString("sys_token_khd", token).commit();
			}
		}
	}

}
