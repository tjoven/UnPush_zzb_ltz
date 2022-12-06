package com.async.parser;

import com.async.DataEmitter;
import com.async.DataSink;
import com.async.callback.CompletedCallback;
import com.async.future.Future;
import com.async.future.TransformFuture;

import org.json.JSONObject;

/**
 * Created by koush on 5/27/13.
 */
public class JSONObjectParser implements AsyncParser<JSONObject> {
    @Override
    public Future<JSONObject> parse(DataEmitter emitter) {
        return new TransformFuture<JSONObject, String>() {
            @Override
            protected void transform(String result) throws Exception {
                setComplete(new JSONObject(result));
            }
        }
        .from(new StringParser().parse(emitter));
    }

    @Override
    public void write(DataSink sink, JSONObject value, CompletedCallback completed) {
        new StringParser().write(sink, value.toString(), completed);
    }
}
