package com.async.parser;

import com.async.DataEmitter;
import com.async.DataSink;
import com.async.callback.CompletedCallback;
import com.async.future.Future;
import com.async.future.TransformFuture;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Created by koush on 5/27/13.
 */
public class JSONArrayParser implements AsyncParser<JSONArray> {
    @Override
    public Future<JSONArray> parse(DataEmitter emitter) {
        return new TransformFuture<JSONArray, String>() {
            @Override
            protected void transform(String result) throws Exception {
                setComplete(new JSONArray(result));
            }
        }
        .from(new StringParser().parse(emitter));
    }

    @Override
    public void write(DataSink sink, JSONArray value, CompletedCallback completed) {
        new StringParser().write(sink, value.toString(), completed);
    }
}
