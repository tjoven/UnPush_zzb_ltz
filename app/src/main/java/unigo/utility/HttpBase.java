package unigo.utility;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.Socket;
import java.net.URL;
import java.security.cert.CertificateException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.zip.GZIPInputStream;
import java.util.Set;
import android.util.Log;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

public class HttpBase implements HostnameVerifier
{
	private static int flagTrustHost = 0;
	private Object privateData = null;
	private String uri = null;
	private String cki = null;
	private int method = 0;
	private int timeout = 80000;
	private int chunkSize = 0;
	private int httpcode = -1;
	private int nForSocket = 0;
	private int ziptype = 0;
	private HttpURLConnection conn = null;

	public HttpBase()
	{
	}

	public void setPrivateDate(Object obj)
	{
		this.privateData = obj;
	}

	public Object getPrivateDate()
	{
		return privateData;
	}

	public String getMethod()
	{
		if (method == 0)
			return "POST";
		else
			return "GET";
	}

	public void setMethod(String szMethod)
	{
		if (szMethod.compareToIgnoreCase("POST") == 0)
			method = 0;
		else if (szMethod.compareToIgnoreCase("GET") == 0)
			method = 1;
	}

	public int getTimeout()
	{
		return timeout;
	}

	public void setTimeout(int time)
	{
		timeout = time;
	}

	public int getChunkSize()
	{
		return chunkSize;
	}

	public void setChunkSize(int size)
	{
		chunkSize = size;
	}

	public int getHttpCode()
	{
		return httpcode;
	}

	public String getUrl()
	{
		return uri;
	}

	public void setUrl(String url)
	{
		uri = url;
	}

	public String getCookie()
	{
		return cki;
	}

	public void setCookie(String cookie)
	{
		cki = cookie;
	}

	public void setForSocket(int v)
	{
		nForSocket = v;
	}

	public void cancelHttp()
	{
		try
		{
			conn.disconnect();
			conn = null;
		}
		catch (Exception e)
		{
		}
	}

	public void startHttp()
	{
		if (uri == null)
		{
			end(-1, "empty url");
			return;
		}
		String pref = "http://localhost/";
		String temp = uri.substring(0, pref.length());
		
		if (temp.compareToIgnoreCase(pref) == 0)
		{
			doLocalStart(uri.substring(pref.length()));
		}
		else if (nForSocket == 0)
		{
			dohttpStart();
		}
		else if (nForSocket == 1)
		{
			dohttpStart2();
		}
	}

	private void doLocalStart(String path)
	{
		String msg = null;
		try
		{
			throw new Exception("unsupported");
		}
		catch (Exception e)
		{
			msg = e.getMessage();
		}
		try
		{
			end(msg == null ? 200 : -1, msg);
		}
		catch (Exception e)
		{
		}
	}

	private void dohttpStart2()
	{
		Socket socket = null;
		OutputStream dout = null;
		try
		{
			URL url = new URL(uri);
			String host = url.getHost();
			int nPort = url.getPort();
			if (nPort < 0)
				nPort = 80;
			socket = new Socket(host, nPort);
			new SocketReader(socket);

			conn = (HttpURLConnection) url.openConnection();
			conn.setRequestProperty("Accept", "*/*");
			conn.setRequestProperty("User-Agent", "Mobile XML");
			conn.setRequestProperty("Content-Type", "text/xml");
			conn.setRequestProperty("Content-Length", String.valueOf(OverallDataSize()));
			if (cki != null && cki.length() > 0)
				conn.setRequestProperty("Cookie", cki);

			setRequestProperty(conn);

			StringBuilder postData = new StringBuilder();
			postData.append(getMethod());
			postData.append(" ");
			postData.append(url.getPath());
			postData.append(" HTTP/1.1\r\n");
			List<String> list;
			Entry<String, List<String>> entry;
			Map<String, List<String>> vals = conn.getRequestProperties();
			Set<Entry<String, List<String>>> set = vals.entrySet();
			Iterator<Entry<String, List<String>>> ite = set.iterator();
			while (ite.hasNext())
			{
				entry = ite.next();
				postData.append(entry.getKey());
				postData.append(" : ");
				list = entry.getValue();
				for (int i = 0; i < list.size(); i++)
				{
					if (i != 0)
						postData.append(";");
					postData.append(list.get(i));
				}
				postData.append("\r\n");
			}
			postData.append("\r\n");

			dout = socket.getOutputStream();
			dout.write(postData.toString().getBytes("utf-8"));
			PostSendData(dout);
			dout.flush();
			dout.close();
			dout = null;
			// response.length;
		}
		catch (Exception e)
		{
			System.out.println(e.getMessage());
		}

		try
		{
			if (dout != null)
				dout.close();
		}
		catch (Exception e)
		{
		}
	}

