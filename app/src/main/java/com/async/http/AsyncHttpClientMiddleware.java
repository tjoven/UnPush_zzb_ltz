package com.async.http;

import android.os.Bundle;

import com.async.AsyncSocket;
import com.async.DataEmitter;
import com.async.callback.ConnectCallback;
import com.async.future.Cancellable;
import com.async.http.libcore.ResponseHeaders;

public interface AsyncHttpClientMiddleware {
    public static class GetSocketData {
        public Bundle state = new Bundle();
        public AsyncHttpRequest request;
        public ConnectCallback connectCallback;
        public Cancellable socketCancellable;
    }
    
    public static class OnSocketData extends GetSocketData {
        public AsyncSocket socket;
    }
    
    public static class OnHeadersReceivedData extends OnSocketData {
        public ResponseHeaders headers;
    }
    
    public static class OnBodyData extends OnHeadersReceivedData {
        public DataEmitter bodyEmitter;
    }
    
    public static class OnRequestCompleteData extends OnBodyData {
        public Exception exception;
    }
    
    public Cancellable getSocket(GetSocketData data);
    public void onSocket(OnSocketData data);
    public void onHeadersReceived(OnHeadersReceivedData data);
    public void onBodyDecoder(OnBodyData data);
    public void onRequestComplete(OnRequestCompleteData data);
}
