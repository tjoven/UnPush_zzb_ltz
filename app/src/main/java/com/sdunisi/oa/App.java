package com.sdunisi.oa;

import android.content.Context;
import android.provider.Settings;
import android.util.Log;

public class App 
{
	public static final String ACCOUNT_USERNAME_KEY = "account_username";
	
	public static final String ACCOUNT_PASSWORD_KEY = "account_password";
	
   public static final String IM_USERNAME_KEY = "user.default.nameIm";
	
   public static final String IM_PASSWORD_KEY = "user.default.passIm";
   
   public static final String IM_ZZID_KEY = "user.default.zzidIm";
   
   public static final String IM_DEVICE_KEY = "user.default.deviceIm";
   public static final String IM_IMEI_KEY = "user.default.imeiIm";
   public static final String IM_IMSI_KEY = "user.default.imsiIm";
   
   public static final String IM_NOTICEPERIOD_KEY = "user.default.noticePeriodIm";
   
   public static final String ACCOUNT_SAVEPWD_KEY = "save_pwd";
   
   public static final String ACCOUNT_LOGIN_KEY = "account_login";
   
   public static final String MAINURL="/login.do?method=validate_iphone";
   
   public static final String GridViewUrl="/login.do?method=khd_menu&khd=wap3";
   
   public static final String ExitWap="/login.do?method=exit_wap";
   
   //public static final String ExitWap_2="/mobile/index.jsp";
   
   public static String token="";
   
   public static boolean isChatPage=false;
   public static String ChatwithYh="";
   
   public static String HTTPREASON_SERVER = "服务器内部错误，请尝试重新登录或与后台工作人员联系！";
   public static String HTTPREASON_LOCALPARSE = "数据解析错误，请重试！";
   
   
	public static boolean isAirplaneModeOn(Context context)
	{
		boolean on = false;
		try
		{
			on = Settings.System.getInt(context.getContentResolver(), Settings.System.AIRPLANE_MODE_ON, 0) != 0;
		}
		catch(Exception e)
		{
			e.printStackTrace();
			Log.d("airplane", e.toString());
		}
		return on;
	}
}
