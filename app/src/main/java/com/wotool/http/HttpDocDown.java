package com.wotool.http;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;

import unigo.utility.Common;
import unigo.utility.HttpRun;
import unigo.utility.RunnableEx;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.util.Log;

import com.unicom.baseoa.WebViewWnd;
import com.unicom.baseoa.update.LogException;
import com.unicom.sywq.R;

public class HttpDocDown extends HttpRun
{
	private boolean succeed;
	private boolean updateGallery = false;
	private String savePath;
	private String reason;
	private String cardURL;
	private String strs;
	private String fileName;
	private WebViewWnd context;
	public static final String TAG = "HttpDocDown";
	private final String URL = "/khd/login.do?method=logout";
	private OnHttpDocDownListener onHttpFinish;

	private ProgressDialog dlg;
	private int nTotal;
	private int nGeted;
	
	public HttpDocDown(WebViewWnd context, String strs,String filename,String savePath,boolean updateGallery){
		this.savePath = savePath;
		this.updateGallery = updateGallery;
		this.init(context, strs,filename);
	}
	
	public HttpDocDown(WebViewWnd context, String strs,String filename){
		this.init(context, strs,filename);
	}
	
	public void init(WebViewWnd context, String strs,String filename)
	{

		this.context = context;
		this.onHttpFinish= context;
		this.strs=strs;
		this.fileName=filename;
		this.setTimeout(5*1000);

		setUrl(strs);
		setMethod("GET");

		nTotal = nGeted = 0;
		RunnableEx re = new RunnableEx(this)
		{
			protected void doRun(Object obj)
			{
				setInitial();
			}
		};
		context.runOnUiThread(re);
		if (Common.debug)
			Log.d(TAG + "URL", strs);
	}

	protected void setInitial()
	{
		dlg = new ProgressDialog(context);
		dlg.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
		dlg.setCancelable(false);
		dlg.setButton("取消", new DialogInterface.OnClickListener() {
			public void onClick(DialogInterface dialog, int i) {
				cancel();
				deleteFile();
				dialog.cancel();
			}
		});
		dlg.setIndeterminate(false);
		dlg.setProgress(0);
		dlg.setMessage("正在下载，请稍候...");
		dlg.show();
	}
	
	protected void GetRecvData(InputStream din)
	{
			String path="";
			if (android.os.Environment.getExternalStorageState().equals(android.os.Environment.MEDIA_MOUNTED))
			{
				path = android.os.Environment.getExternalStorageDirectory().getPath();
				if (!path.endsWith("/"))
				{
					path += "/";
				}
				if(savePath==null||"".equals(savePath)){
					path = path + "Undownload/";
				}else{
					path = path + savePath + "/";
				}
				File tmpFile = new File(path);
				if (!tmpFile.exists())
				{
					boolean suc = tmpFile.mkdirs();
					if (!suc)
						Log.d("file make dir suc", "false");
				}
			}
			FileOutputStream fout = null;
			try
			{
				boolean flag=false;
				File f=null;
				File f1=null;
				int idx = strs.lastIndexOf('/');
				int idxn = fileName.lastIndexOf('/');
				if (idx > 0)
				{
					 f1 = new File(path+strs.substring(idx, strs.length()));
					 f=new File(path+fileName.substring(idxn, fileName.length()));
					 f1.renameTo(f);
					 cardURL=f.toString();
				}
				if(!f.exists()){
					flag=true;
				}else{
					if(f.length()!=nTotal){
						flag=true;
					}
				}
				if(flag){
					byte[] buff = new byte[1024];
					fout = new FileOutputStream(f);
					int n = 0;
					while (true)
					{
						int len = din.read(buff);
						if (len < 0)
							break;
						else if (len == 0)
							continue;
						fout.write(buff, 0, len);
						
						nGeted += len;
						n = (n + 1) % 10;
						if (n != 0)
						{
							continue;
						}
						RunnableEx re = new RunnableEx(this)
						{
							protected void doRun(Object obj)
							{
								setGeted();
							}
						};
						context.runOnUiThread(re);
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
	
	protected void getResponseProperty(int code, HttpURLConnection conn)
	{
		if (code == 200)
		{
			String str = conn.getHeaderField("Content-Length");
			try
			{
				nTotal = Integer.valueOf(str).intValue();

				RunnableEx re = new RunnableEx(this)
				{
					protected void doRun(Object obj)
					{
						setTotal();
					}
				};
				context.runOnUiThread(re);
			}
			catch (Exception e)
			{
			}
		}
	}
	
	private void setGeted()
	{
		if (dlg != null)
		{
			dlg.setProgress(nGeted);
		}
	}

	private void setTotal()
	{
		if (dlg != null)
		{
			dlg.setMax(nTotal);
		}
	}
	
	protected void end(int code, String err)
	{

		if (code != 200)
		{
			succeed = false;
			reason = reason + code + err;
		}
		if (dlg != null)
		{
			dlg.dismiss();
		}
		if (context != null)
		{
			cancel();
			dlg.dismiss();
			File fi = new File(cardURL);
			if(updateGallery&&fi!=null&&fi.exists()){
				updateGallery(cardURL);
			}
			RunnableEx re = new RunnableEx(this)
			{
				protected void doRun(Object obj)
				{
					onHttpFinish.onHttpDocDown((HttpDocDown) obj);
				}
			};
			context.runOnUiThread(re);
		}

	}

	protected void setRequestProperty(HttpURLConnection conn)
	{
		conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
	}

	public interface OnHttpDocDownListener
	{
		public void onHttpDocDown(HttpDocDown http);
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
	
	private void deleteFile(){
		
		File f = new File(cardURL);
		if(f!=null && f.exists()){
			f.delete();
		}
		reason = "取消下载";
	}
	
	private void updateGallery(String filename) {
		try{
        MediaScannerConnection.scanFile(context, new String[] {filename}, null,
                new MediaScannerConnection.OnScanCompletedListener() {

                    @Override
                    public void onScanCompleted(String path, Uri uri) {

                    }
                });
		}catch(Exception e){
			LogException.log(context, e);
		}
    }
}
