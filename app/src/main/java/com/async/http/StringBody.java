package com.async.http;

import com.async.DataEmitter;
import com.async.DataSink;
import com.async.Util;
import com.async.callback.CompletedCallback;
import com.async.future.FutureCallback;
import com.async.parser.StringParser;

public class StringBody implements AsyncHttpRequestBody<String> {
    public StringBody() {
    }

    byte[] mBodyBytes;
    String string;
    public StringBody(String string) {
        this();
        this.string = string;
    }

    @Override
    public void parse(DataEmitter emitter, final CompletedCallback completed) {
        new StringParser().parse(emitter).setCallback(new FutureCallback<String>() {
            @Override
            public void onCompleted(Exception e, String result) {
                string = result;
                completed.onCompleted(e);
            }
        });
    }

    public static final String CONTENT_TYPE = "text/plain";

    @Override
    public void write(AsyncHttpRequest request, DataSink sink, final CompletedCallback completed) {
        if (mBodyBytes == null)
            mBodyBytes = string.getBytes();
        Util.writeAll(sink, mBodyBytes, completed);
    }

    @Override
    public String getContentType() {
        return "text/plain";
    }

    @Override
    public boolean readFullyOnRequest() {
        return true;
    }

    @Override
    public int length() {
        if (mBodyBytes == null)
            mBodyBytes = string.getBytes();
        return mBodyBytes.length;
    }

    @Override
    public String toString() {
        return string;
    }

    @Override
    public String get() {
        return toString();
    }
}
