package com.sdunisi.oa.version;

import unigo.utility.Worker;
import android.app.Activity;

public class Version
{
	private Activity context;

	public Version(Activity context)
	{
		this.context = context;
	}

	public void check()
	{
		Worker worker = new Worker(1);
		worker.doWork(new HttpVersion(context));
	}
}
