package com.unicom.config;

import java.io.*;
import java.util.Map;
import java.util.zip.*;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONArray;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Handler;
import android.widget.Toast;

import com.unicom.baseoa.WebViewWnd;
import com.unicom.baseoa.util.TimeUtil;
import com.unicom.sywq.R;

public class OnUploadLog{
	private Context context;
	ProgressDialog pd=null;
	
	public OnUploadLog(Context context) {
		this.context = context;
		//进度条
    	pd=new ProgressDialog(context);
        pd.setProgressStyle(ProgressDialog.STYLE_SPINNER);
	}

	public void doZip(String zipFilePath,String sourcePath) throws Exception {
		String username=WebViewWnd.instance.getUsername();
		File file = new File(sourcePath);
		String filename=username+"_"+file.getName()+TimeUtil.getCurrentDateCatalog()+".zip";
		zipFilePath=zipFilePath+"/"+filename;
		//zipFilePath=zipFilePath+"/log20131025.txt";
		File zipFile = new File(zipFilePath);
		ZipOutputStream zos = null;
		try {
			// 创建写出流操作
			pd.setMessage("日志上传中，请稍后...");
	        pd.setCancelable(false);
	        pd.show();
			OutputStream os = new FileOutputStream(zipFile);
			BufferedOutputStream bos = new BufferedOutputStream(os);
			zos = new ZipOutputStream(bos);
			String basePath = null;
			// 获取目录
			if (file.isDirectory()) {
				basePath = file.getPath();
			} else {
				basePath = file.getParent();
			}
			zipFile(file, basePath, zos,zipFilePath);
		} finally {
			if (zos != null) {
					zos.closeEntry();
					zos.close();
			}
		}

		// return zipFile;
	}

	/**
	 * @param source
	 *            源文件
	 * @param basePath
	 * @param zos
	 * @throws Exception 
	 */
	private void zipFile(File source, String basePath, ZipOutputStream zos,final String zipFilePath)
			throws Exception {
		File[] files = null;
		if (source.isDirectory()) {
			files = source.listFiles();
		} else {
			files = new File[1];
			files[0] = source;
		}

		InputStream is = null;
		String pathName;
		byte[] buf = new byte[1024];
		int length = 0;
		try {
			for (File file : files) {
				if (file.isDirectory()) {
					pathName = file.getPath().substring(basePath.length() + 1)
							+ "/";
					zos.putNextEntry(new ZipEntry(pathName));
					zipFile(file, basePath, zos,zipFilePath);
				} else {
					pathName = file.getPath().substring(basePath.length() + 1);
					//if(pathName.endsWith(".txt")){
						is = new FileInputStream(file);
						BufferedInputStream bis = new BufferedInputStream(is);
						zos.putNextEntry(new ZipEntry(pathName));
						while ((length = bis.read(buf)) > 0) {
							zos.write(buf, 0, length);
						}
						//file.delete();
					//}
				}
			}
			Handler handler = new Handler();
			handler.postDelayed(new Runnable()
			{
				public void run()
				{
					try {
						String url=WebViewWnd.instance.getHostUrl();
			            url = url+"/khd/uploadlog.do?method=upload";
			            String str = context.getString(R.string.SETTING_INFOS);
						SharedPreferences settings = context.getSharedPreferences(str, 0);
					    url =   url+ "&sys_token_khd=" + settings.getString("sys_token_khd", "");
			            //zipFilePath="/mnt/sdcard/oadownload/SDFormatter-v3.1.zip";
			            File zipfile=new File(zipFilePath);
			            File upfile=new File(zipFilePath+".log");
			            zipfile.renameTo(upfile);
			            uploadSubmit(url,null,zipFilePath+".log");
					} catch (Exception e) {
						e.printStackTrace();
					}finally{
						pd.cancel();
					    pd.dismiss();
					}
				}
			}, 500);
			
		} finally {
			if (is != null) {
				is.close();
			}
		}

	}
	
	public  String uploadSubmit(String url, Map<String, String> param,
            String filepath) throws Exception {
		//JSONObject jsonObject = new JSONObject();
		try{
			File file=new File(filepath);
	         HttpPost post = new HttpPost(url);
	         HttpClient httpClient = new DefaultHttpClient();
	         MultipartEntity entity = new MultipartEntity();
	         if (param != null && !param.isEmpty()) {
	             for (Map.Entry<String, String> entry : param.entrySet()) {
	                 entity.addPart(entry.getKey(), new StringBody(entry.getValue()));
	             }
	         }
	         String filename = "";
	         //
	         // 添加文件参数
	         if (file != null && file.exists()) {
	             entity.addPart("file", new FileBody(file));
	             filename = file.getName();
	             //filename= filename.substring(0,filename.indexOf("."));
	         }
	         if(file.length()==0){
	        	 Toast.makeText(context, "无日志文件！", Toast.LENGTH_SHORT).show();
	        	 return "1";
	         }
	         post.setEntity(entity);
	         HttpResponse response = httpClient.execute(post);
	         int stateCode = response.getStatusLine().getStatusCode();
	         StringBuffer sb = new StringBuffer();
	         if (stateCode == HttpStatus.SC_OK) {
	             HttpEntity result = response.getEntity();
	             if (result != null) {
	                 InputStream is = result.getContent();
	                 BufferedReader br = new BufferedReader(
	                         new InputStreamReader(is));
	                 String tempLine;
	                 while ((tempLine = br.readLine()) != null) {
	                     sb.append(tempLine);
	                 }
	             }
			     Toast.makeText(context, "上传成功！", Toast.LENGTH_SHORT).show();
	         }else{
	        	 Toast.makeText(context, "上传失败！", Toast.LENGTH_SHORT).show();
	         }
	         post.abort();
	         //JSONArray jsonArray = new JSONArray();  
	         //jsonObject.put("filename", filename);
	         //jsonArray.put(jsonObject); 
	         //此处将上传后的文件名称传回
	         //loadurl(webView,"javascript:sys_obj.loadpic('"+filename+"','"+this.getHostUrl()+"')");
	         return sb.toString();
		}catch(Exception e){
			e.printStackTrace();
			JSONArray jsonArray = new JSONArray();  
	         //jsonObject.put("filename", "error");
	         //jsonArray.put(jsonObject);  
	        // loadurl(webView,"javascript:loadpic('error','"+this.getHostUrl()+"')");
	         return "";
		}
  }

}
