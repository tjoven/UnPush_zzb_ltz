package unigo.utility;

import java.util.HashMap;

import android.os.Bundle;

public final class Common
{
	public static final String layout = "http://localhost/res/raw/appex.json";
	public static final HashMap<String, Object> optConfig = new HashMap<String, Object>();
	public static final HashMap<String, Object> downFiles = new HashMap<String, Object>();
	public static final boolean debug = true;

	public static String urlApp = ""; // 业务接口地址
	public static String urlBase = ""; // 中间接口地址
	public static String verApp = ""; // 客户端版本
	public static String verToken = ""; // 客户端版本标识符，后台返回
	public static String authName = ""; // 资源访问权限用户
	public static String textcode = "utf-8";// 通信协议编码
	public static String updateClue = null; // 返回升级信息
	public static boolean bNeedUpdate = false;

	public static void onSaveInstanceState(Bundle outState)
	{
		outState.putString("common.urlApp", urlApp);
		outState.putString("common.urlBase", urlBase);
		outState.putString("common.verApp", verApp);
		outState.putString("common.verToken", verToken);
		outState.putString("common.authName", authName);
	}

	public static void onRestoreInstanceState(Bundle savedInstanceState)
	{
		urlApp = savedInstanceState.getString("common.urlApp");
		urlBase = savedInstanceState.getString("common.urlBase");
		verApp = savedInstanceState.getString("common.verApp");
		verToken = savedInstanceState.getString("common.verToken");
		authName = savedInstanceState.getString("common.authName");
	}
}
