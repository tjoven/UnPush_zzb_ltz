package com.unicom.config;

import java.io.File;

import unigo.utility.HttpRun;

import android.app.Activity;
import android.os.Environment;
import android.view.View;
import android.view.View.OnClickListener;

public class OnClearCache{
	
	public void ClearCache() {
		String sdState = Environment.getExternalStorageState();
		String path = Environment.getExternalStorageDirectory().toString();
		// 获得sd卡根目录
		File file;
		boolean flag=false;
		try{
			file = new File(path + "/Undownload");
			if (sdState.equals(Environment.MEDIA_MOUNTED)) {
				if (file.exists()) {
					if (file.isFile()) {
						file.delete();
					}else if (file.isDirectory()) {// 如果它是一个目录
						// 声明目录下所有的文件 files[];
						File files[] = file.listFiles();
						for (int i = 0; i < files.length; i++) { // 遍历目录下所有的文件
							files[i].delete();// 把每个文件 用这个方法进行迭代
						}
					}
					file.delete();
					flag=true;
				}
			}
		}catch(Exception e){
			flag=false;
		}
	}
	//得到附件文件夹中所有文件的大小
	public String getFileSize(){
		String sdState = Environment.getExternalStorageState();
		String path = Environment.getExternalStorageDirectory().toString();
		// 获得sd卡根目录
		File file;
		file = new File(path + "/Undownload");
		if(!file.exists()){     
			file.mkdirs(); 
		}
		double filesize=0;
		String sizeStr="0",sizedw="B";
		if (sdState.equals(Environment.MEDIA_MOUNTED)) {
			File files[] = file.listFiles();
			for (int i = 0; i < files.length; i++) { // 遍历目录下所有的文件
				filesize += files[i].length();// 把每个文件 用这个方法进行迭代
			}
			if(filesize/1024>1){
				if(filesize/1024>1024){
					filesize=filesize/1024/1024;
					sizedw="M";
				}else{
					filesize=filesize/1024;
					sizedw="K";
				}
			}
			if(String.valueOf(filesize).indexOf(".")>-1){
				sizeStr=String.format("%.2f", filesize);
			}else{
				sizeStr=filesize+"";
			}
		}
		return sizeStr+sizedw;
	}
}
