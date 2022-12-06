package com.unicom.baseoa.selectfile;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import com.unicom.sywq.R;
import com.wotool.http.HttpMultipartPostData;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Handler;
import android.util.Log;
import android.widget.Toast;

/**
 * android选择任意格式文件上传的工具类
 * version=2
 * createtime=2017.8.4 10:05
 * updatetime=2017.7.25 15:26
 * lwdj 测试完成版
 * @author liuzz
 *
 */
public class UploadFileUtil {
	
	boolean onlyWord = false;
	
	private Activity context;
	private Map<String,String> paraMap = new HashMap<String,String>();
	private File file;
	
	public UploadFileUtil(Activity activity){
		this.context = activity;
	}
	
	/**
	 * 选取文件上传
	 * @param zid zzid
	 * @param mk_mc 模块名称
	 * @param wjlj 文件路径
	 * @param attachment 附件标志
	 * @param callback h5页面上的回调函数
	 * @param start_activity_code 启动文件管理器的请求码
	 */
	public void selectFile(String zid, String mk_mc, String wjlj,
			String attachment, String callback,int start_activity_code,String sizeLimit) {
		paraMap.put("zid", (zid == null || "null".equals(zid)) ? "" : zid);
		paraMap.put("mk_mc", (mk_mc == null || "null".equals(mk_mc)) ? "" : mk_mc);
		paraMap.put("attachment", (attachment == null || "null".equals(attachment)) ? "" : attachment);
		paraMap.put("wjlj", (wjlj == null || "null".equals(wjlj)) ? "" : wjlj);
		paraMap.put("size_limit", (sizeLimit == null || "null".equals(sizeLimit)) ? "50" : sizeLimit);
		paraMap.put("callback", (callback == null || "null".equals(callback)) ? "" : callback);
		print("调用选取功能：mk_mc="+mk_mc+",zid="+zid+",wjlj="+wjlj+",attachment="+attachment+",callback="+callback+",sizeLimit="+sizeLimit);

		// 使用文件管理器选取文件
		Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
//		intent.setType("*/*");
//		intent.setType("image/*,video/*,audio/*,file/*");
		intent.setType("file/*");
		intent.addCategory(Intent.CATEGORY_OPENABLE);  
		// 开启一个带有返回值的Activity，请求码为SELECT_FILE
		try{
			context.startActivityForResult(intent, start_activity_code);
		}catch(Exception e){
			 try {  
				 context.startActivityForResult(Intent.createChooser(intent, "选择文件"), start_activity_code);  
			 } catch (Exception ex) {  //android.content.ActivityNotFoundException
			     Toast.makeText(context, "找不到文件管理器，无法选取！", Toast.LENGTH_SHORT).show();  
			 } 
		}
	}
	
	public void selectWord(String zid, String mk_mc, String wjlj,
			String attachment, String callback,int start_activity_code,String sizeLimit){
		onlyWord = true;
		this.selectFile(zid, mk_mc, wjlj, attachment, callback, start_activity_code, sizeLimit);
	}
	
	public void doSelectFile(Intent data){
		try{
			Uri uri = data.getData();
			String filePath = this.getPath(context, uri);
			
			if(onlyWord){
				if( !(filePath.endsWith(".doc")||filePath.endsWith(".docx")) ){
					context.runOnUiThread(new Runnable() {
						@Override
						public void run() {
							// TODO Auto-generated method stub
							Toast.makeText(context, "文件仅限word文档", Toast.LENGTH_LONG).show();
						}
					});
					return ;
				}
			}
			
			file = new File(filePath);
			paraMap.put("filename", file.getName());
			long size = file.length();
			String size_limit = paraMap.get("size_limit")==null?"50":paraMap.get("size_limit");
			 
			float limit = 0;
			try{
				limit = Float.valueOf(size_limit);
				limit = limit*1024*1024;//转换成单位B
			}catch(Exception e){}
			
			print("得到选取结果:uri="+uri.getPath()+",scheme="+uri.getScheme()+",处理结果得到文件路径："+filePath+",上传文件：file="+file.getAbsolutePath()+",大小"+file.length()+",文件名:"+file.getName()+",sizeLimit="+limit);
			
			if(size<limit){
				showAlert();
			}else{
				Toast.makeText(context, "文件不能超过"+size_limit+"MB", Toast.LENGTH_LONG).show();
			}
		}catch(Exception e){
			print("选取异常:"+e.getMessage());
		}
	}
	
