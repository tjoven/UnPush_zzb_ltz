package unigo.utility;

public abstract class HttpRun extends HttpBase implements RunCancelable
{

	@Override
	public void run()
	{
		// TODO Auto-generated method stub
		startHttp();
	}

	@Override
	public void cancel()
	{
		// TODO Auto-generated method stub
		cancelHttp();
	}

}
