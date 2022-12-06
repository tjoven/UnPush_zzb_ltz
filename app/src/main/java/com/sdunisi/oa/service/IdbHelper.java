package com.sdunisi.oa.service;

import com.sdunisi.oa.App;

import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
//"sr": 1,
//"ar": 1,
//"url": "http://localhost:8080",
//"id": "1",
//"content": "123",
//"sender": "a",
//"yhid": "admin",
//"title": "123",
//"rr": 1,
//"show_level": 1,
//"create_time": 1325347200000,
//"groupid": 1,
//"ywid": "1"
import android.preference.PreferenceManager;

public class IdbHelper extends SQLiteOpenHelper
{
	public static final String sdbName = "im.sqlite";
	public static final int verDateBase = 1;
	private static IdbHelper inst = null;
	private Context context;

	private IdbHelper(Context context)
	{
		super(context, sdbName, null, verDateBase);
		this.context=context.getApplicationContext();
		
	}

	public static IdbHelper getInstance(Context context)
	{
		if (inst == null)
		{
			try
			{
				inst = new IdbHelper(context.getApplicationContext());
			}
			catch (Exception e)
			{
			}
		}
		return inst;
	}

	public void onCreate(SQLiteDatabase db)
	{
		tableNotices(db);
	}

	public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion)
	{
		if (oldVersion == newVersion)
		{
			return;
		}
		// 升级数据库代码，无跨版本升级问题
		if (oldVersion == 1)
		{
			oldVersion++;
		}
	}

	private void tableNotices(SQLiteDatabase db)
	{
		try
		{
			StringBuilder sql = new StringBuilder();
			sql.append("create table notices (");
			sql.append("id text primary key,");
			sql.append("title text,");
			sql.append("content text,");
			sql.append("url text,");
			sql.append("a integer default 0,");
			sql.append("sr text,");
			sql.append("ar text,");
			sql.append("rr text,");
			sql.append("sender text,");
			sql.append("yhid text,");
			sql.append("show_level text,");
			sql.append("create_time text,");
			sql.append("groupid text,");
			sql.append("groupname text,");
			sql.append("ywid text,");
			sql.append("an text,");
			// 状态
			sql.append("ifread text default '0',");
			sql.append("ifarrive text default '0',");
			sql.append("ifsigh text default '0',");
			
			sql.append("user text,");
			
			// 预留字段
			sql.append("field1 text default '0',");//客户端已读
			sql.append("field2 text,");
			sql.append("field3 text,");
			sql.append("field4 text);");
			db.execSQL(sql.toString());
		}
		catch (Exception e)
		{
		}
	}

	public Cursor queryNotices()
	{
		Cursor cursor = null;
		try
		{
			SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(context);
			String username = settings.getString(App.IM_USERNAME_KEY, "");
			SQLiteDatabase db = getReadableDatabase();
			cursor = db.rawQuery("select * from notices where user= '"+username+"' and field1<>'1' order by groupid, show_level DESC,id DESC", null);
		}
		catch (Exception e)
		{
		}
		return cursor;
	}

	public static String getValue(Cursor cursor, String columnName, boolean replaceNull)
	{
		String str = null;
		try
		{
			int n = cursor.getColumnIndex(columnName);
			str = cursor.getString(n);
			if (replaceNull)
			{
				str = str.replace("null", "");
			}
		}
		catch (Exception e)
		{
		}
		return str == null ? "" : str;
	}

	public static String getValue(Cursor cursor, String columnName)
	{
		return getValue(cursor, columnName, false);
	}

	public long insertMessage(ContentValues cvs)
	{
		// TODO Auto-generated method stub
		long num=-1;
		try
		{
			SQLiteDatabase db = this.getWritableDatabase();
			num=db.insert("notices", null, cvs);
		}
		catch (Exception e)
		{
		}
		if(num<0)
		{
			try
			{
				SQLiteDatabase db = this.getWritableDatabase();
				num=db.update("notices", cvs, "id=? and user=?", new String[]{cvs.getAsString("id"),cvs.getAsString("user")});
			}
			catch (Exception e)
			{
			}
		}
		return num;
	}

	public boolean updateMessageRead(String messageId, String time)
	{
		// TODO Auto-generated method stub
		SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(context);
		String username = settings.getString(App.IM_USERNAME_KEY, "");
		String sql = "update notices set ifread = '1'  where id='" + messageId + "' and user='" + username + "';";
		return executeSql(sql);
	}

	public boolean updateMessageReceive(String messageId, String time)
	{
		// TODO Auto-generated method stub
		SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(context);
		String username = settings.getString(App.IM_USERNAME_KEY, "");
		String sql = "update notices set ifarrive = '1'  where id='" + messageId + "' and user='" + username + "';";
		return executeSql(sql);
	}
	public boolean executeSql(String sql)
	{
		boolean suc = false;
		try
		{
			SQLiteDatabase db = getWritableDatabase();
			db.execSQL(sql);
			suc = true;
		}
		catch (Exception e)
		{
			suc = false;
			e.printStackTrace();
		}
		return suc;
	}

	public Cursor getCursorOfUnreadMessages()
	{
		// TODO Auto-generated method stub
		Cursor cursor = null;
		try
		{
			SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(context);
			String username = settings.getString(App.IM_USERNAME_KEY, "");
			SQLiteDatabase db = getReadableDatabase();
			cursor = db.rawQuery("select * from notices where user= '"+username+"' and field1 <>'1'", null);
		}
		catch (Exception e)
		{
		}
		return cursor;
	}

	public boolean updateMessageReadOnPhone(String messageid)
	{
		// TODO Auto-generated method stub
		SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(context);
		String username = settings.getString(App.IM_USERNAME_KEY, "");
		String sql = "update notices set field1 = '1'  where id='" + messageid + "' and user='" + username + "';";
		return executeSql(sql);
	}

	public long getNoticePeriod()
	{
		// TODO Auto-generated method stub
		long period=0;
		Cursor cursor = null;
		try
		{
			SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(context);
			String username = settings.getString(App.IM_USERNAME_KEY, "");
			SQLiteDatabase db = getReadableDatabase();
			cursor = db.rawQuery("select * from notices where user= '"+username+"' and a>0 and field1<>'1' order by a", null);
			if(cursor!=null&&cursor.getCount()>0)
			{
				cursor.moveToFirst();
				String a=getValue(cursor,"a");
				period=Long.valueOf(a)*1000L;
			}
		}
		catch (Exception e)
		{
		}
		if(cursor!=null)
			cursor.close();
		return period;
	}
}
