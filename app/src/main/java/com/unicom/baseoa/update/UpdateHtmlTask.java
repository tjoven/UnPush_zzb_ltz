package com.unicom.baseoa.update;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;


import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.scheme.SocketFactory;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;

import com.sdunisi.oa.version.Version;
import com.unicom.baseoa.splash.WndSplash;
import com.unicom.sywq.R;

import android.app.Activity;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.AsyncTask;
import android.util.Log;
import unigo.utility.FileUtil;
import com.unicom.baseoa.update.HttpClientUtil;;
public class UpdateHtmlTask extends AsyncTask<String, Object, Long> {

	private SharedPreferences settings;// 配置文件
	private Activity context;
	private PackageInfo pi;

	private AppVersion serverVersion;// 服务器上的版本号
	private String page_versions;// 服务器端的页面升级文件名称
	private String page_path;// 服务器端的页面升级文件的路径

	private static final String CUR_VERSION = "curVersionCode";

	public UpdateHtmlTask(Activity ac) {
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
		try {
			// 首先获取服务器版本号
			getVersionInfoFromServer();

			// 然后检测是否有大版本升级
			AppVersion localVersion = new AppVersion(pi.versionName);
			if (serverVersion.apkVersion > localVersion.apkVersion) {
				settings.edit().putBoolean("isUpdateAll", true).commit();
				new Version(context).check();// 电脑端壳版本>本地端壳版本，下载apk
				return null;
			}

			//最后下载更新页面升级包
			if ("1".equals(context.getString(R.string.IsopenZlsj))) { // 电脑端页面版本>本地页面版本
				updateHtml();
			}

		} catch (Exception e) {
			LogException.log(context, e) ;
		}
		return null;
	}

	@Override
	protected void onPostExecute(Long result) {
		// TODO Auto-generated method stub
		super.onPostExecute(result);
		if(WndSplash.instance!=null){
			WndSplash.instance.close = true;
		}
	}

	@Override
	protected void onProgressUpdate(Object... values) {
		// TODO Auto-generated method stub
		super.onProgressUpdate(values);
	}

