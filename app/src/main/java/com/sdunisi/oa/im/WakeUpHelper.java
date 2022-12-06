package com.sdunisi.oa.im;

import unigo.utility.Log;
import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.PowerManager;

public class WakeUpHelper
{
	public static final String LOCK_NAME_STATIC = "safecampus";
	private static PowerManager.WakeLock lockStatic = null;

	public static void acquireStaticLock(Context context)
	{
		getLock(context).acquire();
		Log.write(2, "WakeUpHelper", "wake up cpu","");
	}

	synchronized private static PowerManager.WakeLock getLock(Context context)
	{
		if (lockStatic == null)
		{
			PowerManager mgr = (PowerManager) context.getSystemService(Context.POWER_SERVICE);

			lockStatic = mgr.newWakeLock(PowerManager.SCREEN_DIM_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP | PowerManager.ON_AFTER_RELEASE, LOCK_NAME_STATIC);
			lockStatic.setReferenceCounted(true);
		}

		return (lockStatic);
	}

	public static void releaseStaticLock(Context context)
	{
		getLock(context).release();
		Log.write(2, "WakeUpHelper", "close wake up cpu","");
	}
	
	public static boolean isScreenOn(Context context) {
		
		PowerManager mgr = (PowerManager) context
				.getSystemService(Context.POWER_SERVICE);
		Log.write(2, "WakeUpHelper.isScreenOn", "mgr.isScreenOn()====="+mgr.isScreenOn(),"");
		return mgr.isScreenOn();
	}
	public static boolean isNetworkAvailable(Context aContext)
	{

		ConnectivityManager connectivity = (ConnectivityManager) aContext.getSystemService(Context.CONNECTIVITY_SERVICE);
		if (connectivity == null)
		{
			return false;
		}
		else
		{
			// NetworkInfo[] info = connectivity.getAllNetworkInfo();
			NetworkInfo active = connectivity.getActiveNetworkInfo();
			if (active != null && active.isAvailable() && active.isConnected())
			{
				Log.write(2, "WakeUpHelper.isNetworkAvailable", "true====="+true,"");
				// Mlog.write("active network:" + active.getTypeName() +
				// "\r\n");
				return true;
			}
			else
			{
				Log.write(2, "WakeUpHelper.isNetworkAvailable", "false====="+false,"");
				// Mlog.write("active network:null" + "\r\n");
			}

		}
		return false;
	}

}
