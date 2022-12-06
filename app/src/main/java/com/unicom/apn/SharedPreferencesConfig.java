package com.unicom.apn;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;

public class SharedPreferencesConfig {
	private Context iContext;
	public static final String INWAP = "inWap";
	public static final String REMEMBERSTATUS = "rememberStatus";
	public static final String NET = "net";
	public static final String OUTNET = "outNet";
	/*
	 * 构造函数
	 */
	public SharedPreferencesConfig(Context context) {
		iContext=context;
	}
	/** 
	*	set 是否记忆自动切换  是1；否2
	*/	
	public void setRememberStatus(java.lang.String value){
		SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(iContext);
		SharedPreferences.Editor editor = settings.edit(); 
		editor.putString(REMEMBERSTATUS, value); 
		editor.commit(); 
	}
	/** 
	*	return 是否记忆自动切换   是1；否2
	*/	
	public java.lang.String getRememberStatus() {
		SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(iContext);
		return settings.getString(REMEMBERSTATUS, "2");
	}
	/** 
	*	set 保存内网参数
	*/	
	public void setNet(long id){
		SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(iContext);
		SharedPreferences.Editor editor = settings.edit(); 
		editor.putLong(NET, id); 
		editor.commit(); 
	}
	/** 
	*	return 保存内网参数
	*/
	public long getNet() {
		SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(iContext);
		return settings.getLong(NET, 0);
	}
	/** 
	*	set 保存外网参数
	*/	
	public void setOutNet(long id){
		SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(iContext);
		SharedPreferences.Editor editor = settings.edit(); 
		editor.putLong(OUTNET, id); 
		editor.commit(); 
	}
	/** 
	*	return 保存外网参数
	*/
	public long getOutNet() {
		SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(iContext);
		return settings.getLong(OUTNET, 0);
	}
}
