// https://decembersoft.com/posts/promises-in-serial-with-array-reduce/
export function chain(promises) {
    return promises.reduce((acc, promise) => (
        acc.then(responses => promise.then(response => [...responses, response]))
    ), Promise.resolve([]));
}