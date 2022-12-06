package com.unicom.baseoa.update;

import java.io.File;
import java.io.InputStream;

import com.unicom.baseoa.WebViewWnd;
import com.unicom.sywq.R;

import android.app.Activity;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.AsyncTask;
import android.util.Log;
import unigo.utility.FileUtil;

public class InitDataTask extends AsyncTask<String, Object, Long> {

	private SharedPreferences settings;// 配置文件
	private Activity context;
	private PackageInfo pi;

	public InitDataTask(Activity ac) {
		context = ac;
		settings = context.getSharedPreferences(context.getString(R.string.SETTING_INFOS), 0);
		// 获取包名
		PackageManager pm = context.getPackageManager();
		try {
			pi = pm.getPackageInfo(context.getPackageName(), PackageManager.GET_ACTIVITIES);
		} catch (NameNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Override
	protected Long doInBackground(String... arg0) {

		settings = context.getSharedPreferences(context.getString(R.string.SETTING_INFOS), 0);
		final boolean updateAll = settings.getBoolean("isUpdateAll", true);
		print("updateAll=" + updateAll);
		if (!updateAll) return null;
		try {
			File f = new File("data/data/" + pi.packageName + "/files/wap_html");
			clearCacheFolder(f, System.currentTimeMillis());
			clearCacheFolder(context.getCacheDir(), System.currentTimeMillis());
			if (f.exists()) {
				f.delete();
			}
			InputStream in = context.getResources().getAssets().open("wap_html.zip");
			new FileUtil().unZip(in, "/data/data/" + pi.packageName + "/files/");
			in.close();
			settings.edit().putBoolean("isUpdateAll", false).commit();
			print("unzip success");
		} catch (Exception ex) {
			LogException.log(context, ex);
		}

		return null;
	}

	/**
	 * 清除缓存
	 * 
	 * @param dir
	 * @param numDays
	 * @return
	 */
	private int clearCacheFolder(File dir, long numDays) {
		int deletedFiles = 0;
		if (dir != null && dir.isDirectory()) {
			try {
				for (File child : dir.listFiles()) {
					if (child.isDirectory()) {
						deletedFiles += clearCacheFolder(child, numDays);
					}
					if (child.lastModified() < numDays) {
						if (child.delete()) {
							deletedFiles++;
						}
					}
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return deletedFiles;
	}

	private void print(final String text) {
		unigo.utility.Log.write(1, "InitDataTask", text, "");
//		context.runOnUiThread(new Runnable() {
//			@Override
//			public void run() {
//				Toast.makeText(context, text, Toast.LENGTH_LONG).show();
//			}
//		});
	}

	@Override
	protected void onPostExecute(Long result) {
		// TODO Auto-generated method stub
		//测试
		//Log.e("InitDataTask", "result="+result);
		super.onPostExecute(result);
		WebViewWnd.instance.loadInitHtml();
	}

}
