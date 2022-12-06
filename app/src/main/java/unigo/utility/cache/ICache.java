package unigo.utility.cache;

public interface ICache {
	/**
	 * 缓存用户信息
	 * @param yhid
	 * @param key
	 * @param value
	 */
	void setUserInfo(String yhid, String key, Object value);
	/**
	 * 取得缓存的用户信息
	 * @param yhid
	 * @param key
	 * @return Object
	 */
	Object getUserInfo(String yhid, String key);
	/**
	 * 缓存全局信息
	 * @param module
	 * @param key
	 * @param value
	 */
	void setGlobalInfo(String module, String key, Object value);
	/**
	 * 取得缓存得全局信息
	 * @param module
	 * @param key
	 * @return Object
	 */
	Object getGlobalInfo(String module, String key);
	/**
	 * 删除缓存信息
	 * @param prefix
	 * @param key
	 */
	void removeInfo(String prefix,String key);
	/**
	 * 删除所有以prefix为前缀的key的缓存信息
	 * @param prefix
	 * @param key
	 */
	void removeInfo(String prefix);
}
