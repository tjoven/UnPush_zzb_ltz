package unigo.utility;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

import android.util.Log;

public class FileUtil {
	/**
     * 解压缩功能.
     * 将zipFile文件解压到folderPath目录下.
     * @throws Exception
 */
     public int upZipFile(String zipFile, String folderPath)throws ZipException,IOException {
     //public static void upZipFile() throws Exception{
         ZipFile zfile=new ZipFile(zipFile);
         Enumeration zList=zfile.entries();
         ZipEntry ze=null;
         byte[] buf=new byte[1024];
         while(zList.hasMoreElements()){
             ze=(ZipEntry)zList.nextElement();    
             if(ze.isDirectory()){
                 Log.d("upZipFile", "ze.getName() = "+ze.getName());
                 String dirstr = folderPath + ze.getName();
                 //dirstr.trim();
                 dirstr = new String(dirstr.getBytes("8859_1"), "GB2312");
                 Log.d("upZipFile", "str = "+dirstr);
                 File f=new File(dirstr);
                 f.mkdir();
                 continue;
             }
             Log.d("upZipFile", "ze.getName() = "+ze.getName());
             OutputStream os=new BufferedOutputStream(new FileOutputStream(getRealFileName(folderPath, ze.getName())));
             InputStream is=new BufferedInputStream(zfile.getInputStream(ze));
             int readLen=0;
             while ((readLen=is.read(buf, 0, 1024))!=-1) {
                 os.write(buf, 0, readLen);
             }
             is.close();
             os.close();    
         }
         zfile.close();
         Log.d("upZipFile", "finishssssssssssssssssssss");
         return 0;
     }
 
     /**
     * 给定根目录，返回一个相对路径所对应的实际文件名.
     * @param baseDir 指定根目录
     * @param absFileName 相对路径名，来自于ZipEntry中的name
     * @return java.io.File 实际的文件
 */
     public static File getRealFileName(String baseDir, String absFileName){
         String[] dirs=absFileName.split("/");
         File ret=new File(baseDir);
         String substr = null;
         if(dirs.length>1){
             for (int i = 0; i < dirs.length-1;i++) {
                 substr = dirs[i];
                 try {
                     //substr.trim();
                     substr = new String(substr.getBytes("8859_1"), "GB2312");
                     
                 } catch (UnsupportedEncodingException e) {
                     // TODO Auto-generated catch block
                     e.printStackTrace();
                 }
                 ret=new File(ret, substr);
                 
             }
             Log.d("upZipFile", "1ret = "+ret);
             if(!ret.exists())
                 ret.mkdirs();
             substr = dirs[dirs.length-1];
             try {
                 //substr.trim();
                 substr = new String(substr.getBytes("8859_1"), "GB2312");
                 Log.d("upZipFile", "substr = "+substr);
             } catch (UnsupportedEncodingException e) {
                 // TODO Auto-generated catch block
                 e.printStackTrace();
             }
             
             ret=new File(ret, substr);
             Log.d("upZipFile", "2ret = "+ret);
             return ret;
         }
         return ret;
     }
     public static void unZip(InputStream in, String mDestPath) {   
         if (!mDestPath.endsWith("/")) {   
             mDestPath = mDestPath + "/";   
         }
         FileOutputStream fileOut = null;   
         ZipInputStream zipIn = null;   
         ZipEntry zipEntry = null;   
         File file = null;   
         int readedBytes = 0;   
         byte buf[] = new byte[4096];   
         try {   
             //zipIn = new ZipInputStream(new BufferedInputStream(new FileInputStream(unZipfileName)));   
        	 zipIn = new ZipInputStream(new BufferedInputStream(in));
             while ((zipEntry = zipIn.getNextEntry()) != null) {   
                 file = new File(mDestPath + zipEntry.getName());   
                 System.out.println(mDestPath + zipEntry.getName());
                 unigo.utility.Log.write(1, "WebViewWnd", "解压文件，文件名==="+mDestPath + zipEntry.getName(),"");
                 Log.e("FileUtil", "解压文件，文件名=="+mDestPath + zipEntry.getName());
                 if (zipEntry.isDirectory()) {   
                     file.mkdirs();   
                 } else {   
                     // 如果指定文件的目录不存在,则创建之.   
                     File parent = file.getParentFile();   
                     if (!parent.exists()) {   
                         parent.mkdirs();   
                     }   
                     fileOut = new FileOutputStream(file);   
                     while ((readedBytes = zipIn.read(buf)) > 0) {   
                         fileOut.write(buf, 0, readedBytes);   
                     }   
                     fileOut.close();   
                 }   
                 zipIn.closeEntry();   
             }   
         } catch (IOException ioe) {   
             ioe.printStackTrace();   
         }   
     }  

}