	/**
	 * 升级页面
	 * 
	 * @param page_versions
	 * @param verNow
	 */
	private void updateHtml() {

		// 清理缓存
		clearCacheFolder(context.getCacheDir(), System.currentTimeMillis());
		
		String[] arr = page_versions.split(",");
		print("远程的页面:"+page_versions);
		
		AppVersion curVersion = new AppVersion(settings.getString(CUR_VERSION, pi.versionName));
		print("本地的页面:"+curVersion.toString());
		
		if(curVersion.htmlVersion == serverVersion.htmlVersion){
			settings.edit().putString("jackhtmlVersion", serverVersion.htmlVersion+"" ).commit();
			return ;
		}
		
		boolean updateHtmlSuccess = true;

		HttpParams params = new BasicHttpParams();
		HttpConnectionParams.setConnectionTimeout(params, 15000);
		HttpConnectionParams.setSoTimeout(params, 15000);
		//旧的方式只走http
		//DefaultHttpClient httpClient = new DefaultHttpClient(params);
		//新的方式支持https
		DefaultHttpClient httpClient = HttpClientUtil.getNewHttpClient(context);
 
		for (int i = 0; i < arr.length; i++) {
			
			try {
				if (Integer.parseInt(arr[i]) <= curVersion.htmlVersion) {
					continue;
				}
			} catch (Exception e) {
				continue;
			}

			String filename = settings.getString("httpMain", "") + page_path + "/update_" + arr[i] + ".zip";
			Log.e("UpdateHtmlTask", "filename="+filename);
			HttpGet httpGet = new HttpGet(filename);
			httpGet.setHeader("Content-type", "application/zip");
			// httpClient.getParams().setParameter(CoreConnectionPNames.SO_TIMEOUT,
			// 600000);

			try {
				HttpResponse response = httpClient.execute(httpGet);
				int code = response.getStatusLine().getStatusCode();
				if (code == 404) {
					print("404：" + filename);
					continue;
				}
				print("unzip：" + filename);
				InputStream ins = response.getEntity().getContent();
				BufferedOutputStream out = new BufferedOutputStream(
						new FileOutputStream(new File("/data/data/" + pi.packageName + "/files/temp.zip")));
				byte[] b = new byte[1024];
				int len = 0;
				while ((len = ins.read(b)) != -1) {
					if (len > 0) {
						out.write(b, 0, len);
					}
				}
				out.flush();
				out.close();
				ins.close();

				InputStream input = context.openFileInput("temp.zip");
				Log.e("FileUtil", "开始解压更新");
				new FileUtil().unZip(input, "/data/data/" + pi.packageName + "/files/");
				input.close();

				new File("/data/data/" + pi.packageName + "/files/temp.zip").delete();

				Log.e("gengxin", "更新成功");
				print("更新" + filename + "成功");
			} catch (Exception e) {
				Log.e("gengxin","更新失败 e:"+e);
				print("更新" + filename + "失败");
				LogException.log(context, e);
				updateHtmlSuccess = false;
				continue;
			}

		} // for_end

		if(updateHtmlSuccess){
			print("所有update包都已更新，更新版本号"+serverVersion.version);
			settings.edit().putString("curVersionCode", serverVersion.version).commit();
			settings.edit().putString("jackhtmlVersion", serverVersion.htmlVersion+"").commit();
		}
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

	/**
	 * 从服务器获取版本信息
	 * 
	 * @return
	 */
	private void getVersionInfoFromServer() throws Exception {

		Log.e("UpdateHtmlTask", "开始获取版本信息");
		// 获取请求版本号的url
		String url = settings.getString("httpMain", "") + context.getString(R.string.versionUrl);

		HttpParams params = new BasicHttpParams();
		HttpConnectionParams.setConnectionTimeout(params, 15000);
		HttpConnectionParams.setSoTimeout(params, 15000);
		//旧的方式只走http
		//DefaultHttpClient httpClient = new DefaultHttpClient(params);
		//新的方式支持https
		DefaultHttpClient httpClient = HttpClientUtil.getNewHttpClient(context);
		HttpGet httpGet = new HttpGet(url);
		
		HttpResponse response = httpClient.execute(httpGet);
		//Log.e("UpdateHtmlTask", "接口返回数据"+response);
		String serverResponse = "";
		// 判断是否请求成功
		if (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
			// 获得响应信息
			serverResponse = EntityUtils.toString(response.getEntity());
			//Log.e("UpdateHtmlTask", "serverResponse="+serverResponse);
		} else {
			//Log.e("UpdateHtmlTask","response="+response);
			// 网连接失败，使用Toast显示提示信息
			// Toast.makeText(context, "服务器连接异常", Toast.LENGTH_LONG).show();
			throw new Exception("获取不到服务器版本号!");
		}
		JSONObject jsons = new JSONObject(serverResponse);

		String verSrv = jsons.getString("version");
		serverVersion = new AppVersion(verSrv);
		page_versions = jsons.getString("page_versions");
		try {
			page_path = jsons.getString("page_path");
		} catch (Exception e) {
			page_path = "/upgrade";
		}

		print("请求版本号的接口=" + url);
		print("远程版本号=" + serverVersion + ",远程页面序列号=" + page_versions + ",远程页面存放路径=" + page_path);
	}

	private void print(final String text) {
		unigo.utility.Log.write(1, "UpdateHtmlTask", text, "");
//		context.runOnUiThread(new Runnable() {
//			@Override
//			public void run() {
//				Toast.makeText(context, text, Toast.LENGTH_LONG).show();
//			}
//		});
	}

	/**
	 * @author liuzz 版本号解析
	 */
	private class AppVersion {

		public String version;

		public float apkVersion;

		public int htmlVersion;

		public AppVersion(String versionStr) {
			version = versionStr;
			if (versionStr.indexOf("(") > -1) {
				String[] verNowArr = versionStr.split("\\(");
				apkVersion = Float.valueOf(verNowArr[0]).floatValue();
				htmlVersion = Integer.parseInt(verNowArr[1].substring(0, verNowArr[1].length() - 1));
			} else {
				apkVersion = Float.valueOf(versionStr).floatValue();
			}
		}

		@Override
		public String toString() {
			return "(version=" + version + ",apkVersion=" + apkVersion + ",htmlVersion=" + htmlVersion + ")";
		}

	}
}
