package unigo.im;

import java.net.URLEncoder;

import org.jivesoftware.smack.Chat;
import org.jivesoftware.smack.ChatManagerListener;
import org.jivesoftware.smack.ConnectionConfiguration;
import org.jivesoftware.smack.MessageListener;
import org.jivesoftware.smack.SmackConfiguration;
import org.jivesoftware.smack.XMPPConnection;
import org.jivesoftware.smack.packet.Message;
import org.jivesoftware.smack.packet.Presence;

public class Umsg
{
	private String user = null;
	private String pass = null;
	private String url = null;
	private int port = 5222;
	private int keepAliveInterval = 150000;
	private int packetReplyTime = 5000;

	private String appRes = "unigo";
	private String srvName = null;
	private String pushAdmin = "admin";
	private boolean bSendPresence = false;

	private XMPPConnection connection = null;
	private UmsgFilter listener = null;

	public Umsg(UmsgFilter listener)
	{
		this.listener = listener;
	}

	public void setKeepAliveInterval(int keepAliveInterval)
	{
		this.keepAliveInterval = keepAliveInterval;
	}

	public int getKeepAliveInterval()
	{
		return keepAliveInterval;
	}

	public void setPacketReplyTime(int packetReplyTime)
	{
		this.packetReplyTime = packetReplyTime;
	}

	public int getPacketReplyTime()
	{
		return packetReplyTime;
	}

	public void setPushAdmin(String pushAdmin)
	{
		this.pushAdmin = pushAdmin;
	}

	public String getPushAdmin()
	{
		return pushAdmin;
	}

	public void setSendPresence(boolean bSendPresence)
	{
		this.bSendPresence = bSendPresence;
	}

	public boolean getSendPresence()
	{
		return bSendPresence;
	}

	public void setAuthentication(String user, String pass)
	{
		this.user = user;
		this.pass = pass;
	}

	public void setService(String url)
	{
		this.url = url;
	}

	public void setService(String url, int port, String res)
	{
		this.url = url;
		this.port = port;
		this.appRes = res;
	}

	public boolean login()
	{
		String err = null;
		try
		{
			SmackConfiguration.setKeepAliveInterval(keepAliveInterval);
			SmackConfiguration.setPacketReplyTimeout(packetReplyTime);

			ConnectionConfiguration config = new ConnectionConfiguration(url, port);
			config.setCompressionEnabled(false);
			config.setSASLAuthenticationEnabled(false);
			config.setDebuggerEnabled(false);
			config.setReconnectionAllowed(true);
			config.setSendPresence(bSendPresence);
			config.setRosterLoadedAtLogin(false);

			XMPPConnection.DEBUG_ENABLED = false;
			connection = new XMPPConnection(config);
			connection.connect();
			srvName = connection.getServiceName();
			connection.login(user, pass, appRes);

			Presence presence = new Presence(Presence.Type.available);
			presence.setFrom(connection.getUser());
			presence.setTo(pushAdmin + "@" + url + "/" + appRes);
			connection.sendPacket(presence);
			connection.getChatManager().addChatListener(chatListener);
		}
		catch (Exception e)
		{
			err = e.getMessage();
		}
		if (err != null)
		{
			reportError(err);
		}
		return err == null;
	}

	public void close()
	{
		try
		{
			connection.disconnect();
			connection = null;
		}
		catch (Exception e)
		{
		}
	}

	public boolean isConnection()
	{
		boolean b = false;
		try
		{
			b = connection.isConnected();
		}
		catch (Exception e)
		{
		}
		return b;
	}

	public boolean isLogin()
	{
		boolean b = false;
		try
		{
			b = connection.isAuthenticated();
		}
		catch (Exception e)
		{
		}
		return b;
	}

	public void chat(String who, String message)
	{
		String err = null;
		try
		{
			who = URLEncoder.encode(who, "utf-8");
			who = who + "@" + srvName + "/" + appRes;
			Chat chat = connection.getChatManager().createChat(who, msgListener);
			chat.sendMessage(message);
		}
		catch (Exception e)
		{
			err = e.getMessage();
		}
		if (err != null)
		{
			reportError(err);
		}
	}

	public void broadcast(String message)
	{
		String err = null;
		try
		{
			String who = "all@broadcast." + srvName;
			Chat chat = connection.getChatManager().createChat(who, msgListener);
			chat.sendMessage(message);
		}
		catch (Exception e)
		{
			err = e.getMessage();
		}
		if (err != null)
		{
			reportError(err);
		}
	}

	private MessageListener msgListener = new MessageListener()
	{
		public void processMessage(Chat chat, Message message)
		{
			String who = chat.getParticipant();
			String msg = message.getBody();
			reportMessage(who, msg);
		}
	};

	private ChatManagerListener chatListener = new ChatManagerListener()
	{
		public void chatCreated(Chat chat, boolean createdLocally)
		{
			chat.addMessageListener(msgListener);
		}
	};

	private void reportError(String err)
	{
		try
		{
			if (listener != null)
			{
				listener.onError(err);
			}
		}
		catch (Exception e)
		{
		}
	}

	private void reportMessage(String who, String msg)
	{
		try
		{
			if (listener != null)
			{
				String tmp = "all@broadcast." + srvName;
				if (tmp.equals(who))
				{
					listener.onBroadcast(msg);
				}
				else
				{
					int idx = who.indexOf('@');
					if (idx > 0)
					{
						who = who.substring(0, idx);
					}
					listener.onMessage(who, msg);
				}
			}
		}
		catch (Exception e)
		{
		}
	}
}
