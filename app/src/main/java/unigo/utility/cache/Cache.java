package unigo.utility.cache;

/**
 * 系统内不使用session，全部通过此方法进行存储
 */
public class Cache {
	private static ICache cache = new HashMapCacheImpl();

	public static void setUserInfo(String yhid, String key, Object value) {
		cache.setUserInfo(yhid, key, value);
	}

	public static Object getUserInfo(String yhid, String key) {
		return cache.getUserInfo(yhid, key);
	}

	public static void setGlobalInfo(String module, String key, Object value) {
		cache.setGlobalInfo(module, key, value);
	}

	public static Object getGlobalInfo(String module, String key) {
		return cache.getGlobalInfo(module, key);
	}
	public static void removeInfo(String prefix,String key){
		cache.removeInfo(prefix, key);
	}
	public static void removeInfo(String prefix){
		cache.removeInfo(prefix);
	}
	public static ICache getInstance()
	{
		return cache;
	}
}
