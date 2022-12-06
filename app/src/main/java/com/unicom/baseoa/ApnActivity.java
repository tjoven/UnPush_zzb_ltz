package com.unicom.baseoa;


import unigo.utility.ActivityEx;
import android.app.AlertDialog;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.CompoundButton.OnCheckedChangeListener;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.unicom.apn.ApnData;
import com.unicom.apn.ApnHelper;
import com.unicom.apn.SharedPreferencesConfig;
import com.unicom.sywq.R;


public class ApnActivity extends ActivityEx {
	private TextView apn;
	private String iapn = null;
	private LinearLayout layout1;
	private LinearLayout layout2;
	private LinearLayout layout3;
	private LinearLayout layout4;
	private LinearLayout layout5;
	private RelativeLayout layout0;
	private ImageButton exitBtn;
	private ImageButton inBtn;
	private ImageButton outBtn;
	private ImageButton allBtn;
	private CheckBox check;
	private Context iContext;
	private int s_version=0;
	protected static final int GETALLAPN = 0;
	protected static final int SETAPN = 1;
	protected static final int NET = 2;
	protected static final int OUTNET = 3;
	private ViewOnClickListener ViewOnClickListener = new ViewOnClickListener();



	@Override
	protected void onCreate(Bundle savedInstanceState) {
		// TODO Auto-generated method stub
		super.onCreate(savedInstanceState);
//		requestWindowFeature(Window.FEATURE_NO_TITLE);
		this.setContentView(R.layout.apn);
		iContext = this;
		layout0=(RelativeLayout) findViewById(R.id.layout0);
		layout1 = (LinearLayout) findViewById(R.id.layout1);
		layout2 = (LinearLayout) findViewById(R.id.layout2);
		layout3 = (LinearLayout) findViewById(R.id.layout3);
		layout4 = (LinearLayout) findViewById(R.id.layout4);
		layout5 = (LinearLayout) findViewById(R.id.layout5);
		apn = (TextView) findViewById(R.id.textApn);
		exitBtn = (ImageButton) findViewById(R.id.exitBtn);
		exitBtn.setOnClickListener(ViewOnClickListener);
		inBtn = (ImageButton) findViewById(R.id.inBtn);
		inBtn.setOnClickListener(ViewOnClickListener);
		outBtn = (ImageButton) findViewById(R.id.outBtn);
		outBtn.setOnClickListener(ViewOnClickListener);
		allBtn = (ImageButton) findViewById(R.id.allBtn);
		allBtn.setOnClickListener(ViewOnClickListener);
		check = (CheckBox) findViewById(R.id.savestatus);
		check.setOnCheckedChangeListener(new OnCheckedChangeListener() {

			@Override
			public void onCheckedChanged(CompoundButton buttonView,
					boolean isChecked) {
				SharedPreferencesConfig prf = new SharedPreferencesConfig(
						iContext);
				long outNet = prf.getOutNet();
				if (isChecked) {
					prf.setRememberStatus("1");
				} else {
					prf.setRememberStatus("2");
					if(outNet!=0){
						prf.setOutNet(0);
					}
				}

			}

		});
		SharedPreferencesConfig prf = new SharedPreferencesConfig(iContext);
		String remember = prf.getRememberStatus();
		if (remember.equals("1")) {
			check.setChecked(true);
		} 
		pdVersion();
		getNowApn();
	}

	class ViewOnClickListener implements android.view.View.OnClickListener {

		public void onClick(View view) {
			// TODO Auto-generated method stub
			switch (view.getId()) {
			case R.id.inBtn:
				changNetApn();
				break;
			case R.id.outBtn:
				changOutNetApn();
				break;
			case R.id.allBtn:
				jumpApn();
				break;
			case R.id.exitBtn:
				toClose();
				break;
			default:
				break;
			}

		}

	}

	private void getNowApn() {
		ApnHelper.getNOWApn(getApplicationContext(),s_version);
		iapn = ApnData.getApnName();
		if (iapn != null) {
			apn.setText(iapn);
		}

	}

	public void pdVersion() {
		// String version = "Product Model: " + android.os.Build.MODEL + ","
		// + android.os.Build.VERSION.SDK + ","
		// + android.os.Build.VERSION.RELEASE;
		String bbh = android.os.Build.VERSION.RELEASE;
		System.out.println(bbh);
		int version = 0,s_version=0;
		if (bbh.length() > 0) {
			String bbhList = bbh.substring(0, 1);
			version = Integer.parseInt(bbhList);
//			 version = 4;
			if (version >= 4) {
				s_version=Integer.parseInt(bbh.substring(2, 3));
				if(s_version>=2){
					this.s_version=s_version;
					layout0.setVisibility(View.GONE);
				}
				layout1.setVisibility(View.VISIBLE);
				layout4.setVisibility(View.VISIBLE);

			} else {
				layout2.setVisibility(View.VISIBLE);
				layout3.setVisibility(View.VISIBLE);
				layout5.setVisibility(View.VISIBLE);
			}
		} else {
			showMessage("获取版本号错误！");
		}

	}

	private void jumpApn() {
		Intent intent = new Intent();
		ComponentName cm = new ComponentName("com.android.settings",
				"com.android.settings.ApnSettings");
		intent.setComponent(cm);
		intent.setAction("android.intent.action.VIEW");
		activity.startActivityForResult(intent, 0);

	}

	// 切换内网
	private void changNetApn() {
				try {
					ApnHelper.APNSetting(this);
					showMessage("切换内网成功！");
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					showMessage("内网切换失败！");
				}
				getNowApn();
		

	}

	// 切换外网
	public void changOutNetApn() {
		SharedPreferencesConfig prf = new SharedPreferencesConfig(iContext);
		String rememberStatus = prf.getRememberStatus();
		String status = "outNet";
		long id = prf.getOutNet();
		if (rememberStatus.equals("1")) {
			if (id != 0) {
				try {
					ApnHelper.setNowAPN(getApplicationContext(), id, status);
					showMessage("切换外网成功！");
				
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					showMessage("外网切换失败！");
				}
				getNowApn();
			}else{
				Intent intent = new Intent();
				intent.setClass(this, ApnListActivity.class);
				intent.putExtra("networkstatus", "outNet");
				startActivity(intent);
			}
		} else {
			Intent intent = new Intent();
			intent.setClass(this, ApnListActivity.class);
			intent.putExtra("networkstatus", "outNet");
			startActivity(intent);
		}

	}

	@Override
	protected void onResume() {
		// TODO Auto-generated method stub
		super.onResume();
		getNowApn();
	}
	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		if (keyCode == KeyEvent.KEYCODE_BACK) {
			toClose();
			return true;
		} else {
			return super.onKeyDown(keyCode, event);
		}
	}
	@Override
	protected void onSaveInstanceState(Bundle outState) {
		// TODO Auto-generated method stub
		super.onSaveInstanceState(outState);
	}

	@Override
	protected void onRestoreInstanceState(Bundle savedInstanceState) {
		// TODO Auto-generated method stub
		super.onRestoreInstanceState(savedInstanceState);
	}

	private void showMessage(String msg) {
		Toast.makeText(this, msg, Toast.LENGTH_LONG).show();
	}
	/**
	 * 关闭系统
	 * 
	 */
	private void toClose() {
		alertExit();
	}
	public void alertExit() {
		finish();
	}

}
