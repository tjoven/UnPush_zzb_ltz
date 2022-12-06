package com.unicom.config;

import unigo.utility.ActivityEx;
import unigo.utility.Worker;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.view.KeyEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import com.unicom.baseoa.MainActivity;
import com.unicom.baseoa.Settings;
import com.unicom.baseoa.WebViewWnd;
import com.unicom.baseoa.splash.WndSplash;
import com.unicom.sywq.R;
import com.wotool.http.HttpDocDown;

public class WndConfig extends ActivityEx
{
	private int[] hideItems = null;
	public static WndConfig instance = null;
	private EditText url_edit;
	private SharedPreferences settings;
	private ImageButton imgreturn;
	private String setUrl;
	private TextView config_clear;
	private TextView upload_log;
	private TextView config_checkbox;
	ProgressDialog pd=null;
	private TextView txtCacheSize;
	
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		setContentView(R.layout.config_wndconfig);
		 instance = this;
		 settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		 getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN); 
		if (savedInstanceState == null)
		{
			Intent intent = getIntent();
			hideItems = intent.getIntArrayExtra("hideItems");
		}
		else
		{
			hideItems = savedInstanceState.getIntArray("hideItems");
		}
		url_edit=(EditText)findViewById(R.id.url_edit);
		settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		init();
		View view;
		view = findViewById(R.id.id_config_update);
		view.setOnClickListener(new OnUpdateClick(this));
		view = findViewById(R.id.id_config_openpush);
		view.setOnClickListener(new OnOpenpushClick(this));
		
		if (hideItems != null)
		{
			for (int i = 0; i < hideItems.length; i++)
			{
				view = findViewById(hideItems[i]);
				if (view != null)
				{
					view.setVisibility(View.GONE);
				}
			}
		}
	}
	public void init(){
		//进度条
    	pd=new ProgressDialog(this);
        pd.setProgressStyle(ProgressDialog.STYLE_SPINNER);
		//初始化服务器地址
		String url=settings.getString("httpMain","");
		 if(url.length()>0){
			 url_edit.setText(url.substring(7));
		 }else{
			 url = this.getString(R.string.url);  
			 if(url!=null&&!"".equals(url)){
				 url_edit.setText(url.substring(7));
			 }else{
				   url_edit.setText("");
			 }
		 }
		
		imgreturn=(ImageButton)findViewById(R.id.id_btn_return);
		imgreturn.setOnClickListener(new OnClickListener(){
			@Override
			public void onClick(View v) {
				String s = "";
				String url=settings.getString("httpMain","");
				 s = url_edit.getText().toString().trim();
				 s ="http://"+s;
				 setUrl=s;
				 if(!s.equals(url)){
					 alertMsg("服务器地址变动，需要重新登录",1);
				 }else{
					 WndConfig.this.finish();
				 }
			}
		 });
		//点击清除缓存
		config_clear=(TextView) findViewById(R.id.id_config_clear);
		config_clear.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View paramView) {
				alertMsg("确定要清除缓存数据吗?",2);
			}
		});
		//选中自动清除缓存
		config_checkbox=(TextView) findViewById(R.id.id_config_checkbox);
		boolean openCacheClear=settings.getBoolean("openCacheClear", false);
		config_checkbox.setSelected(openCacheClear);
		config_checkbox.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View paramView) {
				if(config_checkbox.isSelected()){
					settings.edit().putBoolean("openCacheClear", false).commit();
					config_checkbox.setSelected(false);
				}else{
					settings.edit().putBoolean("openCacheClear", true).commit();
					config_checkbox.setSelected(true);
					showMessage("程序退出时自动清除缓存数据");
				}
			}
		});
		//计算缓存附件的大小
		txtCacheSize=(TextView) findViewById(R.id.id_config_CacheSize);
		txtCacheSize.setText(getString(R.string.clearCacheSummary)+new OnClearCache().getFileSize());
		//上传日志
		upload_log=(TextView) findViewById(R.id.id_config_uplog);
		upload_log.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View paramView) {
				alertMsg("确定要上传日志吗?",3);
			}
		});
	}
	
	protected void onSaveInstanceState(Bundle outState)
	{
		super.onSaveInstanceState(outState);
		outState.putIntArray("hideItems", hideItems);
	}

	protected void onRestoreInstanceState(Bundle savedInstanceState)
	{
		super.onRestoreInstanceState(savedInstanceState);
		hideItems = savedInstanceState.getIntArray("hideItems");
	}
	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		if(keyCode == KeyEvent.KEYCODE_BACK){
			String s = "";
			String url=settings.getString("httpMain","");
			 s = url_edit.getText().toString().trim();
			 s ="http://"+s;
			 setUrl=s;
			 if(!s.equals(url)){
				 alertMsg("服务器地址变动，需要重新登录",1);
			 }else{
				 WndConfig.this.finish();
			 }
			 return true;
		}
		return super.onKeyDown(keyCode, event);
	}
	// 显示提示信息
	public void showMessage(String msg)
	{
		Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
	}
	//弹出提示信息
	private void alertMsg(String msg,final int flag)
	{
		AlertDialog.Builder builder = new AlertDialog.Builder(this);
		builder.setTitle(msg);
		builder.setCancelable(true);
		builder.setPositiveButton("确定", new DialogInterface.OnClickListener()
		{
			public void onClick(DialogInterface dialog, int id)
			{
				if(flag==1){
					settings.edit().putString("httpMain", setUrl).commit();
					WebViewWnd.instance.finish();
					Intent intent=new Intent();
					intent.setClass(WndConfig.this, MainActivity.class);
					startActivity(intent);
					WndConfig.this.finish();
				}else if(flag==2){
					//进度条
        			pd.setMessage("正在清除缓存数据...");
        			pd.setCancelable(false);
        			pd.show();
        			Handler handler = new Handler();
        			handler.postDelayed(new Runnable()
        			{
        				public void run()
        				{
        					new OnClearCache().ClearCache();
        					showMessage("清除缓存完成");
        					pd.cancel();
        					pd.dismiss();
        					txtCacheSize.setText(getString(R.string.clearCacheSummary)+new OnClearCache().getFileSize());
        				}
        			}, 500);
				}else if(flag==3){
					String sdState = Environment.getExternalStorageState();
					String path = Environment.getExternalStorageDirectory().toString();
					final String  sourcePath= path + "/Unlog";
					final String zipDirPath = path + "/Undownload";
					if (sdState.equals(Environment.MEDIA_MOUNTED)) {
								try {
									new OnUploadLog(WndConfig.this).doZip(zipDirPath,sourcePath);
								} catch (Exception e) {
									e.printStackTrace();
								}
					}
				}
				dialog.dismiss();
			}
		});
		AlertDialog alert = builder.create();
		alert.show();
	}
}