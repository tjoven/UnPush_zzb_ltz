package com.async.parser;

import com.async.ByteBufferList;
import com.async.DataEmitter;
import com.async.DataSink;
import com.async.callback.CompletedCallback;
import com.async.future.Future;
import com.async.future.TransformFuture;

/**
 * Created by koush on 5/27/13.
 */
public class StringParser implements AsyncParser<String> {
    @Override
    public Future<String> parse(DataEmitter emitter) {
        return new TransformFuture<String, ByteBufferList>() {
            @Override
            protected void transform(ByteBufferList result) throws Exception {
                setComplete(result.readString());
            }
        }
        .from(new ByteBufferListParser().parse(emitter));
    }

    @Override
    public void write(DataSink sink, String value, CompletedCallback completed) {
        new ByteBufferListParser().write(sink, new ByteBufferList(value.getBytes()), completed);
    }
}
