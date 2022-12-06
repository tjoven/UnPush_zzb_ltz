package com.sdunisi.oa.version;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;


import unigo.utility.HttpBase;
import unigo.utility.RunCancelable;
import unigo.utility.RunnableEx;
import unigo.utility.Worker;



import android.app.Activity;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import android.widget.Toast;

public class DownApk
{
	private Activity context;
	private Worker worker;

	public DownApk(Activity context)
	{
		this.context = context;
	}

	public void down(String url)
	{
		try
		{
			boolean b = true;
			if (b)
			{
				HttpDown http = new HttpDown(url);
				
				worker = new Worker(1);
				worker.doWork(http);
			}
			else
			{
				Uri uri = Uri.parse(url);
				Intent it = new Intent(Intent.ACTION_VIEW, uri);
				context.startActivity(it);
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}


	

	class HttpDown extends HttpBase implements RunCancelable
	{
		private ProgressDialog dlg;
		private int nTotal;
		private int nGeted;
		private File f;

		public HttpDown(String url)
		{
			setMethod("GET");
			setUrl(url);

			nTotal = nGeted = 0;

			RunnableEx re = new RunnableEx(this)
			{
				protected void doRun(Object obj)
				{
					setInitial();
				}
			};
			context.runOnUiThread(re);
		}

		protected void setInitial()
		{
			// TODO Auto-generated method stub
			dlg = new ProgressDialog(context);
			dlg.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
			dlg.setCancelable(false);
			dlg.setButton("取消", new DialogInterface.OnClickListener() {
				public void onClick(DialogInterface dialog, int i) {
					cancel();
					dialog.cancel();
				}
			});
			dlg.setIndeterminate(false);
			dlg.setProgress(0);
			dlg.setMessage("正在升级，请稍候...");
			dlg.show();
		}

		public void GetRecvData(InputStream din)
		{
			FileOutputStream out = null;
			try
			{
				f = new File(Environment.getExternalStorageDirectory() + "/dzzw/down.apk");
				f.getParentFile().mkdirs();
				out = new FileOutputStream(f, false);

				int n = 0;
				int len;
				byte[] buff = new byte[1024];
				while (true)
				{
					len = din.read(buff);
					if (len < 0)
						break;
					if (len == 0)
						continue;
					out.write(buff, 0, len);

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
			catch (Exception e)
			{
				e.printStackTrace();
			}

			try
			{
				out.close();
			}
			catch (Exception e)
			{
				e.printStackTrace();
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

		protected void end(int code, String err)
		{
			String reason = "";
			if (code < 0)
			{
				reason += err;
			}
			else if (code != 200)
			{
				reason += "错误码" + code;
			}
			if (dlg != null)
			{
				dlg.dismiss();
			}
			if (reason.length() > 0)
			{
				{

				RunnableEx re = new RunnableEx(reason)
				{
					protected void doRun(Object obj)
					{
						Toast.makeText(context, (CharSequence) obj, Toast.LENGTH_LONG).show();
					}
				};
				context.runOnUiThread(re);
				}
			}
			else
			{
				RunnableEx re = new RunnableEx(this)
				{
					protected void doRun(Object obj)
					{
						installApk();
					}
				};
				context.runOnUiThread(re);
				
			}
		}

		private void installApk() {
			Intent intent = new Intent();
			// 由于没有在Activity环境下启动Activity,设置下面的标签
			intent.setAction(Intent.ACTION_VIEW);
			intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			FileProvider7.setIntentDataAndType(context, intent, "application/vnd.android.package-archive", f, true);
			// 安装
			context.startActivity(intent);
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

		public void run()
		{
			startHttp();
		}

		public void cancel()
		{
			cancelHttp();
		}

		public void onDialogCreate(Dialog dlg, Object param)
		{
		}

		public void onDialogCancel(Dialog dlg, Object param)
		{
			if (worker != null)
			{
				worker.cancelAll();
				worker = null;
			}
		}
	}
}
