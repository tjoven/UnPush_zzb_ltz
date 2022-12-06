package com.async.http.callback;


import com.async.http.AsyncHttpResponse;

public interface HttpConnectCallback {
    public void onConnectCompleted(Exception ex, AsyncHttpResponse response);
}