	private void showAlert(){
		AlertDialog.Builder builder = new AlertDialog.Builder(context);
		builder.setMessage("是否上传该文件？")
				.setCancelable(true)
				.setPositiveButton("是",
						new DialogInterface.OnClickListener() {
							public void onClick(DialogInterface dialog,
									int id) {
								uploadFile();
								dialog.cancel();
							}
						})
				.setNegativeButton("否",
						new DialogInterface.OnClickListener() {
							public void onClick(DialogInterface dialog,
									int id) {
								dialog.cancel();
							}
						});
		AlertDialog alert = builder.create();
		alert.show();
	}
	 
	// 上傳文件
	private void uploadFile() {
		if(file==null||!file.exists()||!file.isFile()||!(file.length()>0)){
			Toast.makeText(context, "空文件", Toast.LENGTH_LONG).show();
			return ;
		}
		String url = this.getUploadPath();
		Log.e("UploadFile", "文件正在上传--->url="+url+" paraMap"+paraMap);
		print("正在上传.....url="+url+",paraMap="+paraMap);
		final HttpMultipartPostData post = new HttpMultipartPostData(context, file, url, paraMap);
		post.execute();
			 
		Handler handler = new Handler();
		handler.postDelayed(new Runnable() {
			@Override
			public void run() {
				if (post.getStatus() == AsyncTask.Status.RUNNING
						|| post.getStatus() == AsyncTask.Status.PENDING) {
					post.hideProgressDialog();
					post.cancel(true);
					Toast.makeText(context, "请求超时，请检查网络.", Toast.LENGTH_SHORT).show();
				}
			}
		}, 120000);
	}
	
