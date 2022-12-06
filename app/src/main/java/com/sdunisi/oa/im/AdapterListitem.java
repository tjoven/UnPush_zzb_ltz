package com.sdunisi.oa.im;

import unigo.utility.Worker;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.preference.PreferenceManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.BaseAdapter;
import android.widget.TextView;

import com.sdunisi.oa.App;
import com.sdunisi.oa.service.IdbHelper;
import com.unicom.baseoa.WebViewWnd;
import com.unicom.sywq.R;

class AdapterListitem extends BaseAdapter implements OnItemClickListener, OnClickListener
{
	private WndNotice context = null;
	private Cursor cursor = null;

	public AdapterListitem(WndNotice context)
	{
		this.context = context;
	}

	public int getCount()
	{
		int nCnt = 0;
		if (cursor != null)
		{
			nCnt = cursor.getCount();
		}
		return nCnt;
	}

	public Object getItem(int position)
	{
		return null;
	}

	public long getItemId(int position)
	{
		return 0;
	}

	public View getView(int position, View convertView, ViewGroup parent)
	{
		if (convertView == null)
		{
			LayoutInflater iInflater = LayoutInflater.from(context);
			convertView = iInflater.inflate(R.layout.wndnotice_listitem2, null);
		}
		if (cursor != null)
		{
			cursor.moveToPosition(position);
			String title = IdbHelper.getValue(cursor, "title");
			String sender = IdbHelper.getValue(cursor, "sender");
			String content = IdbHelper.getValue(cursor, "content");
			String groupname = IdbHelper.getValue(cursor, "groupname");

			TextView tv = (TextView) convertView.findViewById(R.id.tv_title);
			tv.setText(title);
			tv = (TextView) convertView.findViewById(R.id.tv_sender);
			tv.setText(sender);
	
			tv = (TextView) convertView.findViewById(R.id.tv_content);
			tv.setText(content);
			
			tv = (TextView) convertView.findViewById(R.id.tv_group);
			tv.setText(groupname);

			if (position <= 0)
			{
				tv.setVisibility(View.VISIBLE);
			}
			else
			{
				cursor.moveToPrevious();
				String previous = IdbHelper.getValue(cursor, "groupname");
				cursor.moveToPosition(position);
				if (groupname != null && (!groupname.equals(previous)))
					tv.setVisibility(View.VISIBLE);
				else
					tv.setVisibility(View.GONE);
			}

		}
		return convertView;
	}

	public void onClick(View v)
	{
	}

	public void onItemClick(AdapterView<?> parent, View view, int position, long id)
	{

		SharedPreferences settings2 = PreferenceManager.getDefaultSharedPreferences(context);
		if (!settings2.getBoolean(App.ACCOUNT_LOGIN_KEY, false))
		{

			Intent intent = new Intent(context,  WebViewWnd.class);
			intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
			context.startActivity(intent);
			return;
		}

		if (cursor != null)
		{
			cursor.moveToPosition(position);

			String url = IdbHelper.getValue(cursor, "url");
			String messageid = IdbHelper.getValue(cursor, "id");
			String str = context.getString(R.string.SETTING_INFOS);
			String rr = IdbHelper.getValue(cursor, "rr");
			IdbHelper.getInstance(context).updateMessageReadOnPhone(messageid);
			SharedPreferences settings = context.getSharedPreferences(str, 0);
			str = /* settings.getString("httpMain", "") + */url + "&sys_token_khd=" + settings.getString("sys_token_khd", "");
			//if(url.startsWith("http://")){
			Intent intent = new Intent(context,  WebViewWnd.class);
			intent.putExtra("URL", str);
			context.startActivity(intent);
			if (rr.contains("1"))
			{
				Worker worker = new Worker(1);
				HttpImResponse http = new HttpImResponse(1, context.getApplicationContext(), messageid);
				worker.doWork(http);
			}
			context.finish();
		//	}
		}
	}

	protected void onResume()
	{
		cursor = IdbHelper.getInstance(context).queryNotices();
		if (cursor != null)
		{
			notifyDataSetChanged();
		}
	}

	protected void onPause()
	{
		try
		{
			cursor.close();
		}
		catch (Exception e)
		{
		}
		cursor = null;
	}
}
