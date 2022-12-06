package com.wotool.http;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import org.json.JSONObject;

import com.sdunisi.oa.App;

import unigo.utility.HttpHandler;
import android.content.Context;
import android.util.Log;

public class HandleHttpDocDown extends HttpHandler
{
	private boolean succeed = false;
	private String reason = null;
	private String cardURL = null;


	public HandleHttpDocDown(Context context, InputStream din, String textCode,String url)
	{
		try
		{
			handleJson(context, din, textCode,url);
		}
		catch (Exception e)
		{
			reason = App.HTTPREASON_LOCALPARSE;
		}
	}

	public boolean getSucceed()
	{
		return succeed;
	}

	public String getReason()
	{
		return reason;
	}
	public String getCardURL() {
		return cardURL;
	}

	private void handleJson(Context context, InputStream din, String textCode,String file) throws Exception
	{

//		BufferedReader br = new BufferedReader(new InputStreamReader(din, textCode));
//		String data = "";
//		StringBuffer sb = new StringBuffer();
//		while ((data = br.readLine()) != null)
//		{
//			sb.append(data);
//		}
//		String result = sb.toString();
//		Log.d("result", result);
//
//		JSONObject jsons = new JSONObject(result);
//		String result_suc = jsons.optString("result");
//		reason = jsons.optString("errorMessage");
//		if (result_suc != null && "1".equals(result_suc.trim()))
//		{
//			succeed = true;
//		}
//		else if (reason == null || reason.trim().length() < 1)
//		{
//			reason = App.HTTPREASON_SERVER;
//		}
		String path="";
		if (android.os.Environment.getExternalStorageState().equals(android.os.Environment.MEDIA_MOUNTED))
		{
			path = android.os.Environment.getExternalStorageDirectory().getPath();
			if (!path.endsWith("/"))
			{
				path += "/";
			}
			path = path + "Undownload/";
			File tmpFile = new File(path);
			if (!tmpFile.exists())
			{
				boolean suc = tmpFile.mkdir();
				if (!suc)
					Log.d("file make dir suc", "false");
			}
			
		}

		
		FileOutputStream fout = null;
		try
		{
			File f=null;
			int idx = file.lastIndexOf('/');
			if (idx > 0)
			{
				 f = new File(path+file.substring(idx, file.length()));
				 cardURL=f.toString();
			}
			if(!f.exists()){
				byte[] buff = new byte[1024];
				fout = new FileOutputStream(f);
				while (true)
				{
					int len = din.read(buff);
					if (len < 0)
						break;
					else if (len == 0)
						continue;
					fout.write(buff, 0, len);
				}
			}
			succeed=true;
		}catch (Exception e){
			e.printStackTrace();
			reason = "打开文件失败！";
		}
		try{
			fout.close();
		}catch (Exception e){
		}
	}

}
