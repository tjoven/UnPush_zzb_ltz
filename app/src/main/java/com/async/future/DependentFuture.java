package com.async.future;

public interface DependentFuture<T> extends Future<T>, DependentCancellable {
}
