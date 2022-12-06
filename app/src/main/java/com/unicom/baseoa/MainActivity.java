package com.unicom.baseoa;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;

import com.unicom.baseoa.splash.WndSplash;
import com.unicom.baseoa.util.Utility;
import com.unicom.sywq.R;


public class MainActivity extends Activity {
	

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		//SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		//settings.edit().putString("httpMain", "http://221.2.158.148:8080/JJY/demos/index.html").commit();

	}

	
	@Override
	protected void onStart() {
		super.onStart();
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		Utility.iURL = settings.getString("httpMain","");
		if(Utility.iURL.equals("")){
			Utility.iURL = this.getString(R.string.url_new2);
			if(Utility.iURL.equals("")){
			Intent intent=new Intent();
			intent.setClass(MainActivity.this, Settings.class);
			startActivity(intent);
			finish();
			}
		}
	}


	@Override
	protected void onDestroy() {
		super.onDestroy();
	}

	@Override
	protected void onPause() {
		super.onPause();
	}

	@Override
	protected void onResume() {
		super.onResume();
		SharedPreferences settings = getSharedPreferences(getString(R.string.SETTING_INFOS), 0);
		Utility.iURL = settings.getString("httpMain","");
		Utility.iURL = Utility.iURL.equals("")?this.getString(R.string.url_new2):Utility.iURL;
		if(!Utility.iURL.equals("")){
			Intent intent=new Intent();
			//intent.setClass(MainActivity.this, WndSplash.class);
			intent.setClass(MainActivity.this, WebViewWnd.class);
			startActivity(intent);
			finish();
		}
	}
}