package com.unicom.baseoa.imgcache;

import java.io.File;
import java.util.Arrays;

import com.unicom.baseoa.WebViewWnd;
import com.unicom.baseoa.update.LogException;

import android.widget.Toast;

public class ImgCache {

	public static String getImgCardUrl(String url) {
		try{
		String fileName = getFileNameFromUrl(url);
		if (android.os.Environment.getExternalStorageState().equals(android.os.Environment.MEDIA_MOUNTED)) {
			String path = android.os.Environment.getExternalStorageDirectory().getPath();
			if (!path.endsWith("/")) {
				path += "/";
			}
			path = path + "Undownload/ImgCache/"+fileName;
			if (new File(path)!=null && new File(path).exists()) {
				print("111");
				return path;
			} else {
				DownImg di = new DownImg(url, fileName);
				di.startHttp();
				print(di.getCardURL());
				if (new File(di.getCardURL())!=null && new File(di.getCardURL()).exists()) {
					return di.getCardURL();
				}
			}
		}}catch(Exception e){
			LogException.log(WebViewWnd.instance, e);
		}
		return null;
	}

	public static boolean isImgHttpUrl(String url) {
		url = url == null ? "" : url;
		print("url="+url);
		if(!url.startsWith("http") && !url.startsWith("https")){
			print("url not start with http or https ");
			return false;
		}
//		url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".JPEG") || url.endsWith(".jpeg")
//		|| url.endsWith(".PNG") || url.endsWith(".JPG") || url.endsWith(".gif") || url.endsWith(".GIF")
		if ( 	url.contains(".png") || url.contains(".jpg") || url.contains(".JPEG")
				|| url.contains(".jpeg") || url.contains(".PNG") || url.contains(".JPG")
				|| url.contains(".gif") || url.contains(".GIF")
				|| url.contains(".bmp") || url.contains(".BMP")) {
			print("url is img");
			return true;
		} else {
			return false;
		}
	}

	private static String getFileNameFromUrl(String url) {
		String result = null;
		try {
			final String s1 = url.substring(url.lastIndexOf("/"));
			print("s1="+s1);
			if (s1.contains("?size=")) {
				final String[] a1 = s1.split("\\?size=");
				final String[] a2 = a1[0].split("\\.");
				print("a1="+Arrays.toString(a1)+",a2="+Arrays.toString(a2));
				String str = "";
				if (a1[1].contains("&")) {
					str = a1[1].substring(0, a1[1].indexOf("&"));
				}
				final String[] a3 = str.split("\\*");
				if(a3.length>=2){
					str = a3[0]+"_"+a3[1];
				}else if(a2.length>=1){
					str = a3[0];
				}
				print("str="+str);
				result = a2[0] + "_" + str + "." + a2[1];
			} else if(s1.contains("?")){
				final String[] a1 = s1.split("\\?");
				result = a1[0];
			}else{
				result = s1;
			}
			print("result="+result);
		} catch (Exception e) {
			LogException.log(WebViewWnd.instance, e);
		}
		return result;
	}
	private static void print(final String text){
//		unigo.utility.Log.write(1, "ImgCache", text, "");
//		WebViewWnd.instance.runOnUiThread(new Runnable() {
//			
//			@Override
//			public void run() {
//				// TODO Auto-generated method stub
//				Toast.makeText(WebViewWnd.instance, text, Toast.LENGTH_LONG).show();
//			}
//		});
	}
}
