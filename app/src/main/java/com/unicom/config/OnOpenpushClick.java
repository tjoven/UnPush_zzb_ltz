package com.unicom.config;

import com.unicom.sywq.R;

import android.app.Activity;
import android.content.SharedPreferences;
import android.view.View;
import android.view.View.OnClickListener;

public class OnOpenpushClick implements OnClickListener
{
	private Activity context;
	//private TextView openpushMsg;
	public OnOpenpushClick(Activity context)
	{
		this.context = context;
		initial();
	}

	private void initial()
	{
		View view = context.findViewById(R.id.id_config_openpush);
		//openpushMsg = (TextView) context.findViewById(R.id.id_config_openpushMsg);
		String str = context.getString(R.string.SETTING_INFOS);
		SharedPreferences settings = context.getSharedPreferences(str, 0);
		boolean openPushFlag=settings.getBoolean("openPushFlag", true);
		//String openPushFlagMsg=settings.getString("openPushFlagMsg", context.getString(R.string.openpushMsg1));
		view.setSelected(openPushFlag);
		//openpushMsg.setText(openPushFlagMsg);
	}

	public void onClick(View v)
	{
		SharedPreferences settings = context.getSharedPreferences(context.getString(R.string.SETTING_INFOS), 0);
		if(v.isSelected()){
			settings.edit().putBoolean("openPushFlag", false).commit();
			v.setSelected(false);
			WndConfig.instance.showMessage("程序退出时生效");
			//WebViewWnd.instance.stopIMService();
		}else{
			settings.edit().putBoolean("openPushFlag", true).commit();
			v.setSelected(true);
			WndConfig.instance.showMessage("程序重新登录时生效");
			//WebViewWnd.instance.startIMService();
		}
		//openpushMsg = (TextView) context.findViewById(R.id.id_config_openpushMsg);
		//String openPushFlagMsg=settings.getString("openPushFlagMsg", context.getString(R.string.openpushMsg1));
		//openpushMsg.setText(openPushFlagMsg);
	}
}
