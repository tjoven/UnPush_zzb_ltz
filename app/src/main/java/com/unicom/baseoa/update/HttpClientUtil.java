
package com.unicom.baseoa.update;
import java.io.IOException;
import java.io.InputStream;
import java.security.KeyStore;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;

import org.apache.http.HttpVersion;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;
import org.apache.http.protocol.HTTP;

import com.unicom.baseoa.WebViewWnd;
import com.unicom.baseoa.update.EasySSLSocketFactory;

import android.content.Context;
 
/**
 * HttpClient 绕过https
 * @author 
 * @data 2016年7月27日 上午11:24:01
 * @see 
 * @version 1.0
 *
 */
 
@SuppressWarnings("deprecation")
public class HttpClientUtil {
 
	/**
	 * 获取HttpClient
	 * 
	 * @return
	 */
	public static DefaultHttpClient getNewHttpClient() {
		try {
			KeyStore trustStore = null;
			EasySSLSocketFactory sf = null;
			trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
			trustStore.load(null, null);
			sf = new EasySSLSocketFactory(trustStore);
			
			sf.setHostnameVerifier(SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER);
 
			HttpParams params = new BasicHttpParams();
			HttpProtocolParams.setVersion(params, HttpVersion.HTTP_1_1);
			HttpProtocolParams.setContentCharset(params, HTTP.UTF_8);
			SchemeRegistry registry = new SchemeRegistry();
			registry.register(new Scheme("http", PlainSocketFactory.getSocketFactory(), 80));
			registry.register(new Scheme("https", sf, 443));
			ClientConnectionManager ccm = new ThreadSafeClientConnManager(params, registry);
			return new DefaultHttpClient(ccm, params);
		} catch (Exception e) {
			return new DefaultHttpClient();
		}
	}
	public static DefaultHttpClient getNewHttpClient(Context context) {
		try {
			KeyStore trustStore = null;
			EasySSLSocketFactory sf = null;
			trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
			trustStore.load(null, null);
			trustStore.setCertificateEntry("domain", getX509Certificate(context));
			sf = new EasySSLSocketFactory(trustStore);
			
			sf.setHostnameVerifier(SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER);
 
			HttpParams params = new BasicHttpParams();
			HttpProtocolParams.setVersion(params, HttpVersion.HTTP_1_1);
			HttpProtocolParams.setContentCharset(params, HTTP.UTF_8);
			SchemeRegistry registry = new SchemeRegistry();
			//registry.register(new Scheme("http", PlainSocketFactory.getSocketFactory(), 80));
			registry.register(new Scheme("https", sf, 443));
			ClientConnectionManager ccm = new ThreadSafeClientConnManager(params, registry);
			return new DefaultHttpClient(ccm, params);
		} catch (Exception e) {
			return new DefaultHttpClient();
		}
	}
	  public static X509Certificate getX509Certificate(Context context) throws IOException, CertificateException {
	       InputStream in = context.getAssets().open("domain");
	       CertificateFactory instance = CertificateFactory.getInstance("X.509");
	       X509Certificate certificate = (X509Certificate) instance.generateCertificate(in);
	       return certificate;
	   }
 
}