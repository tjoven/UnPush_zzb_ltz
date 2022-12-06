package unigo.utility;

import java.util.LinkedList;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

public class Worker
{
	private boolean bRunning = false;
	private Thread threadDaemon = null;
	private Semaphore lock = new Semaphore(0);
	private LinkedList<RunCancelable> works = new LinkedList<RunCancelable>();

	private int limitWork = 0;
	private RunCancelable currentRun = null;

	public Worker()
	{
	}

	public Worker(int limitWork)
	{
		this.limitWork = limitWork;
	}

	private void doThreadRun() throws Exception
	{
		bRunning = true;

		while (true)
		{
			currentRun = null;
			if (!lock.tryAcquire(30, TimeUnit.SECONDS))
			{
				break;
			}
			if (!bRunning)
			{
				break;
			}
			synchronized (lock)
			{
				if (works.size() > 0)
				{
					currentRun = works.removeFirst();
				}
				else
				{
					currentRun = null;
				}
			}
			try
			{
				if (currentRun != null)
				{
					currentRun.run();
				}
			}
			catch (Exception e)
			{
			}
			if (limitWork == 1)
			{
				break;
			}
			else if (limitWork > 1)
			{
				limitWork--;
			}
		}

		bRunning = false;
		threadDaemon = null;
	}

	public synchronized void start()
	{
		if (threadDaemon == null)
		{
			works.clear();
			lock.drainPermits();
			threadDaemon = new Thread()
			{
				public void run()
				{
					try
					{
						doThreadRun();
					}
					catch (Exception e)
					{
						bRunning = false;
						threadDaemon = null;
					}
				}
			};
			threadDaemon.start();
		}
	}

	public synchronized void stop()
	{
		if (threadDaemon != null)
		{
			bRunning = false;
			threadDaemon = null;
			synchronized (lock)
			{
				int n = works.size();
				for (int i = 0; i < n; i++)
				{
					RunCancelable run = works.get(i);
					if (run != null)
					{
						try
						{
							run.cancel();
						}
						catch (Exception e)
						{
						}
					}
				}
			}
			lock.release();
		}
	}

	public void doWork(RunCancelable run)
	{
		start();
		synchronized (lock)
		{
			works.addLast(run);
		}
		lock.release();
	}

	public void doWorkAtFirst(RunCancelable run)
	{
		start();
		synchronized (lock)
		{
			works.addFirst(run);
		}
		lock.release();
	}

	public void cancelCurrent()
	{
		try
		{
			if (currentRun != null)
			{
				currentRun.cancel();
			}
		}
		catch (Exception e)
		{
		}
	}

	public void cancelAll()
	{
		synchronized (lock)
		{
			int n = works.size();
			for (int i = 0; i < n; i++)
			{
				RunCancelable run = works.get(i);
				if (run != null)
				{
					try
					{
						run.cancel();
					}
					catch (Exception e)
					{
					}
				}
			}
			works.clear();
		}
		cancelCurrent();
	}
}
