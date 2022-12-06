package com.wotool.http;

import java.io.File;
import java.util.Map;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;

import android.app.ProgressDialog;
import android.content.Context;
import android.os.AsyncTask;
import android.widget.Toast;

import com.unicom.baseoa.WebViewWnd;
import com.wotool.http.CustomMultipartEntity.ProgressListener;

public class HttpMultipartPost extends AsyncTask<String, Integer, String> {

	private Context context;
	private File file;
	private String url;
	private String filepath;
	private String zid;
	private Map<String,String> paraMap;
	private ProgressDialog pd;
	private long totalSize;
	
	private boolean uploadSuccess = false;

	public HttpMultipartPost(Context context, File file,String url,Map<String,String> paraMap) {
		this.context = context;
		this.file = file;
		this.url = url;
		this.paraMap = paraMap;
	}

	@Override
	protected void onPreExecute() {
		pd = new ProgressDialog(context);
		pd.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
		pd.setMessage("图片上传中,请稍后...");
		pd.setCancelable(false);
		pd.show();
	}

	@Override
	protected String doInBackground(String... params) {
		String serverResponse = null;

		HttpClient httpClient = new DefaultHttpClient();
		HttpContext httpContext = new BasicHttpContext();
		HttpPost httpPost = new HttpPost(url);

		try {
			CustomMultipartEntity multipartContent = new CustomMultipartEntity(
					new ProgressListener() {
						@Override
						public void transferred(long num) {
							publishProgress((int) ((num / (float) totalSize) * 100));
						}
					});

			// We use FileBody to transfer an image
			
	         if (paraMap != null && !paraMap.isEmpty()) {
	             for (Map.Entry<String, String> entry : paraMap.entrySet()) {
	            	 multipartContent.addPart(entry.getKey(), new StringBody(entry.getValue()));
	             }
	         }
	        multipartContent.addPart("data", new FileBody(file));
			totalSize = multipartContent.getContentLength();

			// Send it
			httpPost.setEntity(multipartContent);
			HttpResponse response = httpClient.execute(httpPost);
			uploadSuccess = true;//上传成功
	        file.delete();    
		} catch (Exception e) {
			e.printStackTrace();
		}

		return serverResponse;
	}

	@Override
	protected void onProgressUpdate(Integer... progress) {
		pd.setProgress((int) (progress[0]));
	}

	@Override
	protected void onPostExecute(String result) {
		System.out.println("result: " + result);
		pd.dismiss();
		//回调js方法,显示图片
		if(uploadSuccess){//上传成功
		 WebViewWnd wv = (WebViewWnd)context;
         wv.loadurl(wv.getWebView(),"javascript:loadpic('"+file.getName()+"','"+wv.getHostUrl()+"')");
		}else{
		  Toast.makeText(context, "图片上传服务器失败，请检查网络.", Toast.LENGTH_SHORT).show();
		}
	}

	@Override
	protected void onCancelled() {
		System.out.println("cancle");
	}
	public void hideProgressDialog(){
		pd.dismiss();
	}

}
