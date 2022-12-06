package com.async.http.callback;

import com.async.callback.ResultCallback;
import com.async.http.AsyncHttpResponse;

public interface RequestCallback<T> extends ResultCallback<AsyncHttpResponse, T> {
    public void onConnect(AsyncHttpResponse response);
    public void onProgress(AsyncHttpResponse response, int downloaded, int total);
}
