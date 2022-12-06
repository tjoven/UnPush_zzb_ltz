package com.async.http.socketio;

import android.net.Uri;
import android.text.TextUtils;

import com.async.http.AsyncHttpPost;

public class SocketIORequest extends AsyncHttpPost {
    public SocketIORequest(String uri) {
        this(uri, "");
    }

    String endpoint;
    public String getEndpoint() {
        return endpoint;
    }

    String query;
    public String getQuery() {
        return query;
    }

    public SocketIORequest(String uri, String endpoint) {
        this(uri, endpoint, null);
    }

    public SocketIORequest(String uri, String endpoint, String query) {
        super(Uri.parse(uri).buildUpon().encodedPath("/socket.io/1/").build().toString()+"?"+query);
        this.endpoint = endpoint;
        this.query = query;
    }
}