	private String getUploadPath(){
		SharedPreferences settings = context.getSharedPreferences(
				context.getString(R.string.SETTING_INFOS), 0);
		String url = settings.getString("httpMain", "");
		if (url==null || url.equals("")) {
			url = context.getString(R.string.url_new2);
		}
		if (!url.startsWith("http://")) {
			url = "http://" + url;
		}
		url += "/khd/uploadFile.do?method=uploadFile";
		url += "&sys_token_khd=" + settings.getString("sys_token_khd", "");
		return url;
	}
	
	
	 private String getPath(Context context, Uri uri) {
		 if ("content".equalsIgnoreCase(uri.getScheme())) {
	        String[] projection = { "_data" };
	        Cursor cursor = null;
	 
	        try {
	           cursor = context.getContentResolver().query(uri, projection,null, null, null);
	           int column_index = cursor.getColumnIndexOrThrow("_data");
	           if (cursor.moveToFirst()) {
	               return cursor.getString(column_index);
	            }
	         } catch (Exception e) {
	                // Eat it
	         }
	        
	       }  else if ("file".equalsIgnoreCase(uri.getScheme())) {
	            return uri.getPath();
	      }else {
	        	
	        	// 解决小米手机选取照片时报路径错误的问题
//	        	String[] proj = { MediaStore.Images.Media.DATA };
//	        	Cursor actualimagecursor = this.context.managedQuery(uri, proj, null, null,null);
//	        	if (actualimagecursor != null) {
//	        		int actual_image_column_index = actualimagecursor
//	        				.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
//	        		actualimagecursor.moveToFirst();
//	        		String picFilePath = actualimagecursor
//	        				.getString(actual_image_column_index);
//	        		return picFilePath;
//	        	} else {
//	        		if (uri != null) {
//	        			String tmpPath = uri.getPath();
//	        			if (tmpPath != null
//	        					&& (tmpPath.endsWith(".jpg")
//	        							|| tmpPath.endsWith(".png") || tmpPath
//	        								.endsWith(".gif"))) {
//	        				return tmpPath;
//	        			}
//	        		}
//	        	}
	        }
	 
	        return "";
	    }
	 
//	 /**
//		 * 根据Uri获取文件的绝对路径，解决Android4.4以上版本Uri转换
//		 * 
//		 * @param activity
//		 * @param fileUri
//		 */
//		@TargetApi(19)
//		public static String getFileAbsolutePath(Activity context, Uri fileUri) {
//			if (context == null || fileUri == null)
//				return null;
//			if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT && DocumentsContract.isDocumentUri(context, fileUri)) {
//				if (isExternalStorageDocument(fileUri)) {
//					String docId = DocumentsContract.getDocumentId(fileUri);
//					String[] split = docId.split(":");
//					String type = split[0];
//					if ("primary".equalsIgnoreCase(type)) {
//						return Environment.getExternalStorageDirectory() + "/" + split[1];
//					}
//				} else if (isDownloadsDocument(fileUri)) {
//					String id = DocumentsContract.getDocumentId(fileUri);
//					Uri contentUri = ContentUris.withAppendedId(Uri.parse("content://downloads/public_downloads"), Long.valueOf(id));
//					return getDataColumn(context, contentUri, null, null);
//				} else if (isMediaDocument(fileUri)) {
//					String docId = DocumentsContract.getDocumentId(fileUri);
//					String[] split = docId.split(":");
//					String type = split[0];
//					Uri contentUri = null;
//					if ("image".equals(type)) {
//						contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
//					} else if ("video".equals(type)) {
//						contentUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
//					} else if ("audio".equals(type)) {
//						contentUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
//					}
//					String selection = MediaStore.Images.Media._ID + "=?";
//					String[] selectionArgs = new String[] { split[1] };
//					return getDataColumn(context, contentUri, selection, selectionArgs);
//				}
//			} // MediaStore (and general)
//			else if ("content".equalsIgnoreCase(fileUri.getScheme())) {
//				// Return the remote address
//				if (isGooglePhotosUri(fileUri))
//					return fileUri.getLastPathSegment();
//				return getDataColumn(context, fileUri, null, null);
//			}
//			// File
//			else if ("file".equalsIgnoreCase(fileUri.getScheme())) {
//				return fileUri.getPath();
//			}
//			return null;
//		}
//
//		public static String getDataColumn(Context context, Uri uri, String selection, String[] selectionArgs) {
//			Cursor cursor = null;
//			String[] projection = { MediaStore.Images.Media.DATA };
//			try {
//				cursor = context.getContentResolver().query(uri, projection, selection, selectionArgs, null);
//				if (cursor != null && cursor.moveToFirst()) {
//					int index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
//					return cursor.getString(index);
//				}
//			} finally {
//				if (cursor != null)
//					cursor.close();
//			}
//			return null;
//		}
//
//		/**
//		 * @param uri
//		 *            The Uri to check.
//		 * @return Whether the Uri authority is ExternalStorageProvider.
//		 */
//		public static boolean isExternalStorageDocument(Uri uri) {
//			return "com.android.externalstorage.documents".equals(uri.getAuthority());
//		}
//
//		/**
//		 * @param uri
//		 *            The Uri to check.
//		 * @return Whether the Uri authority is DownloadsProvider.
//		 */
//		public static boolean isDownloadsDocument(Uri uri) {
//			return "com.android.providers.downloads.documents".equals(uri.getAuthority());
//		}
//
//		/**
//		 * @param uri
//		 *            The Uri to check.
//		 * @return Whether the Uri authority is MediaProvider.
//		 */
//		public static boolean isMediaDocument(Uri uri) {
//			return "com.android.providers.media.documents".equals(uri.getAuthority());
//		}
//
//		/**
//		 * @param uri
//		 *            The Uri to check.
//		 * @return Whether the Uri authority is Google Photos.
//		 */
//		public static boolean isGooglePhotosUri(Uri uri) {
//			return "com.google.android.apps.photos.content".equals(uri.getAuthority());
//		}
	
	private void print(String text){
//		Toast.makeText(context, text, Toast.LENGTH_LONG).show();
	}
}
