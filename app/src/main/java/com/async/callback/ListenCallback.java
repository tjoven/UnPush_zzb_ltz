package com.async.callback;

import com.async.AsyncServerSocket;
import com.async.AsyncSocket;


public interface ListenCallback extends CompletedCallback {
    public void onAccepted(AsyncSocket socket);
    public void onListening(AsyncServerSocket socket);
}
