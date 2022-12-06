package com.async.callback;

import com.async.future.Continuation;

public interface ContinuationCallback {
    public void onContinue(Continuation continuation, CompletedCallback next) throws Exception;
}
