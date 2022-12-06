package com.unicom.baseoa;


import com.unicom.sywq.R;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;



public class Settings extends Activity {
	
	private EditText url_edit;
	private SharedPreferences settings;
	private TextView example;
	private Button submitBtn;
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		//全屏  
		getWindow().setFlags(WindowManager.LayoutParams. FLAG_FULLSCREEN ,    
		              WindowManager.LayoutParams. FLAG_FULLSCREEN);   
		setContentView(R.layout.setting);
		url_edit=(EditText)findViewById(R.id.url_edit);
		settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		init();
	}

	public void init(){
		
		 submitBtn=(Button)findViewById(R.id.sumbitBtn);
		 submitBtn.setOnClickListener(new OnClickListener(){

			@Override
			public void onClick(View v) {
				String s = "";
				 s = url_edit.getText().toString().trim();
				 s ="http://"+s;
				 if(!s.equals("")){
				   settings.edit().putString("httpMain", s).commit();
				   Intent intent=new Intent();
				   intent.setClass(Settings.this, MainActivity.class);
				   startActivity(intent);
				   Settings.this.finish();
				}else{
					Toast.makeText(Settings.this, "服务器地址不能为空！", Toast.LENGTH_LONG).show();
				}
			}
			 
		 });
		 example=(TextView)findViewById(R.id.example);
		 example.setOnClickListener(new OnClickListener(){

			@Override
			public void onClick(View v) {
				url_edit.setText("www.xxx.com:8080/oa/wap");
			}
			 
		 });
		 String url=settings.getString("httpMain","");
		 if(url.length()>0){
			 url_edit.setText(url.substring(7));
		 }else{
			 url = this.getString(R.string.url_new2);  
			 if(url!=null&&!"".equals(url)){
				 url_edit.setText(url.substring(7));
			 }else{
				   url_edit.setText("");
			 }

		 }
	}
	@Override
	protected void onDestroy() {
		super.onDestroy();
	}

	@Override
	protected void onPause() {
	    String s = url_edit.getText().toString();
	    s ="http://"+s;
		settings.edit().putString("httpMain", s).commit();
		super.onPause();
	}

	@Override
	protected void onResume() {
		super.onResume();
	}

	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		if(keyCode == KeyEvent.KEYCODE_BACK){
			 String s = "";
			 s = url_edit.getText().toString().trim();
			 s ="http://"+s;
			 if(!s.equals("")){
			   settings.edit().putString("httpMain", s).commit();
			   Intent intent=new Intent();
			   intent.setClass(Settings.this, MainActivity.class);
			   startActivity(intent);
			   Settings.this.finish();
			   return true;
			}else{
				Toast.makeText(this, "服务器地址不能为空！", Toast.LENGTH_LONG).show();
				return true;
			}
		}
		return super.onKeyDown(keyCode, event);
	}
}
