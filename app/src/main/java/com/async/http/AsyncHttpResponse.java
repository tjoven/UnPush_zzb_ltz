package com.async.http;

import com.async.AsyncSocket;
import com.async.DataEmitter;
import com.async.DataSink;
import com.async.callback.CompletedCallback;
import com.async.http.libcore.ResponseHeaders;

public interface AsyncHttpResponse extends AsyncSocket {
    public void setEndCallback(CompletedCallback handler);
    public CompletedCallback getEndCallback();
    public ResponseHeaders getHeaders();
    public void end();
    public AsyncSocket detachSocket();
    public AsyncHttpRequest getRequest();
}
