package unigo.utility;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ByteHelper
{
	public static int indexOf(byte[] source, byte[] bb)
	{
		if (bb == null || source == null)
			return -1;
		if (bb.length == 0 || source.length == 0)
			return -1;

		return indexOf(source, 0, source.length, bb, 0, bb.length, 0);
	}

	public static int indexOf(byte[] source, byte[] bb, int fromIndex)
	{
		if (bb == null || source == null)
			return -1;
		if (bb.length == 0 || source.length == 0)
			return -1;

		return indexOf(source, 0, source.length, bb, 0, bb.length, fromIndex);
	}

	public static int lastIndexOf(byte[] source, byte[] bb)
	{
		if (bb == null || source == null)
			return -1;
		if (bb.length == 0 || source.length == 0)
			return -1;

		return lastIndexOf(source, 0, source.length, bb, 0, bb.length, source.length);
	}

	public static int lastIndexOf(byte[] source, byte[] bb, int fromIndex)
	{
		if (bb == null || source == null)
			return -1;
		if (bb.length == 0 || source.length == 0)
			return -1;

		return lastIndexOf(source, 0, source.length, bb, 0, bb.length, fromIndex);
	}

	private static int indexOf(byte[] source, int sourceOffset, int sourceCount, byte[] target, int targetOffset, int targetCount, int fromIndex)
	{
		if (fromIndex >= sourceCount)
		{
			return (targetCount == 0 ? sourceCount : -1);
		}
		if (fromIndex < 0)
		{
			fromIndex = 0;
		}
		if (targetCount == 0)
		{
			return fromIndex;
		}

		byte first = target[targetOffset];
		int max = sourceOffset + (sourceCount - targetCount);

		for (int i = sourceOffset + fromIndex; i <= max; i++)
		{
			if (source[i] != first)
			{
				while (++i <= max && source[i] != first)
					;
			}

			if (i <= max)
			{
				int j = i + 1;
				int end = j + targetCount - 1;
				for (int k = targetOffset + 1; j < end && source[j] == target[k]; j++, k++)
					;

				if (j == end)
				{
					return i - sourceOffset;
				}
			}
		}
		return -1;
	}

	private static int lastIndexOf(byte[] source, int sourceOffset, int sourceCount, byte[] target, int targetOffset, int targetCount, int fromIndex)
	{
		int rightIndex = sourceCount - targetCount;
		if (fromIndex < 0)
		{
			return -1;
		}
		if (fromIndex > rightIndex)
		{
			fromIndex = rightIndex;
		}
		if (targetCount == 0)
		{
			return fromIndex;
		}

		int strLastIndex = targetOffset + targetCount - 1;
		byte strLastChar = target[strLastIndex];
		int min = sourceOffset + targetCount - 1;
		int i = min + fromIndex;

		startSearchForLastChar: while (true)
		{
			while (i >= min && source[i] != strLastChar)
			{
				i--;
			}
			if (i < min)
			{
				return -1;
			}
			int j = i - 1;
			int start = j - (targetCount - 1);
			int k = strLastIndex - 1;

			while (j > start)
			{
				if (source[j--] != target[k--])
				{
					i--;
					continue startSearchForLastChar;
				}
			}
			return start - sourceOffset + 1;
		}
	}

	public static byte[] getAllData(InputStream din) throws Exception
	{
		int len;
		byte[] dest = new byte[0];
		byte[] buff = new byte[1024];
		while (true)
		{
			len = din.read(buff);
			if (len < 0)
				break;
			else if (len == 0)
				continue;
			byte[] tmp = new byte[dest.length + len];
			System.arraycopy(dest, 0, tmp, 0, dest.length);
			System.arraycopy(buff, 0, tmp, dest.length, len);
			dest = tmp;
		}
		return dest;
	}

	public static int getByteStream(byte[] data, int pos, int len, InputStream in)
	{
		int ret = 0;
		try
		{
			int orgp = pos;
			int orgl = len;
			while (true)
			{
				if (len <= 0)
					return ret;
				if (pos >= orgl + orgp)
					return ret;
				int n = in.read(data, pos, len);
				if (n < 0)
					return ret;
				if (n == 0)
					Thread.sleep(100);
				pos += n;
				len -= n;
				ret += n;
			}
		}
		catch (Exception e)
		{
		}
		return ret;
	}

	public static Map<String, Object> find(InputStream din, ArrayList<Object> findItems, int nBuflen)
	{
		if (findItems == null || din == null)
		{
			return null;
		}

		HashMap<String, Object> ret = new HashMap<String, Object>();

		int nFailed = 0;
		int nDataLen = 0;
		byte[] data = new byte[nBuflen];
		while (true)
		{
			nFailed = 0;

			for (int i = 0; i < findItems.size(); i++)
			{
				@SuppressWarnings("unchecked")
				ArrayList<Object> findItem = (ArrayList<Object>) findItems.get(i);
				if (findItem == null || findItem.size() < 3)
				{
					nFailed++;
					continue;
				}
				String hint = (String) findItem.get(0);
				byte[] find1 = (byte[]) findItem.get(1);
				byte[] find2 = (byte[]) findItem.get(2);

				int pos = 0;
				ElementResult ele = null;
				while (true)
				{
					ele = getElement(find1, find2, data, nDataLen, pos, ele);
					if (ele == null || ele.code == -2)
					{
						nFailed++;
						break;
					}
					else if (ele.code == -1)
					{
						int len = nDataLen - ele.pos;
						System.arraycopy(data, ele.pos, data, 0, len);
						nDataLen = getByteStream(data, len, data.length - len, din);
						if (nDataLen < 0)
							nDataLen = 0;
						nDataLen += len;
						pos = 0;
						continue;
					}
					else
					{
						pos = ele.pos + ele.data.length;
						int len = nDataLen - pos;
						System.arraycopy(data, pos, data, 0, len);
						nDataLen = getByteStream(data, len, data.length - len, din);
						if (nDataLen < 0)
							nDataLen = 0;
						nDataLen += len;
					}

					@SuppressWarnings("unchecked")
					ArrayList<byte[]> list = (ArrayList<byte[]>) ret.get(hint);
					if (list == null)
					{
						list = new ArrayList<byte[]>();
						ret.put(hint, list);
					}
					list.add(ele.data);
					break;
				}
			}

			if (nFailed == findItems.size())
			{
				nDataLen = getByteStream(data, 0, data.length, din);
				if (nDataLen <= 0)
					break;
			}
		}

		return ret;
	}

	public static ElementResult getElement(byte[] ele1, byte[] ele2, byte[] data, int len, int fromIndex, ElementResult er)
	{
		if (ele1 == null || ele1.length <= 0)
			return null;
		if (ele2 == null || ele2.length <= 0)
			return null;
		if (data == null || len <= 0)
			return null;
		if (fromIndex >= len)
			return null;
		if (fromIndex < 0)
			fromIndex = 0;

		int idx1 = indexOf(data, 0, len, ele1, 0, ele1.length, fromIndex);
		if (idx1 < 0)
			return null;

		if (er == null)
			er = new ElementResult(null, 0, -1);
		else if (er.code >= 0)
			er.code = -1;
		else
			er.code = -2;
		er.pos = idx1;

		int idx2 = indexOf(data, 0, len, ele2, 0, ele2.length, idx1 + ele1.length);
		if (idx2 < 0)
			return er;

		len = idx2 - idx1 + ele2.length;
		byte[] element = new byte[len];
		System.arraycopy(data, idx1, element, 0, len);
		er.data = element;
		er.code = 0;
		return er;
	}

	public static InputStream debugInputStream(InputStream din, String code) throws Exception
	{
		boolean bDebug = false;
		if (bDebug)
		{
			byte[] data = getAllData(din);
			String str = new String(data, code);
			System.out.println(str);
			ByteArrayInputStream is = new ByteArrayInputStream(data);
			return is;
		}
		else
		{
			return din;
		}
	}
}

class ElementResult
{
	public byte[] data;
	public int pos;
	public int code;

	public ElementResult(byte[] data, int pos, int code)
	{
		this.data = data;
		this.pos = pos;
		this.code = code;
	}
}
