package com.async;

import com.async.callback.DataCallback;

public class NullDataCallback implements DataCallback {
    @Override
    public void onDataAvailable(DataEmitter emitter, ByteBufferList bb) {
        bb.recycle();
    }
}
