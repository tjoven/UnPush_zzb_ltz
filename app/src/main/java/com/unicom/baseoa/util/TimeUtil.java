/**
 * 
 */
package com.unicom.baseoa.util;

import android.annotation.SuppressLint;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;


@SuppressLint("SimpleDateFormat")
public class TimeUtil {
	
	public static Date getCurrentDate(){
		return new Date();
	}
	
	/**
	 * 返回日期格式:
	 * MM-dd HH:mm
	 */
	public static String getCurrentTimeShort(){
		Date now = getCurrentDate();
		DateFormat df = new SimpleDateFormat("MM-dd HH:mm");
		return df.format(now);
	}
	
	/**
	 * 返回日期格式:
	 * yyyyMMddHHmmss
	 */
	public static String getCurrentDateMis(){
		Date now = getCurrentDate();
		DateFormat df = new SimpleDateFormat("yyyyMMddHHmmss");
		String ret = df.format(now).toString();
		String random = String.valueOf(Math.random());
		return ret+random.substring(2,8);
	}
	
	/**
	 * 返回日期格式:
	 * yyyyMMddHHmmssSSS
	 */
	public static String getCurrentDateMis2(){
		Date now = getCurrentDate();
		DateFormat df = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		String ret = df.format(now).toString();
		String random = String.valueOf(Math.random());
		return ret+random.substring(2,4);
	}
	/**
	 * 返回日期格式:
	 * yyyyMMddHHmm
	 */
	public static String getCurrentDateMis4(){
		Date now = getCurrentDate();
		DateFormat df = new SimpleDateFormat("yyyyMMddHHmmss");
		String ret = df.format(now).toString();
		//String random = String.valueOf(Math.random());
		return ret;
	}
	
	/**
	 * 返回日期格式:
	 * yyyyMMdd
	 */
	public static String getCurrentDateCatalog(){
		Date now = getCurrentDate();
		DateFormat df = new SimpleDateFormat("yyyyMMdd");
		return df.format(now);
	}
	
	/**
	 * 返回日期格式:
	 * yyyy-MM-dd
	 */
	public static String getCurrentDateNormal(){
		Date now = getCurrentDate();
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
		return df.format(now);
	}
	/**
	 * 返回时间格式
	 * HH
	 * @return
	 */
	public static String getCurrentHH(){
		Date now = getCurrentDate();
		DateFormat df = new SimpleDateFormat("HH");
		return df.format(now);
	}
	
	/**
	 * 返回日期格式:
	 * yyyy-MM-dd HH:mm:ss SSS
	 */
	public static String getCurrentTimeNormal2(){
		Date now = getCurrentDate();
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss SSS");
		return df.format(now);
	}
	
	/**
	 * 返回日期格式:
	 * yyyy-MM-dd HH:mm:ss
	 */
	public static String getCurrentTimeNormal(){
		Date now = getCurrentDate();
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		return df.format(now);
	}
	
	/**
	 * 返回日期格式: 精确度到分钟
	 * yyyy-MM-dd HH:mm
	 */
	public static String getCurrentTimeNormal3(){
		Date now = getCurrentDate();
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm");
		return df.format(now);
	}
	
	/**
	 * 返回日期格式:
	 * yyyy-MM-dd HH:00:00
	 */
	public static String getCurrentTimeWhole(){
		Date now = getCurrentDate();
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:00:00");
		return df.format(now);
	}
	
	public static String getRightTime(String source){
		if(source.indexOf(".")>0)
			return source.substring(0, source.indexOf("."));
		return source;
	}
	
	/**
	 * 返回日期格式:
	 * yyMMddHHmmssSSS
	 */
	public static String getCurrentDateMis3(){
		Date now = getCurrentDate();
		DateFormat df = new SimpleDateFormat("yyMMddHHmmssSSS");
		String ret = df.format(now).toString();
		return ret;
	}
	
	/**
     * 取给定时间的毫秒数
     * @param s yyyy-MM-dd HH:mm:ss
     * @return
     */
    public static long getLongTime(String s){
    	DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");        
    	Date date = null;   
    	try {   
    	    date = format.parse(s);
    	    return date.getTime();
    	} catch (Exception e) {   
    	    e.printStackTrace();
    	}             
    	return 0;
    }
    
