package com.unicom.apn;


public class ApnData {
	private static String apnName;
	private String name;
	private String apn;
	private int current = 0;
	private long _id;
	private String iname;

	public ApnData() {

	}
	public static String getApnName() {
		return apnName;
	}

	public void setApnName(String bookName) {
		apnName = bookName;
	}
	public String getName() {
		return name;
	}

	public void setName(String bookName) {
		name = bookName;
	}

	public long getId() {
		return _id;
	}

	public void setId(long id) {
		this._id = id;
	}

	public String getApn() {
		return apn;
	}

	public void setApn(String id) {
		this.apn = id;
	}

	public int describeContents() {
		return 0;
	}

	public String toString() {
		int m = name.length();
		if (m > 15) {
			iname = name.substring(0, 15) + "...";
			name = iname;
		}
		return name + "\n" + apn;
	}

	public void setCurrent(int current) {
		// TODO Auto-generated method stub
		this.current = current;
	}

	public int getCurrent() {
		return current;
	}
}
