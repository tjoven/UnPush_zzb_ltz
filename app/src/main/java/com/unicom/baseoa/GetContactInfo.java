package com.unicom.baseoa;

import android.app.Activity;
import android.content.Intent;
import android.provider.ContactsContract;

public class GetContactInfo
{
	private Activity act;
	private final int REQUEST_CONTACT = 2;

	public GetContactInfo(Activity activity)
	{
		this.act = activity;
	}

	public void startContact()
	{
		Intent intent = new Intent();
		intent.setAction(Intent.ACTION_PICK);
		intent.setData(ContactsContract.Contacts.CONTENT_URI);
		act.startActivityForResult(intent, REQUEST_CONTACT);

	}
	
}
