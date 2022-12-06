package com.unicom.baseoa.update;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;
import java.lang.reflect.Field;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Build;
import android.os.Environment;
import android.util.Log;

public class LogException {
	public static String log(Context context,Throwable ex) {
		Map<String, String> info = new HashMap<String, String>();// 用来存储设备信息和异常信息
		collectDeviceInfo(context,info);
		
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd-HH-mm-ss");// 用于格式化日期
		StringBuffer sb = new StringBuffer();
		String time = format.format(new Date());
		File dir = new File(Environment.getExternalStorageDirectory().getAbsolutePath() + File.separator + "Unlog");
		String fileName = "crasherror2.log";
		if (!new File(dir, fileName).exists()) {
			for (Map.Entry<String, String> entry : info.entrySet()) {
				String key = entry.getKey();
				String value = entry.getValue();
				sb.append(key + "=" + value + "\r\n");
			}
		}
		sb.append(time + "\r\n");
		Writer writer = new StringWriter();
		PrintWriter pw = new PrintWriter(writer);
		ex.printStackTrace(pw);
		Throwable cause = ex.getCause();
		// 循环着把所有的异常信息写入writer中
		while (cause != null) {
			cause.printStackTrace(pw);
			cause = cause.getCause();
		}
		pw.close();// 记得关闭
		String result = writer.toString();
		sb.append(result);
		System.out.println(sb);
		// 保存文件
		if (Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)) {
			try {
				Log.i("CrashHandler", dir.toString());
				if (!dir.exists())
					dir.mkdir();
				FileOutputStream fos = new FileOutputStream(new File(dir, fileName), true);
				fos.write(sb.toString().getBytes());
				fos.close();
				return fileName;
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return null;
	}
	
	/**
	 * 收集设备参数信息
	 * 
	 * @param context
	 */
	private static void collectDeviceInfo(Context context,Map<String, String> info) {
		try {
			PackageManager pm = context.getPackageManager();// 获得包管理器
			PackageInfo pi = pm.getPackageInfo(context.getPackageName(),
					PackageManager.GET_ACTIVITIES);// 得到该应用的信息，即主Activity
			if (pi != null) {
				String versionName = pi.versionName == null ? "null"
						: pi.versionName;
				String versionCode = pi.versionCode + "";
				info.put("versionName", versionName);
				info.put("versionCode", versionCode);
			}
		} catch (NameNotFoundException e) {
			e.printStackTrace();
		}

		Field[] fields = Build.class.getDeclaredFields();// 反射机制
		for (Field field : fields) {
			try {
				field.setAccessible(true);
				info.put(field.getName(), field.get("").toString());
			} catch (IllegalArgumentException e) {
				e.printStackTrace();
			} catch (IllegalAccessException e) {
				e.printStackTrace();
			}
		}
	}
}
