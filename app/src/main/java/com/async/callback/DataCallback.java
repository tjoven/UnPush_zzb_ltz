package com.async.callback;

import com.async.ByteBufferList;
import com.async.DataEmitter;


public interface DataCallback {
    public void onDataAvailable(DataEmitter emitter, ByteBufferList bb);
}
