package com.unicom.apn;

import java.util.ArrayList;
import java.util.List;

import com.unicom.sywq.R;


import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.net.Uri;

public class ApnHelper {

	static Uri uri = Uri.parse("content://telephony/carriers");
	static Uri preferUri = Uri.parse("content://telephony/carriers/preferapn");

	public static long insertAPN(final Context context, final String name,
			final String apn, String status) {
		long id = -1;
		ContentResolver resolver = context.getContentResolver();
		ContentValues values = new ContentValues();
		values.put("name", name);
		values.put("apn", apn);
		values.put("proxy", "");
		values.put("numeric", "46001");
		values.put("mcc", "460");
		values.put("mnc", "01");
		values.put("port", "");
		values.put("mmsproxy", "");
		values.put("mmsport", "");
		values.put("user", "");
		values.put("server", "");
		values.put("password", "");
		values.put("mmsc", "");
		// values.put("current", "1");
		values.put("current", "");
		values.put("type", "default");
		Cursor c = null;
		try {
			Uri newRow = resolver.insert(uri, values);
			if (newRow != null) {
				c = resolver.query(newRow, null, null, null, null);
				int idindex = c.getColumnIndex("_id");
				c.moveToFirst();
				id = c.getLong(idindex);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}

		if (c != null) {
			c.close();
		}
		 setNowAPN(context, id,status);
		return id;
	}

	/**
	 * 
	 * 
	 * @param context
	 * @param id
	 *            ֵ
	 * @param status
	 */
	public static boolean setNowAPN(final Context context, final long id,
			String status) {
		ContentResolver resolver = context.getContentResolver();
		ContentValues values = new ContentValues();
		values.put("apn_id", id);
		boolean res = false;
		try {
			resolver.update(preferUri, values, null, null);

			res = (getDefaultId(context) == id);
			if (res) {
				SharedPreferencesConfig prf = new SharedPreferencesConfig(
						context);
				String rememberStatus = prf.getRememberStatus();
				if (rememberStatus.equals("1")) {
					if (status.equals("outNet")) {
						prf.setOutNet(id);
					}
				} else {
						prf.setOutNet(0);
					
				}

			}

		} catch (SQLException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return res;
	}

	// 设置apn
	public static void APNSetting(Context aContext) {

		// current不为空表示可以使用的APN
		String projection[] = { "_id,name,apn,type,current" };
		Cursor cr = aContext.getContentResolver().query(uri, projection, null,
				null, null);
		Cursor cprefer = aContext.getContentResolver().query(preferUri,
				new String[] { "_id" }, null, null, null);
		int preferId = -1;
		if (cprefer.getCount() == 1 && cprefer.moveToFirst()) {
			preferId = cprefer.getShort(cprefer.getColumnIndex("_id"));
		}
		String name = aContext.getString(R.string.apnname);
		String apn = aContext.getString(R.string.apn);
		final String status = "net";
		boolean iApnExist = false;
		final Context finalContext = aContext;
		while (cr != null && cr.moveToNext()) {
			String nameAPN = cr.getString(cr.getColumnIndex("name"));
			final short currentId = cr.getShort(cr.getColumnIndex("_id"));
			if (nameAPN.compareTo(name) == 0) {
				iApnExist = true;
				if (preferId != -1 && preferId != currentId) {

					setNowAPN(finalContext, currentId, status);

				}else{
					setNowAPN(finalContext, currentId, status);
				}
				break;
			}

		}
		if (cr != null)
			cr.close();
		if (cprefer != null)
			cprefer.close();

		if (!iApnExist) {
			insertAPN(aContext, name, apn,status);
		}

	}

	public static List<ApnData> getAllApn(Context ctx) {

		String[] columns = new String[] { "_id", "apn", "name", "current" };

		List<ApnData> result = new ArrayList<ApnData>();
		ContentResolver resolver = ctx.getContentResolver();
		Cursor cursor = resolver.query(uri, columns, "numeric=?",
				new String[] { "46001" }, null);
		if (cursor != null) {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				long id = cursor.getLong(0);
				String apn = cursor.getString(1).trim();
				String name = cursor.getString(2).trim();
				int current = cursor.getInt(3);
				long _id = getDefaultId(ctx);
				if (id == _id)
					current = 1;
				else
					current = 0;
				ApnData map = new ApnData();
				map.setId(id);
				map.setName(name);
				map.setApn(apn);
				map.setCurrent(current);
				result.add(map);
				cursor.moveToNext();
			}
			cursor.close();
		}
		return result;

	}

	public static void getNOWApn(Context ctx,int s_version) {

		String[] columns = new String[] { "_id", "apn", "name", "current" };

		List<ApnData> result = new ArrayList<ApnData>();
		ContentResolver resolver = ctx.getContentResolver();
		Cursor cursor=null;
		if(s_version==0){
			cursor = resolver.query(uri, columns, "numeric=?",new String[] { "46001" }, null);
		}
		if (cursor != null) {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				long id = cursor.getLong(0);
				String apn = cursor.getString(1).trim();
				String name = cursor.getString(2).trim();
				int current = cursor.getInt(3);
				long _id = getDefaultId(ctx);
				ApnData map = new ApnData();
				map.setApnName("");
				if (id == _id) {
					current = 1;
					map.setApnName(name);
					map.setName(name);
					map.setApn(apn);
					map.setId(id);
					map.setCurrent(current);
				
					result.add(map);
					break;
				
				} else {
					current = 0;
	
				}
				cursor.moveToNext();
			
			}
			cursor.close();
		}

	}

	public static long getDefaultId(Context aContext) {
		Cursor cprefer = aContext.getContentResolver().query(preferUri,
				new String[] { "_id" }, null, null, null);
		long preferId = -1;

		if (cprefer != null) {
			if (cprefer.getCount() == 1 && cprefer.moveToFirst()) {

				preferId = cprefer.getLong(cprefer.getColumnIndex("_id"));
			}
			cprefer.close();
		}

		return preferId;
	}
}
