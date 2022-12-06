package unigo.utility;

import org.xmlpull.v1.XmlPullParser;

public class HttpHandler
{
	public static int nMaxNest = 300;

	protected int safeNest = 0;
	protected int evtType = 0;
	protected String evtTag = null;
	protected String evtValue = null;

	private String updateClue = null;
	private boolean bHasUpdate = false;

	protected int isTagInArray(String[] tags, String tag)
	{
		int ret = -1;
		if (tag != null && tag.length() > 0)
		{
			for (int i = 0; i < tags.length; i++)
			{
				if (tags[i].equals(tag))
				{
					ret = i;
					break;
				}
			}
		}
		return ret;
	}

	protected int nextNode(XmlPullParser xmlParser) throws Exception
	{
		parseDefault(xmlParser);

		evtType = xmlParser.next();

		safeNest++;
		if (safeNest > nMaxNest)
		{
			throw new Exception("nest error");
		}

		return evtType;
	}

	private void parseDefault(XmlPullParser xmlParser)
	{
		if (evtType == XmlPullParser.START_TAG)
		{
			if ("update".equals(evtTag))
			{
				bHasUpdate = true;
			}
		}
		else if (evtType == XmlPullParser.TEXT)
		{
			if (bHasUpdate)
			{
				updateClue = xmlParser.getText();
			}
		}
		else if (evtType == XmlPullParser.END_TAG)
		{
			if ("update".equals(evtTag))
			{
				bHasUpdate = false;
			}
			if (!bHasUpdate)
			{
				return;
			}
			else if ("clue".equals(evtTag))
			{
				update(updateClue);
			}
		}
	}

	private void update(String clue)
	{
		Common.updateClue = clue;
		// Intent intent = LayoutFactory.canIntentAction(clue);
		// App.startActivity(intent);
	}
}