    /**
	 * 返回昨天日期
	 * 需要和服务器端同步
	 * yyyy-MM-dd
	 */
	public static String getYesterdayTime(){
		Calendar cal = Calendar.getInstance();
		cal.add(Calendar.DATE,0);
		java.util.Date da = cal.getTime();
		String yesterday = new SimpleDateFormat("yyyy-MM-dd").format(da);
		//年－月－日
		return yesterday;
	}
	
	/**
	 * 返回之前日期
	 * 需要和服务器端同步
	 * yyyy-MM-dd
	 */
	public static String getForgetTime(String days,String endDays){
		int i=Integer.parseInt("-"+days);
		int j=Integer.parseInt("-"+days)+Integer.parseInt(endDays);
		Calendar cal = Calendar.getInstance();
		cal.add(Calendar.DATE,i);
		java.util.Date da = cal.getTime();
		String yesterday = new SimpleDateFormat("yyyy-MM-dd").format(da);
		
		Calendar cal1 = Calendar.getInstance();
		cal1.add(Calendar.DATE,j);
		java.util.Date da1 = cal1.getTime();
		String yesterday1 = new SimpleDateFormat("yyyy-MM-dd").format(da1);
		
		//年－月－日
		return yesterday+","+yesterday1;
	}
	
	/**
	* 字符串转换成日期
	* @param str
	* @return date
	*/
	public static Date StrToDate(String str) {
	   SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	   Date date = null;
	   try {
	    date = format.parse(str);
	   } catch (Exception e) {
		   e.printStackTrace();
	   }
	   
	   return date;
	}
    
	/**
	 * 取得当前日期是周几
	 * @return
	 */
	 public static String getWeek() {
		  // 再转换为时间
		  Date date = getCurrentDate();
		  Calendar c = Calendar.getInstance();
		  c.setTime(date);
		  int hour=c.get(Calendar.DAY_OF_WEEK);
		  // hour中存的就是星期几了，其范围 1~7
		  // 1=星期日 7=星期六，其他类推
		  if(hour==1){
			  hour=7; 
		  }else if(hour==2){
			  hour=1; 
		  }else if(hour==3){
			  hour=2; 
		  }else if(hour==4){
			  hour=3; 
		  }else if(hour==5){
			  hour=4; 
		  }else if(hour==6){
			  hour=5; 
		  }else if(hour==7){
			  hour=6; 
		  }
		  return hour+"";
	}
	 /**
	  * 日期判断
	  * @param startTime  开始时间
	  * @param endTime    结束时间
	  * @return boolean   开始时间小于等于结束时间返回true，否则返回false
	  */
	public static boolean judgmentDate(String startTime,String endTime){
		 DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
	        try {
	            Date dt1 = df.parse(startTime);
	            Date dt2 = df.parse(endTime);
	            if (dt1.getTime() <= dt2.getTime()) {
	               return true;
	            } else {
	               return false;
	            }

	        } catch (Exception exception) {
	            exception.printStackTrace();
	            return false;
	        }
		//return true;
	} 
	/**
	 * @Title: lastWeek
	 * @return
	 * @Description: 获得一周前的日期
	 */
	public static String lastWeek() {
		Date date = new Date();
		int year = Integer.parseInt(new SimpleDateFormat("yyyy").format(date));
		int month = Integer.parseInt(new SimpleDateFormat("MM").format(date));
		int day = Integer.parseInt(new SimpleDateFormat("dd").format(date)) - 8;

		if (day < 1) {
			month -= 1;
			if (month == 0) {
				year -= 1;
				month = 12;
			}
			if (month == 4 || month == 6 || month == 9 || month == 11) {
				day = 30 + day;
			} else if (month == 1 || month == 3 || month == 5 || month == 7
					|| month == 8 || month == 10 || month == 12) {
				day = 31 + day;
			} else if (month == 2) {
				if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0))
					day = 29 + day;
				else
					day = 28 + day;
			}
		}
		String y = year + "";
		String m = "";
		String d = "";
		if (month < 10)
			m = "0" + month;
		else
			m = month + "";
		if (day < 10)
			d = "0" + day;
		else
			d = day + "";
		return y+m+d;
	}

	
}
