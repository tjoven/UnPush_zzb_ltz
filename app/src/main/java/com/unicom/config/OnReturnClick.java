package com.unicom.config;

import android.app.Activity;
import android.view.View;
import android.view.View.OnClickListener;

public class OnReturnClick implements OnClickListener
{
	private Activity context;

	public OnReturnClick(Activity context)
	{
		this.context = context;
	}

	public void onClick(View v)
	{
		context.finish();
	}
}
