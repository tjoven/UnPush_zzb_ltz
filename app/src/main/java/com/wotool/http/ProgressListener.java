package com.wotool.http;

public interface ProgressListener {
    void onProgress(long currentBytes, long totalBytes);
}
