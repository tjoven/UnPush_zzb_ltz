package unigo.utility.cache;

import java.util.HashMap;
import java.util.Set;
/**
 * 使用hashMap缓存信息，适合单机署时使用
 * @author lin
 *
 */
public class HashMapCacheImpl implements ICache {
	private static HashMap map = new HashMap();

	public Object getGlobalInfo(String module, String key) {
		return map.get(module + key);
	}

	public Object getUserInfo(String yhid, String key) {
		return map.get(yhid + key);
	}

	public void setGlobalInfo(String module, String key, Object value) {
		map.put(module + key, value);

	}

	public void setUserInfo(String yhid, String key, Object value) {
		map.put(yhid + key, value);
	}
	public void setUserInfo(String yhid, String key, Object value,int time) {
		map.put(yhid + key, value);
	}
    public 	void removeInfo(String prefix,String key){
    	map.remove(prefix+key);
    }
    public 	void removeInfo(String prefix){
    	Set set = map.keySet();
    	for(Object key:set){
    		if(String.valueOf(key).startsWith(prefix)){
				map.remove(key);	
			}
    	}
    }
}
