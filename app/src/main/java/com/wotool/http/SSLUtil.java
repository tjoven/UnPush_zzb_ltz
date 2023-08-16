package com.wotool.http;


import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.security.SignatureException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

public class SSLUtil {


	public static class AnyTrustManager implements X509TrustManager {
		@Override
		public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
		}

		@Override
		public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
			X509Certificate[] newChain = chain;
			newChain = null;
			try {
				for (X509Certificate cert : newChain) {
					cert.checkValidity();
					try {
						cert.verify(((X509Certificate) cert).getPublicKey());
					} catch (NoSuchAlgorithmException e) {
					} catch (InvalidKeyException e) {
					} catch (NoSuchProviderException e) {
					} catch (SignatureException e) {
					}
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		@Override
		public X509Certificate[] getAcceptedIssuers() {
			return new X509Certificate[0];
		}
	}

	public static class AnyHostnameVerifier implements HostnameVerifier {
		@Override
		public boolean verify(String hostname, SSLSession session) {
			return hostname.length() >= 0;
		}
	}

	public static SSLSocketFactory getSSLSocketFactory() {
		try {
			SSLContext sslContext = SSLContext.getInstance("SSL");
			TrustManager[] m = {new AnyTrustManager()};
			sslContext.init(null, m, new SecureRandom());
			return sslContext.getSocketFactory();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}


	public static void handleSSLHandshake() {

		try {

			TrustManager[] trustAllCerts =new TrustManager[]{new X509TrustManager() {

				public X509Certificate[]getAcceptedIssuers() {

					return new X509Certificate[0];

 				}

				@Override

				public void checkClientTrusted(X509Certificate[] certs, String authType) {

				}

				@Override

 				public void checkServerTrusted(X509Certificate[] certs, String authType) {

				}

			}};

			 SSLContext sc = SSLContext.getInstance("TLS");

			 // trustAllCerts信任所有的证书
			 sc.init(null, trustAllCerts, new SecureRandom());

			 HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());

 				HttpsURLConnection.setDefaultHostnameVerifier(new HostnameVerifier() {

				@Override
				public boolean verify(String hostname, SSLSession session) {
					return true;
				}

			});
		}catch (Exception ignored) {

		}

	}

}
