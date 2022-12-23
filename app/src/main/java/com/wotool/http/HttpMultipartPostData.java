package com.wotool.http;

import java.io.File;
import java.nio.charset.Charset;
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
import android.text.TextUtils;
import android.util.Log;
import android.widget.Toast;

import com.unicom.baseoa.WebViewWnd;
import com.unicom.baseoa.update.HttpClientUtil;
import com.wotool.http.CustomMultipartEntity.ProgressListener;

public class HttpMultipartPostData extends AsyncTask<String, Integer, String> {

	private Context context;
	private File file;
	private String url;
	private String filepath;
	private String filename;
	private String guid;
	private String zid;
	private Map<String,String> paraMap;
	private ProgressDialog pd;
	private long totalSize;
	private boolean uploadSuccess = false;//表示上传是否成功

	public HttpMultipartPostData(Context context, File file,String url,Map<String,String> paraMap) {
		this.context = context;
		this.file = file;
		this.url = url;
		this.paraMap = paraMap;
		filename=file.getName();
	}

	@Override
	protected void onPreExecute() {
		pd = new ProgressDialog(context);
		pd.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
		pd.setMessage("文件上传中,请稍候...");
		pd.setCancelable(false);
		pd.show();
	}

	@Override
	protected String doInBackground(String... params) {
		String serverResponse = null;

		//旧的方式走http
		//HttpClient httpClient = new DefaultHttpClient();
		//新的方式走https
		DefaultHttpClient httpClient = HttpClientUtil.getNewHttpClient(context);
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
	            	 multipartContent.addPart(entry.getKey(), new StringBody(entry.getValue(),Charset.forName("UTF-8")));
	             }
	         }
	         multipartContent.addPart("data", new FileBody(file));
			totalSize = multipartContent.getContentLength();

			// Send it
			httpPost.setEntity(multipartContent);
			HttpResponse response = httpClient.execute(httpPost);
			uploadSuccess = true;//上传成功
			serverResponse = EntityUtils.toString(response.getEntity());
			Log.e("HttpMultiPartPostData", "serverResponse="+serverResponse);
			if(!TextUtils.isEmpty(serverResponse)){
				JSONObject jsons = new JSONObject(serverResponse);
				zid = jsons.optString("zid");
				filepath = jsons.optString("filepath");
				guid=jsons.optString("guid");
			}

	         //file.delete();    
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
			String callback="loadpic";
			if(paraMap.get("callback")!=null&&!"".equals(paraMap.get("callback"))){
				callback=paraMap.get("callback");
			}
			WebViewWnd wv = (WebViewWnd)context;
	        String imgSrc = filepath;
	        if(paraMap.get("jstx") != null){
				if(paraMap.get("callback").equals("showUploadFile")){
					wv.loadurl(wv.getWebView(),"javascript:"+callback+"('"+paraMap.get("fileName")+"')");
				}else{
					wv.loadurl(wv.getWebView(),"javascript:"+callback+"('"+paraMap.get("fileName")+"','"+paraMap.get("filePath")+"')");
				}
			}else{
	        	wv.loadurl(wv.getWebView(),"javascript:"+callback+"('"+zid+"','"+imgSrc+"','"+filename+"','"+guid+"')");
	        }
		}else{
			  Toast.makeText(context, "上传服务器失败，请检查网络.", Toast.LENGTH_SHORT).show();
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
