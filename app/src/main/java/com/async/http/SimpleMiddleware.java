package com.async.http;

import com.async.future.Cancellable;

public class SimpleMiddleware implements AsyncHttpClientMiddleware {

    @Override
    public Cancellable getSocket(GetSocketData data) {
        return null;
    }

    @Override
    public void onSocket(OnSocketData data) {
        
    }

    @Override
    public void onHeadersReceived(OnHeadersReceivedData data) {
        
    }

    @Override
    public void onBodyDecoder(OnBodyData data) {
        
    }

    @Override
    public void onRequestComplete(OnRequestCompleteData data) {
        
    }

}
