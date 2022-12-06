package com.async.callback;

import com.async.AsyncSocket;

public interface ConnectCallback {
    public void onConnectCompleted(Exception ex, AsyncSocket socket);
}
