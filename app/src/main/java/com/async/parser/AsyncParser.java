package com.async.parser;

import com.async.DataEmitter;
import com.async.DataSink;
import com.async.callback.CompletedCallback;
import com.async.future.Future;

/**
 * Created by koush on 5/27/13.
 */
public interface AsyncParser<T> {
    Future<T> parse(DataEmitter emitter);
    void write(DataSink sink, T value, CompletedCallback completed);
}
