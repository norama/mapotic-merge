
function toArray(x, keep) {
    return keep ? x : [x];
}

function chainSingle(getPromise, promiseCount, spread=false) {
    return [...Array(promiseCount).keys()].reduce((acc, index) => (
        acc.then(responses => getPromise(index).then(response => [...responses, ...toArray(response, spread)]))
    ), Promise.resolve([]));
}

function allPromise(getPromise, promiseCount, concurrentCount, index) {
    const start = index * concurrentCount;
    const end = Math.min(start + concurrentCount, promiseCount);

    return Promise.all([...Array(end - start).keys()].map((i) => (getPromise(start + i))));
}

// chain with possibility to group into concurrent tasks by concurrentCount > 1
export function chain(getPromise, promiseCount, concurrentCount=1) {
    if (concurrentCount === 1) {
        return chainSingle(getPromise, promiseCount);
    }

    return chainSingle(
        (index) => (allPromise(getPromise, promiseCount, concurrentCount, index)),
        Math.ceil(promiseCount / concurrentCount),
        true
    );
}

// THIS IS GOOD, but without concurrency
/*
export function chain(getPromise, promiseCount) {
    return [...Array(promiseCount).keys()].reduce((acc, index) => (
        acc.then(responses => getPromise(index).then(response => [...responses, response]))
    ), Promise.resolve([]));
}
*/

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