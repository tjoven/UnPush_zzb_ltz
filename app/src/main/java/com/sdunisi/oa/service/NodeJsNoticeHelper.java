package com.sdunisi.oa.service;

import java.util.Calendar;
import java.util.TimeZone;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import unigo.utility.HttpRun;
import unigo.utility.RunCancelable;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.preference.PreferenceManager;

import com.sdunisi.oa.App;
import com.sdunisi.oa.im.WndNotice;
import com.unicom.baseoa.WebViewWnd;
import com.unicom.sywq.R;

public class NodeJsNoticeHelper extends HttpRun
{

	public NodeJsNoticeHelper(Context context,String msg)
	{
		notice(context, true, true,msg);
	}
	public NodeJsNoticeHelper(Context context,JSONObject arguments)
	{
		ChatNotice(context, true, true,arguments);
	}
	static public void notice(Context context, boolean ifSound, boolean ifVibrate,String message)
	{
		NotificationManager mNotificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

		String msg = "n条未读";
		int icon = R.drawable.icon;
		long when = System.currentTimeMillis();
		CharSequence tickerText = "有新消息";

		Notification notification = new Notification(icon, tickerText, when);
		notification.flags = Notification.FLAG_AUTO_CANCEL;
		notification.defaults |= Notification.DEFAULT_LIGHTS;
		Calendar cal = Calendar.getInstance(TimeZone.getDefault());
		int h = cal.get(Calendar.HOUR_OF_DAY);
		if(h<8||h>21){
			ifSound=false;
			ifVibrate=false;
		}
		if (ifSound){
			notification.defaults |= Notification.DEFAULT_SOUND;
		}
		if (ifVibrate){
			notification.defaults |= Notification.DEFAULT_VIBRATE;
		}
		notification.number = 0;
		CharSequence contentTitle = tickerText;
		CharSequence contentText = message;
		Intent notificationIntent = new Intent(context, WebViewWnd.class);
		notificationIntent.putExtra("URL", context.getString(R.string.noticeUrl));
		notificationIntent.putExtra("ChatOrNotice", "0");
		notificationIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
		PendingIntent contentIntent = null;
		contentIntent = PendingIntent.getActivity(context, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);
		notification.setLatestEventInfo(context, contentTitle, contentText, contentIntent);
		mNotificationManager.notify(1, notification);

		// alarm 未读提醒。
		//alarmUnread(context);

	}

	static public void ChatNotice(Context context, boolean ifSound, boolean ifVibrate,JSONObject arguments)
	{
		String title="",text="",url="";
		try {
			title = "有新消息";
			text = arguments.getString("msg");
//			text=arguments.getString("text");
			url=arguments.getString("url");
		} catch (JSONException e) {
			e.printStackTrace();
		}
			NotificationManager mNotificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
			int icon = R.drawable.icon;
			long when = System.currentTimeMillis();
			CharSequence tickerText = title;
			Notification notification = new Notification(icon, tickerText, when);
			notification.flags = Notification.FLAG_AUTO_CANCEL;
			notification.defaults |= Notification.DEFAULT_LIGHTS;
			Calendar cal = Calendar.getInstance(TimeZone.getDefault());
			int h = cal.get(Calendar.HOUR_OF_DAY);
			if(h<8||h>21){
				ifSound=false;
				ifVibrate=false;
			}
			if (ifSound){
				notification.defaults |= Notification.DEFAULT_SOUND;
			}
			if (ifVibrate){
				notification.defaults |= Notification.DEFAULT_VIBRATE;
			}
			notification.number = 0;
			CharSequence contentTitle = tickerText;
			CharSequence contentText = text;
			Intent notificationIntent = new Intent(context, WebViewWnd.class);
			notificationIntent.putExtra("URL", url);
			notificationIntent.putExtra("ChatOrNotice", "1");
			notificationIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
			PendingIntent contentIntent = null;
			contentIntent = PendingIntent.getActivity(context, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);
			notification.setLatestEventInfo(context, contentTitle, contentText, contentIntent);
			mNotificationManager.notify(2, notification);
	}
	
	static private void alarmUnread(Context context)
	{

		long period = IdbHelper.getInstance(context).getNoticePeriod();
		if (period <= 0)
		{
			return;
		}
		AlarmManager alarmMgr = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
		Intent intent = new Intent();
		intent.setAction("com.sdunisi.oa.service.IM_WARNING_ACTION");
		intent.putExtra("bAlarm", true);
		int requestCode = 0;
		PendingIntent pendIntent = PendingIntent.getBroadcast(context.getApplicationContext(), requestCode, intent, PendingIntent.FLAG_CANCEL_CURRENT);
		alarmMgr.cancel(pendIntent);
		// 按时间段发送广播
		try
		{

			SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(context);
			SharedPreferences.Editor edit = settings.edit();
			edit.putLong(App.IM_NOTICEPERIOD_KEY, period);
			edit.commit();

		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		long l = System.currentTimeMillis();

		l += period;
		alarmMgr.set(AlarmManager.RTC_WAKEUP, l, pendIntent);
	}

	static public void notifyLogin(Context context, boolean ifCancel)
	{
		NotificationManager mNotificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
		if (ifCancel)
		{
			mNotificationManager.cancel(2);
			return;
		}

		String msg = "请点击重新登录！";
		int icon = R.drawable.icon;
		long when = System.currentTimeMillis();
		CharSequence tickerText = "不能获取新消息";
		Notification notification = new Notification(icon, tickerText, when);
		notification.flags = Notification.FLAG_AUTO_CANCEL;
		notification.defaults |= Notification.DEFAULT_SOUND;
		notification.defaults |= Notification.DEFAULT_VIBRATE;
		CharSequence contentTitle = tickerText;
		CharSequence contentText = msg;
		Intent notificationIntent = new Intent(context, WebViewWnd.class);
		notificationIntent.putExtra("URL", "");
		notificationIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
		PendingIntent contentIntent = null;
		contentIntent = PendingIntent.getActivity(context, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);
		notification.setLatestEventInfo(context, contentTitle, contentText, contentIntent);
		mNotificationManager.notify(2, notification);

	}
}
