package com.sdunisi.oa.im;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ListView;

import com.sdunisi.oa.service.NoticeHelper;
import com.unicom.sywq.R;

public class WndNotice extends Activity
{
	private AdapterListitem adapterListitem;

	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		getWindow().setFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON, WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
		setContentView(R.layout.wndnotice);

		adapterListitem = new AdapterListitem(this);
		ListView listView = (ListView) findViewById(R.id.id_listview);
		listView.setEmptyView(findViewById(R.id.id_listview_none));
		listView.setAdapter(adapterListitem);
		listView.setOnItemClickListener(adapterListitem);

		NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
		mNotificationManager.cancel(1);
		
		
	}

	protected void onResume()
	{
		super.onResume();
		adapterListitem.onResume();
	}

	protected void onPause()
	{
		super.onPause();
		adapterListitem.onPause();
		
		NoticeHelper.notice(this,false,false);
	}
}
