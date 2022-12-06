package com.unicom.config;

import com.sdunisi.oa.version.Version;
import android.view.View;
import android.view.View.OnClickListener;

class OnUpdateClick implements OnClickListener
{
	private WndConfig context;

	public OnUpdateClick(WndConfig context)
	{
		this.context = context;
	}

	public void onClick(View v)
	{
		new Version(context).check();//检查是否有版本更新
//		DownApk d = new DownApk(context);
//		d.update2();
	}
}
