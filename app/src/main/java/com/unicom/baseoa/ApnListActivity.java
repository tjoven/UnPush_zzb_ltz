package com.unicom.baseoa;

import java.util.List;

import unigo.utility.RunnableEx;
import unigo.utility.Worker;
import android.app.ListActivity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.KeyEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.Toast;

import com.unicom.apn.ApnData;
import com.unicom.apn.ApnHelper;
import com.unicom.sywq.R;

public class ApnListActivity extends ListActivity implements OnItemClickListener {

	protected static final int GETALLAPN = 0;
	protected static final int SETAPN = 1;
	protected static final int INSERTAPN = 2;
	private String status = null;
	private ListView listView;
	private ImageButton exitBtn;
	private ArrayAdapter<ApnData> adapter;
	private Handler handler = new Handler() {

		@Override
		public void handleMessage(Message msg) {
			// TODO Auto-generated method stub
			super.handleMessage(msg);
			if (msg.what == GETALLAPN) {

				if (msg.obj == null)
					return;
				List<ApnData> list = (List<ApnData>) msg.obj;
				if (list != null && list.size() > 0) {
					adapter = new ArrayAdapter<ApnData>(ApnListActivity.this,
							R.layout.simple_list_item_single_choice,
							list);
					setListAdapter(adapter);
					for (int i = 0; i < list.size(); i++) {
						ApnData data = list.get(i);
						if (data.getCurrent() == 1) {
							listView.setItemChecked(i, true);
						} else {
							listView.setItemChecked(i, false);
						}
					}
				}

			} else if (msg.what == SETAPN) {
				boolean suc = (Boolean) msg.obj;
				if (suc) {
					Toast.makeText(getApplicationContext(), "APN设置成功！",
							Toast.LENGTH_SHORT).show();
					intent();
				} else {
					Toast.makeText(getApplicationContext(), "APN设置失败！",
							Toast.LENGTH_SHORT).show();
					intent();
				}
			} 
		}

	};

	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
//		requestWindowFeature(Window.FEATURE_NO_TITLE);
		this.setContentView(R.layout.apnlist);
		status = this.getIntent().getStringExtra("networkstatus");
		exitBtn = (ImageButton)findViewById(R.id.exitBtn);
		exitBtn.setOnClickListener(new OnClickListener() {
			
			@Override
			public void onClick(View v) {
				intent();
				
			}
		});
		listView = getListView();
		listView.setItemsCanFocus(false);
		listView.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
		listView.setOnItemClickListener(this);
		getAllApn();

	}

	@Override
	protected void onResume() {
		// TODO Auto-generated method stub
		super.onResume();
	}

	protected void getAllApn() {
		// TODO Auto-generated method stub
		RunnableEx run = new RunnableEx(getApplicationContext()) {

			@Override
			protected void doRun(Object obj) {
				// TODO Auto-generated method stub
				super.doRun(obj);
				try {
					List<ApnData> list = ApnHelper.getAllApn(getApplicationContext());
					Message message = new Message();
					message.obj = list;
					message.what = GETALLAPN;
					handler.sendMessage(message);
				} catch (Exception e) {
					e.printStackTrace();
				}

			}

		};
		Worker worker = new Worker(1);
		worker.doWork(run);
	}

	@Override
	protected void onDestroy() {
		// TODO Auto-generated method stub
		super.onDestroy();
	}

	@Override
	public void onItemClick(AdapterView<?> parent, View view, int position,
			long id) {
		// TODO Auto-generated method stub
		Toast.makeText(this,
				"P:" + position + listView.getCheckedItemPosition(),
				Toast.LENGTH_SHORT).show();

			if (adapter != null) {
				final ApnData data = (ApnData) adapter.getItem(position);
				if (data != null) {
					setApn(data.getId(),status);
				}


		}
	}

	private void setApn(final long id, final String status) {
		// TODO Auto-generated method stub
		RunnableEx run = new RunnableEx(getApplicationContext()) {
			protected void doRun(Object obj) {
				// TODO Auto-generated method stub
				super.doRun(obj);
				try {
					Message message = new Message();
					message.obj = ApnHelper.setNowAPN(getApplicationContext(), id, status);
					message.what = SETAPN;
					handler.sendMessage(message);
				} catch (Exception e) {
					e.printStackTrace();
				}

			}

		};
		Worker worker = new Worker(1);
		worker.doWork(run);
	}

	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		if (keyCode == KeyEvent.KEYCODE_BACK) {
			intent();
		}
		return super.onKeyDown(keyCode, event);
	}
	private void intent(){
		Intent intent = new Intent();
		intent.setClass(this, MainActivity.class);
		startActivity(intent);
		finish();
	}
}
