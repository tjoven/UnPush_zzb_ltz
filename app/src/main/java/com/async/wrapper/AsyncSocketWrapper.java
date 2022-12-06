package com.async.wrapper;

import com.async.AsyncSocket;

public interface AsyncSocketWrapper extends AsyncSocket, DataEmitterWrapper {
    public AsyncSocket getSocket();
}
