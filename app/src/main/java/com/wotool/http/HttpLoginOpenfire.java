package com.wotool.http;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URLEncoder;
import unigo.utility.Common;
import unigo.utility.HttpRun;
import android.content.SharedPreferences;
import android.util.Log;
import com.sdunisi.oa.service.ImCoreService;
import com.unicom.sywq.R;

public class HttpLoginOpenfire extends HttpRun
{
	private boolean succeed;
	private String reason;
	private ImCoreService context;
	public static final String TAG = "HttpLogin";
	private final String URL = "/khd/login.do?method=check";
	private HandleHttpLoginOpenfire handleHttploginOpenfire;

	public HttpLoginOpenfire(ImCoreService context, String[] strs)
	{

		this.context = context;
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
			handleHttploginOpenfire = new HandleHttpLoginOpenfire(context, din, "utf-8");
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
		if (handleHttploginOpenfire != null)
		{
			succeed = handleHttploginOpenfire.getSucceed();
			reason = handleHttploginOpenfire.getReason();
		}

		
		/*if (context != null)
		{
			RunnableEx re = new RunnableEx(this)
			{
				protected void doRun(Object obj)
				{
					context.onHttpLoginOpenfire((HttpLoginOpenfire) obj);
				}
			};
			//context.runOnUiThread(re);
		}*/
		//context.onHttpLoginOpenfire((HttpLoginOpenfire) this);

	}



	protected void setRequestProperty(HttpURLConnection conn)
	{
		conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
	}

	public interface OnHttpLoginListener
	{
		public void onHttpLoginOpenfire(HttpLoginOpenfire http);
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
