package com.unicom.config;

import com.unicom.baseoa.Settings;

import android.content.Intent;
import android.view.View;
import android.view.View.OnClickListener;

class OnSettingsClick implements OnClickListener
{
	private WndConfig context;

	public OnSettingsClick(WndConfig context)
	{
		this.context = context;
	}

	public void onClick(View v)
	{
		context.startActivity(new Intent(context, Settings.class));
	}
}
