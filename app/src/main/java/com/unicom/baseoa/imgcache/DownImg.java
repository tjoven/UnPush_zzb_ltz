package com.unicom.baseoa.imgcache;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;

import com.unicom.baseoa.WebViewWnd;
import com.unicom.baseoa.update.LogException;

import android.util.Log;
import unigo.utility.HttpRun;

public class DownImg extends HttpRun {
	public static final String TAG = "ImgDonwload";
	private String fileName;
	private String cardURL;
	
	public String getCardURL(){
		return cardURL;
	}

	public DownImg(String requestUrl, String filename) {
		this.fileName = filename;
		setTimeout(5 * 1000);
		setUrl(requestUrl);
		setMethod("GET");
	}

	protected void GetRecvData(InputStream din) {
		String path = "";
		if (android.os.Environment.getExternalStorageState().equals(android.os.Environment.MEDIA_MOUNTED)) {
			path = android.os.Environment.getExternalStorageDirectory().getPath();
			if (!path.endsWith("/")) {
				path += "/";
			}
			path = path + "Undownload/ImgCache/";
			File tmpFile = new File(path);
			if (!tmpFile.exists()) {
				boolean suc = tmpFile.mkdirs();
				if (!suc)
					Log.d("file make dir suc", "false");
			}
		}
		FileOutputStream fout = null;
		try {
			File f = new File(path + fileName);

			byte[] buff = new byte[1024];
			fout = new FileOutputStream(f);
			int n = 0;
			while (true) {
				int len = din.read(buff);
				if (len < 0)
					break;
				else if (len == 0)
					continue;
				fout.write(buff, 0, len);

				n = (n + 1) % 10;
				if (n != 0) {
					continue;
				}

			}
			cardURL = f.toString();
		} catch (Exception e) {
			LogException.log(WebViewWnd.instance, e);
			e.printStackTrace();
		}
		try {
			fout.close();
		} catch (Exception e) {
		}
	}

	protected void setRequestProperty(HttpURLConnection conn) {
		conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
	}

}
