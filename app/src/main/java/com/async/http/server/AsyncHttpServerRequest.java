package com.async.http.server;

import com.async.AsyncSocket;
import com.async.DataEmitter;
import com.async.http.AsyncHttpRequestBody;
import com.async.http.Multimap;
import com.async.http.libcore.RequestHeaders;

import java.util.regex.Matcher;

public interface AsyncHttpServerRequest extends DataEmitter {
    public RequestHeaders getHeaders();
    public Matcher getMatcher();
    public AsyncHttpRequestBody getBody();
    public AsyncSocket getSocket();
    public String getPath();
    public Multimap getQuery();
    public String getMethod();
}
