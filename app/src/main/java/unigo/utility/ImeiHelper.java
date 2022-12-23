package unigo.utility;

import com.unicom.baseoa.WebViewWnd;
import com.unicom.baseoa.update.LogException;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.telephony.TelephonyManager;
import android.text.TextUtils;

public class ImeiHelper
{
//	public static String getImei(Context context)
//	{
//		String str = "";
//		try
//		{
//			TelephonyManager tm = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
//			String imei = tm.getSimSerialNumber();
//			str = imei.trim();
//		}
//		catch (Exception e)
//		{
//			str="123456789";
//		}
//		return str;
//	}
	
	public static String getImei(Context context)
	{
		String str = "";
		try
		{
			TelephonyManager tm = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
			String imei = tm.getSimSerialNumber();//sim卡序列号
			if(!TextUtils.isEmpty(imei)){
				str = imei.trim();
			}

		}
		catch (Exception e)
		{
			//unigo.utility.Log.write(1, "WebViewWnd", "getSimSerialNumber异常==="+ e.getMessage(),"");
			LogException.log(WebViewWnd.instance, e);
			try{
				TelephonyManager tm = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
				String imei = tm.getDeviceId();//设备id
				str = imei.trim();
			}catch(Exception e2){
				str="123456789";
				unigo.utility.Log.write(1, "WebViewWnd", "getDeviceId异常==="+ e2.getMessage(),"");
				LogException.log(WebViewWnd.instance, e2);
			}
		}
		return str;
	}
	
	//根据手机卡判断所属运营商   1-为联通   0-为移动电信
	public static String getImsi(Context context)
	{
		String str = "";
		try
		{
			str = getImsiLogin(context);
			if(str!=null&&!"".equals(str)){
				if(str.startsWith("46001")){//联通
					str="1";
				}else if(str.startsWith("46000")||str.startsWith("46002")){//移动以46000和46002开头
					str="2";
				}else {//电信以46003开头
					str="3";
				}
			}
		}
		catch (Exception e)
		{
		}
		return str;
	}
	public static String getImsiLogin(Context context) {
		String str="46001123456";
		try{
		TelephonyManager tm = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
		String imsi=tm.getSubscriberId();
		if(imsi!=null&&!"".equals(imsi)){
			str = imsi.trim();
		}
		return str;
		}catch(Exception e){
			unigo.utility.Log.write(1, "WebViewWnd", "getSubscriberId异常==="+ e.getMessage(),"");
			LogException.log(WebViewWnd.instance, e);
			return str;
		}
	}

	public static String getVersion(Context context)
	{
		String str = "";
		try
		{
			PackageManager pm = context.getPackageManager();
			PackageInfo pi = pm.getPackageInfo(context.getPackageName(), PackageManager.GET_ACTIVITIES);
			str = pi.versionName;
		}
		catch (Exception e)
		{
		}
		return str;
	}
}
