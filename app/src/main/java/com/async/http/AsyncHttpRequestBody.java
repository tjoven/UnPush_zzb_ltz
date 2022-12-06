package com.async.http;

import com.async.DataEmitter;
import com.async.DataSink;
import com.async.callback.CompletedCallback;

public interface AsyncHttpRequestBody<T> {
    public void write(AsyncHttpRequest request, DataSink sink, CompletedCallback completed);
    public void parse(DataEmitter emitter, CompletedCallback completed);
    public String getContentType();
    public boolean readFullyOnRequest();
    public int length();
    public T get();
}
