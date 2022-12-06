package com.async.http;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.apache.http.NameValuePair;

import com.async.DataSink;
import com.async.callback.CompletedCallback;

public abstract class StreamPart extends Part {
    public StreamPart(String name, int length, List<NameValuePair> contentDisposition) {
        super(name, length, contentDisposition);
    }
    
    @Override
    public void write(DataSink sink, CompletedCallback callback) {
        try {
            InputStream is = getInputStream();
            com.async.Util.pump(is, sink, callback);
        }
        catch (Exception e) {
            callback.onCompleted(e);
        }
    }
    
    protected abstract InputStream getInputStream() throws IOException;
}
