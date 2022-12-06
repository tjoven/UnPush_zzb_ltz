package com.async;


public interface AsyncSocket extends DataEmitter, DataSink {
    public AsyncServer getServer();
}
