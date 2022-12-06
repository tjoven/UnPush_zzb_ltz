package com.sdunisi.oa.service;

import unigo.utility.Log;

import com.sdunisi.oa.im.WakeUpHelper;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo.State;

public class NetworkChangeReceiver extends BroadcastReceiver
{
	public void onReceive(Context context, Intent intent)
	{
		try
		{
			ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
			State wifiState = cm.getNetworkInfo(ConnectivityManager.TYPE_WIFI).getState();
			State mobileState = cm.getNetworkInfo(ConnectivityManager.TYPE_MOBILE).getState();
			
			if(!WakeUpHelper.isNetworkAvailable(context))
			{
				Log.write(2, "ImRecevicer.onReceive", "network333333333====="+WakeUpHelper.isNetworkAvailable(context),"");
				WakeUpHelper.acquireStaticLock(context);
				WakeUpHelper.releaseStaticLock(context);
				Log.write(2, "ImRecevicer.onReceive", "network444444444====="+WakeUpHelper.isNetworkAvailable(context),"");
			}
			
		}
		catch (Exception e)
		{
		}
	}
}
