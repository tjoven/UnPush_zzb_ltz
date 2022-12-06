package unigo.im;

public abstract class UmsgFilter
{
	public void onMessage(String who, String msg)
	{
	}

	public void onBroadcast(String msg)
	{
	}

	public void onError(String msg)
	{
	}
}
