package com.unicom.baseoa.util;

import java.net.HttpURLConnection;
import java.net.URL;

import unigo.utility.Log;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

public class NetConnection {
	/**
	 * 
	 * isConnected()        
	 * @param   Context    
	 * @return boolean      
	 * @Exception 异常对象    
	 * @创建人：ligw    
	 * @创建时间：2013-1-7下午03:22:27
	 * @修改人：
	 * @修改时间：
	 */
	public static boolean isConnected(final Context ctx)
	{
		ConnectivityManager connectivity = (ConnectivityManager) ctx.getSystemService(Context.CONNECTIVITY_SERVICE);
		if (connectivity == null)
		{
			return false;
		}
		else
		{
			NetworkInfo[] info = connectivity.getAllNetworkInfo();
			if (info != null)
			{
				for (int i = 0; i < info.length; i++)
				{
					if (info[i].getState() == NetworkInfo.State.CONNECTED||info[i].isConnected())
					{
						return true;
					}
				}
			}
		}
		return false;
	}
	
	 /**
     * 检查网络是否正常
     * @param strURL
     * @param strEncoding
     * @return
     */
    public static boolean checkInternetConnection (String strURL, String strEncoding){ 
      int intTimeout = 5; 
      try 
      { 
        HttpURLConnection urlConnection= null; 
        URL url = new URL(strURL); 
        urlConnection=(HttpURLConnection)url.openConnection(); 
        urlConnection.setRequestMethod("GET"); 
        urlConnection.setDoOutput(true); 
        urlConnection.setDoInput(true); 
        urlConnection.setRequestProperty 
        ( 
          "User-Agent","Mozilla/4.0"+ 
          " (compatible; MSIE 6.0; Windows 2000)" 
        ); 
         
        urlConnection.setRequestProperty 
        ("Content-type","text/html; charset="+strEncoding);      
        urlConnection.setConnectTimeout(1000*intTimeout); 
        urlConnection.connect(); 
        if (urlConnection.getResponseCode() == 200) 
        { 
          return true; 
        } 
        else 
        { 
          return false; 
        } 
      } 
      catch (Exception e) 
      { 
    	  Log.write(1, "地址："+strURL, e.getLocalizedMessage().toString(),"");
    	  e.printStackTrace(); 
    	  return false; 
      } 
    }
}