	private void dohttpStart()
	{
		Log.e("HttpBase", "开始下载");
		String errMsg = null;
		OutputStream dout = null;
		InputStream din = null;
		httpcode = -1;
		try
		{
			// initialize
			URL url = new URL(uri);
			Log.e("HttpBase", "url="+url+" protocol="+url.getProtocol());
			if (url.getProtocol().equalsIgnoreCase("https"))
			{
				trustAllHost();
				HttpsURLConnection https = (HttpsURLConnection) url.openConnection();
				https.setHostnameVerifier(this);
				conn = https;
			}
			else
			{
				conn = (HttpURLConnection) url.openConnection();
			}
			conn.setDoInput(true);
			conn.setDoOutput(method == 0);
			conn.setUseCaches(false);
			conn.setRequestMethod(getMethod());
			conn.setReadTimeout(timeout);
			conn.setConnectTimeout(timeout);
			conn.setRequestProperty("Accept", "*/*");
			conn.setRequestProperty("User-Agent", "Mobile XML");
			conn.setRequestProperty("Content-Type", "text/xml");
			if (chunkSize == 0)
				conn.setRequestProperty("Content-Length", String.valueOf(OverallDataSize()));
			else
				conn.setChunkedStreamingMode(chunkSize);
			if (cki != null && cki.length() > 0)
				conn.setRequestProperty("Cookie", cki);
			setRequestProperty(conn);

			// connect
			conn.connect();

			// send
			if (method == 0)
			{
				dout = conn.getOutputStream();
				PostSendData(dout);
				dout.flush();
				dout.close();
				dout = null;
			}

			// check
			try
			{
				httpcode = conn.getResponseCode();
				Log.e("HttpBase", "httpcode="+conn.getResponseCode());
			}
			catch (Exception e)
			{
			}

			// headers
			Map<String, List<String>> mapHeaders = conn.getHeaderFields();

			// cookie
			List<String> list = mapHeaders.get("Set-Cookie");
			if (list != null)
			{
				int n = list.size();
				StringBuilder sb = new StringBuilder();
				for (int i = 0; i < n; i++)
				{
					if (i > 0)
					{
						sb.append(";");
					}
					sb.append(list.get(i));
				}
				GetCookie(sb.toString());
			}

			// gzip
			list = mapHeaders.get("Content-Encoding");
			Log.e("HttpBase", "list="+list);
			if (list != null)
			{
				int n = list.size();
				StringBuilder sb = new StringBuilder();
				for (int i = 0; i < n; i++)
				{
					if (i > 0)
					{
						sb.append(";");
					}
					sb.append(list.get(i));
				}
				ziptype = sb.toString().equals("gzip") ? 1 : 0;
			}

			// response
			getResponseProperty(httpcode, conn);

			// receive
			din = conn.getInputStream();
			GetRecvData(ziptype == 1 ? new GZIPInputStream(din) : din);
			din.close();
			din = null;

			// close
			conn.disconnect();
			conn = null;
		}
		catch (Exception e)
		{
			errMsg = e.getMessage();
		}

		try
		{
			if (conn != null)
				conn.disconnect();
		}
		catch (Exception e)
		{
		}

		try
		{
			if (dout != null)
				dout.close();
		}
		catch (Exception e)
		{
		}

		try
		{
			if (din != null)
				din.close();
		}
		catch (Exception e)
		{
		}

		try
		{
			if (httpcode != 200 && (errMsg == null || errMsg.equals("null")))
			{
				errMsg = "网络连接中断";
			}
			end(httpcode, errMsg);
		}
		catch (Exception e)
		{
		}
	}

	protected InputStream debugInputData(InputStream din) throws Exception
	{
		byte[] d = ByteHelper.getAllData(din);
		try
		{
			String str = new String(d, "utf-8");
			System.out.println(str);
		}
		catch (Exception e)
		{
		}
		ByteArrayInputStream is = new ByteArrayInputStream(d);
		return is;
	}

	protected byte[] getAllData(InputStream din) throws Exception
	{
		return ByteHelper.getAllData(din);
	}

	protected void setRequestProperty(HttpURLConnection conn)
	{
	}

	protected void getResponseProperty(int code, HttpURLConnection conn)
	{
	}

	protected long OverallDataSize()
	{
		return 0;
	}

	protected void PostSendData(OutputStream dout)
	{
	}

	protected void GetRecvData(InputStream din)
	{
	}

	protected void GetCookie(String cookie)
	{
		cki = cookie;
	}

	protected void end(int code, String err)
	{
	}

	public boolean verify(String hostname, SSLSession session)
	{
		return true;
	}

	private synchronized void trustAllHost()
	{
		try
		{
			if (flagTrustHost != 0)
			{
				return;
			}
			TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager()
			{
				public java.security.cert.X509Certificate[] getAcceptedIssuers()
				{
					return new java.security.cert.X509Certificate[] {};
				}

				public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) throws CertificateException
				{
				}

				public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) throws CertificateException
				{
				}
			} };
			SSLContext sc = SSLContext.getInstance("TLS");
			sc.init(null, trustAllCerts, new java.security.SecureRandom());
			HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
			flagTrustHost = 1;
		}
		catch (Exception e)
		{
			System.out.println(e.getMessage());
		}
	}

	class SocketReader implements Runnable
	{
		private Socket socket;

		public SocketReader(Socket socket)
		{
			this.socket = socket;
			Thread t = new Thread(this);
			t.start();
			try
			{
				Thread.sleep(0);
			}
			catch (Exception e)
			{
			}
		}

		public void run()
		{
			InputStream din = null;
			try
			{
				din = socket.getInputStream();
				byte[] response = ByteHelper.getAllData(din);
				String str = new String(response, "utf-8");
				System.out.println(str);
			}
			catch (Exception e)
			{
				System.out.println(e.getMessage());
			}

			try
			{
				if (din != null)
				{
					din.close();
				}
			}
			catch (Exception e)
			{
			}

			try
			{
				if (socket != null)
					socket.close();
			}
			catch (Exception e)
			{
			}
		}
	}
}
