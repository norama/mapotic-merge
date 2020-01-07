
export function chain(getPromise, promiseCount) {
    return [...Array(promiseCount).keys()].reduce((acc, index) => (
        acc.then(responses => getPromise(index).then(response => [...responses, response]))
    ), Promise.resolve([]));
}



// THIS IS WRONG!!! Just an implementation of Promise.all,
// promises get to be executed immediately after creation!

// https://decembersoft.com/posts/promises-in-serial-with-array-reduce/

/*
export function chain(promises) {
    return promises.reduce((acc, promise) => (
        acc.then(responses => promise.then(response => [...responses, response]))
    ), Promise.resolve([]));
}
*/