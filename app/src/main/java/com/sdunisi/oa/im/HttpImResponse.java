package com.sdunisi.oa.im;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URLEncoder;

import unigo.utility.Common;
import unigo.utility.HttpBase;
import unigo.utility.RunCancelable;
import unigo.utility.StringHelper;
import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.sdunisi.oa.App;
import com.sdunisi.oa.service.IdbHelper;
import com.unicom.sywq.R;

public class HttpImResponse extends HttpBase implements RunCancelable
{
	private final String URL = "/khd/msg.do?method=reply";
	private boolean bSucceed = false;
	// private Handler handler = null;
	// private Message message = null;
	private String reason = "";
	private HandleSubmit handleSubmit = null;
	private String time;
	private String messageId;
	private Context context;
	private int flag = 0;
	private String user;
	private String tag = "HttpImResponse";

	public HttpImResponse(int flag, Context context, String messageId)
	{
		// TODO Auto-generated constructor stub
		this.messageId = messageId;
		this.context = context;
		this.flag = flag;
		
		long when = System.currentTimeMillis();
		String str = context.getString(R.string.SETTING_INFOS);
		SharedPreferences settings = context.getSharedPreferences(str, 0);
		try
		{
			str = settings.getString("httpMain", "") + URL;
			str = str + "&id=" + messageId;
			str = str + "&time=" + URLEncoder.encode(StringHelper.getTimeYMDHMSbySeparator(when),"UTF-8");

			if (flag == 0)
			{
				str = str + "&type=arrive";
			}
			else
			{
				str = str + "&type=read";

			}

			SharedPreferences settings2 = PreferenceManager.getDefaultSharedPreferences(context);
			String username = settings2.getString(App.IM_USERNAME_KEY, "");
			String password = settings2.getString(App.IM_PASSWORD_KEY, "");
			str = str + "&UserName=" + username;
			str = str + "&Password=" + password;
			str = str + "&sys_token_khd=" + settings.getString("sys_token_khd", "");
			//str = URLEncoder.encode(str, "UTF-8");
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		
		setUrl(str);
		setMethod("GET");
		
		
		if (Common.debug)
		{
			Log.d(tag, str);

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

	public String getTime()
	{
		return time;
	}

	public String getMessageId()
	{
		return messageId;
	}

	public String getUsername()
	{
		return user;
	}

	@Override
	public void run()
	{
		// TODO Auto-generated method stub
		startHttp();
	}

	@Override
	public void cancel()
	{
		// TODO Auto-generated method stub
		cancelHttp();
	}

	protected void setRequestProperty(HttpURLConnection conn)
	{
		conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
	}

	protected void end(int code, String err)
	{
		if (code != 200)
		{
			this.bSucceed = false;
			this.reason = reason + code + err;
		}
		if (handleSubmit != null)
		{
			this.bSucceed = handleSubmit.isSucceed();
			this.reason = reason + handleSubmit.getReason();
		}
		Log.d(tag, bSucceed + reason);
		if (bSucceed && context != null)
		{
			if (flag == 1)
				IdbHelper.getInstance(context).updateMessageRead(messageId, time);
			else
				IdbHelper.getInstance(context).updateMessageReceive(messageId, time);
		}
		// message.obj = this;
		// handler.sendMessage(message);
	}

	protected void GetRecvData(InputStream din)
	{
		try
		{
			handleSubmit = new HandleSubmit(context, din, "utf-8");
		}
		catch (Exception e)
		{
			reason += e.getMessage();
		}
	}

}
