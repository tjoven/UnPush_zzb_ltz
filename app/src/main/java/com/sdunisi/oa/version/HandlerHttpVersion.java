package com.sdunisi.oa.version;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.json.JSONObject;

import com.unicom.baseoa.WebViewWnd;
import com.unicom.sywq.R;

import unigo.utility.ByteHelper;
import unigo.utility.HttpHandler;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.util.Log;

class HandlerHttpVersion extends HttpHandler
{
	private Activity context;
	private String ver = null, url = null;
	private boolean succeed;

	public HandlerHttpVersion(Activity context, InputStream din)
	{
		try
		{
			this.context = context;
			din = ByteHelper.debugInputStream(din, "utf-8");
			handleJson(din, "utf-8");
		}
		catch (Exception e)
		{
			Log.e("异常",e.getMessage());
		}
	}

	private void handleJson(InputStream din, String textCode) throws Exception
	{
		BufferedReader br = new BufferedReader(new InputStreamReader(din, textCode));

		String data = "";
		StringBuffer sb = new StringBuffer();
		while ((data = br.readLine()) != null)
		{
			sb.append(data);
		}
		String result = sb.toString();
		Log.e("result_version", result);
		JSONObject jsons = new JSONObject(result);
		String sucssNum = jsons.optString("result");
		if (sucssNum != null && sucssNum.contains("1"))
		{
			succeed = true;
		}
		while (succeed)
		{
			ver = jsons.optString("version");
			url = jsons.optString("url");
			check(ver, url);
			break;
		}
	}


	private void check(String ver, String url)
	{
		try
		{
			PackageManager pm = context.getPackageManager();
			PackageInfo pi = pm.getPackageInfo(context.getPackageName(), PackageManager.GET_ACTIVITIES);
			//float verNow = Float.valueOf(pi.versionName).floatValue();
			//float verSrv = Float.valueOf(ver).floatValue();

			//ver的格式4.0(3.12)
			final String verNow=pi.versionName;
			final String verSrv=ver;
			float verNowAn=0;//手机端壳的版本
			float verNowPc=0;//手机端页面的版本
			float verSrvAn=0;//电脑端壳的版本
			float verSrvPc=0;//电脑端页面的版本
			
			if(verNow.indexOf("(")>-1){
				String[] verNowArr=verNow.split("\\(");
				verNowAn=Float.valueOf(verNowArr[0]).floatValue();
				verNowPc=Float.valueOf(verNowArr[1].substring(0, verNowArr[1].length()-1)).floatValue();
			}else{
				verNowAn=Float.valueOf(verNow).floatValue();
				verNowPc=-1;
			}
			if(verSrv.indexOf("(")>-1){
				String[] verSrvArr=verSrv.split("\\(");
				verSrvAn=Float.valueOf(verSrvArr[0]).floatValue();
				verSrvPc=Float.valueOf(verSrvArr[1].substring(0, verSrvArr[1].length()-1)).floatValue();
			}else{
				verSrvAn=Float.valueOf(verSrv).floatValue();
				verSrvPc=-1;
			}
			String str = context.getString(R.string.SETTING_INFOS);
			SharedPreferences settings = context.getSharedPreferences(str, 0);
			boolean falg=false;
			if("0".equals(context.getString(R.string.IsopenZlsj))){
				if (verSrvAn>verNowAn || (verSrvPc>verNowPc&&verSrvPc!=-1&&verNowPc!=-1)){
					falg=true;
				}
			}else{
				if(settings.getBoolean("isUpdateAll", false)){
					falg=true;
				}
			}
			if (falg){
			//if (settings.getBoolean("isUpdateAll", true)){
				if (context instanceof Activity)
				{
					((Activity) context).runOnUiThread(new Runnable()
					{
						public void run()
						{
							alertUpdate();
						}
					});
				}
				else
				{
					update();
				}
			}else{
				if(context.toString().indexOf("WndConfig")>-1){
					if (context instanceof Activity)
					{
						((Activity) context).runOnUiThread(new Runnable()
						{
							public void run()
							{
								AlertDialog.Builder builder = new AlertDialog.Builder(context);
								builder.setTitle("当前版本已是最新版本\r\n["+verNow+"/"+verSrv+"]");
								builder.setCancelable(true);
								builder.setPositiveButton("确定", new DialogInterface.OnClickListener()
								{
									public void onClick(DialogInterface dialog, int id)
									{
										dialog.dismiss();
									}
								});
								AlertDialog alert = builder.create();
								alert.show();
							}
						});
					}
				}
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}

	private void update()
	{

		DownApk down = new DownApk(context);
		down.down(url);
	}
	

	private void alertUpdate()
	{
		AlertDialog.Builder builder = new AlertDialog.Builder(context);
		builder.setTitle("检测到新版本，请点击【确定】按钮进行升级！");
		builder.setCancelable(false);
		builder.setPositiveButton("确定", new DialogInterface.OnClickListener()
		{
			public void onClick(DialogInterface dialog, int id)
			{
				update();
				dialog.dismiss();
			}
		});
//		builder.setNegativeButton("取消", new DialogInterface.OnClickListener()
//		{
//			public void onClick(DialogInterface dialog, int id)
//			{
//				dialog.dismiss();
//			}
//		});
		AlertDialog alert = builder.create();
		alert.show();
	}
}
