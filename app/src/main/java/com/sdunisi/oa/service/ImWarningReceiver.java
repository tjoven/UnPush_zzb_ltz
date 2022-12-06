package com.sdunisi.oa.service;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class ImWarningReceiver extends BroadcastReceiver
{
	public void onReceive(Context context, Intent intent)
	{
		NoticeHelper.notice(context);
	}
}
