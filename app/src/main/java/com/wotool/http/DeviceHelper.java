package com.wotool.http;

import com.unicom.baseoa.WebViewWnd;
import com.unicom.baseoa.update.LogException;

import android.os.Build;

public class DeviceHelper
{

	public static String getDeviceInfo()
	{
		// TODO Auto-generated method stub
		try{
		String type = Build.MODEL;
		String os = Build.VERSION.RELEASE;
		type = type.replace(" ", "%20");
		os = os.replace(" ", "");
		return type + "*android_" + os;
		}catch(Exception e){
			unigo.utility.Log.write(1, "WebViewWnd", "getDeviceInfo异常==="+ e.getMessage(),"");
			LogException.log(WebViewWnd.instance, e);
			return  "*android_" ;
		}
	}

}
