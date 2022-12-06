package com.wotool.db;

import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

public class DbHelper extends SQLiteOpenHelper {

	private final static String DATABASE_NAME = "oa_db";
	private final static int DATABASE_VERSION = 1;
	public final static String TABLE_MENU_NAME="menu";

	//menu表
	public final static String MENUTABLE_FIELD_ID="id";
	public final static String MENUTABLE_FIELD_TITLE = "title";
	public final static String MENUTABLE_FIELD_REQUESTURL = "requestUrl";
	public final static String MENUTABLE_FIELD_ICONURL = "iconUrl";
	public final static String MENUTABLE_FIELD_MSGCOUNT = "msgCount";
	

	
	static DbHelper inst = null;

	public DbHelper(Context context) {
		super(context, DATABASE_NAME, null, DATABASE_VERSION);
	}

	public static DbHelper getInstance(Context iContext) {

		if (inst == null) {
			inst = new DbHelper(iContext);
		}
		return inst;

	}

	@Override
	public void onCreate(SQLiteDatabase db) {

		//创建area表
		String sql="create table "+TABLE_MENU_NAME+"("
		+MENUTABLE_FIELD_ID+" INTEGER PRIMARY KEY AUTOINCREMENT,"
		+MENUTABLE_FIELD_TITLE+" text,"
		+MENUTABLE_FIELD_REQUESTURL+" text,"
		+MENUTABLE_FIELD_ICONURL+" text,"
		+MENUTABLE_FIELD_MSGCOUNT+" text)";
	
		try {
			db.execSQL(sql);
		} catch (SQLException e1) {
			e1.printStackTrace();
		} catch (Exception e1) {
			e1.printStackTrace();
		}
		
		
	}

	@Override
	public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
		/*
		 * if(oldVersion==1){
		 * 
		 * oldVersion++; } if(oldVersion==2){
		 * 
		 * }
		 */
	}
	
	public void executeSql(String sql) {
		SQLiteDatabase db = this.getWritableDatabase();
		try {
			db.execSQL(sql);
		} catch (SQLException e) {
			e.printStackTrace();
			Log.d("sql", e.toString());
		} catch (Exception e)
		{
			e.printStackTrace();
			Log.d("sql", e.toString());
		}
	}
	
	public Cursor rawQuery(String sql, String[] strings) {
		SQLiteDatabase db = this.getReadableDatabase();
		Cursor cursor = null;
		try {
			cursor = db.rawQuery(sql, strings);
		} catch (Exception e) {
			e.printStackTrace();
			Log.d("sql", e.toString());
		}
		return cursor;
	}
}
