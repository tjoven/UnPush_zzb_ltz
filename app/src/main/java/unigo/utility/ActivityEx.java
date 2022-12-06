package unigo.utility;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Bundle;

public class ActivityEx extends Activity
{
	protected static Activity activity = null;
	protected static Context acontext = null;

	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		activity = this;
	}

	protected void onResume()
	{
		super.onResume();
		activity = this;
	}

	protected void onSaveInstanceState(Bundle outState)
	{
		super.onSaveInstanceState(outState);
		Common.onSaveInstanceState(outState);
	}

	protected void onRestoreInstanceState(Bundle savedInstanceState)
	{
		super.onRestoreInstanceState(savedInstanceState);
		Common.onRestoreInstanceState(savedInstanceState);
	}

	public void showAlert(String title, String message, boolean bExit)
	{
		final boolean b = bExit;
		AlertDialog alert = new AlertDialog.Builder(this).create();
		alert.setTitle(title);
		alert.setMessage(message);
		alert.setButton(DialogInterface.BUTTON_POSITIVE, "确认", new DialogInterface.OnClickListener()
		{
			public void onClick(DialogInterface dialog, int which)
			{
				if (b)
				{
					activity.finish();
				}
			}
		});
		alert.show();
	}

	public static Activity getActivity()
	{
		return activity;
	}

	public static Context getContext()
	{
		if (activity != null)
			return activity;
		return acontext;
	}
}
