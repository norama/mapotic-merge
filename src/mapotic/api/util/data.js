function escape(item) {
    if (!(typeof(item) === 'string')) {
        return item;
    }
    if ((item.indexOf(',') === -1) && (item.indexOf('\n') === -1)) {
        return item;
    }
    // eslint-disable-next-line
    item = item.replace(/\"/g, "'");
    return '"' + item + '"';
}

// table (array of arrays) to CSV file format:
// a11,a12,a12,a14
// a21,a22,a23,a24 
export function toCsv(data) {
    data = data.map((row) => (row.map((item) => escape(item))));
    return data.map((row) => (row.join(','))).join('\n');
}

export function slug(url) {
    const k = url.lastIndexOf('/');
    return (k !== -1) ? url.substring(k + 1) : null;
}