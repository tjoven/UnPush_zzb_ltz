package unigo.utility;

import android.os.Handler;
import android.os.Message;

public abstract class RunnableEx implements RunCancelable
{
	private Handler handler = null;
	private Message message = null;
	private Object object = null;

	public RunnableEx(Object obj)
	{
		this.object = obj;
	}

	public RunnableEx(Handler handler, Message message, Object obj)
	{
		this.handler = handler;
		this.message = message;
		this.object = obj;
	}

	public final void run()
	{
		try
		{
			doRun(object);
		}
		catch (Exception e)
		{
			Log.write(2, "RunnableEx.run", e.getMessage(),"");
		}
		if (handler != null && message != null)
		{
			handler.sendMessage(message);
		}
	}

	public final void cancel()
	{
		try
		{
			doCancel(object);
		}
		catch (Exception e)
		{
			Log.write(2, "RunnableEx.cancel", e.getMessage(),"");
		}
		if (handler != null && message != null)
		{
			handler.sendMessage(message);
		}
	}

	protected void doRun(Object obj)
	{
	}

	protected void doCancel(Object obj)
	{
	}
}
