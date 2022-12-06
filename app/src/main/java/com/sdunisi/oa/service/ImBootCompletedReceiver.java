package com.sdunisi.oa.service;

import unigo.utility.Log;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class ImBootCompletedReceiver extends BroadcastReceiver
{
	public void onReceive(Context context, Intent intent)
	{
		if(intent.getAction().equals(Intent.ACTION_BOOT_COMPLETED)){
			Log.write(2, "ImBootCompletedReceiver", "手机重启后启动服务。。","");
			Intent newIntent = new Intent(context,ImCoreService.class);
			context.startService(newIntent);
		} 
	} 
}
