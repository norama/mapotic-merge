// https://medium.com/@alvaro.saburido/set-theory-for-arrays-in-es6-eb2f20a61848

export function union(arr1, arr2) {
    return [...new Set([...arr1, ...arr2])];
}

export function multiUnion(arrs) {
    let all = [];
    arrs.forEach((arr) => {
        all = [...all, ...arr];
    });
    return [...new Set(all)];
}