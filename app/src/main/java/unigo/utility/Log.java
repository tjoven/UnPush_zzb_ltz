package unigo.utility;

import java.io.File;
import java.io.FileOutputStream;

import com.unicom.baseoa.util.TimeUtil;

import android.annotation.SuppressLint;
import android.os.Environment;

@SuppressLint("SimpleDateFormat")
public class Log
{
	static private int logLevel = 0;
	static private String user = "";

	static public int getLogLevel()
	{
		return logLevel;
	}

	static public void setLogLevel(int level)
	{
		logLevel = level;
	}

	static public void write(int level, String place, String msg,String username)
	{
		if (logLevel <= level)
		{
			if(!"".equals(username)){
				user=username;
			}
			String out = "["+TimeUtil.getCurrentTimeNormal2()+"] ["+user+"] "+place + "/> " + msg;
			System.out.println(out);
			try
			{
				out += "\r\n";
				File dir = Environment.getExternalStorageDirectory();
				String f_ = dir.getPath();
				if (!f_.endsWith(File.separator))
				{
					f_ += File.separator;
				}
				f_ = f_+"Unlog";
				File ff = new File(f_);
				if (!ff.exists()) {
					ff.mkdir();
				}
				File f = new File(f_+"/log"+TimeUtil.getCurrentDateCatalog()+".txt");
				if(!f.exists())
				 {
				    f.createNewFile();
				    File oldf = new File(f_+"/log"+TimeUtil.lastWeek()+".txt");
				    //System.out.println("!!!!!!!!!!!!!!!!!!!!"+TimeUtil.lastWeek());
				    if(oldf.exists()){
				    	oldf.delete();
				    }
				 }
				FileOutputStream fout = new FileOutputStream(f, true);
				fout.write(out.getBytes("utf-8"));
				fout.close();
			}
			catch (Exception e)
			{
				e.printStackTrace();
			}
		}
	}

	static public void write(int level, byte[] data, int pos, int len)
	{
		if (logLevel <= level)
		{
			try
			{
				File f = new File("/sdcard/1log.txt");
				FileOutputStream fout = new FileOutputStream(f, true);
				fout.write(data, pos, len);
				fout.close();
			}
			catch (Exception e)
			{
			}
		}
	}
}
