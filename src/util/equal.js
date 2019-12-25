export function categoryEqual(cat1, cat2) {
    return cat1.name.en === cat2.name.en &&
        cat1.icon === cat2.icon &&
        cat1.color === cat2.color;
}

function empty(x) {
    return x === "{}" || x === "[]" || x === "null" || x === "[null]";
}

function settingsEqual(settings1, settings2) {
    const s1 = JSON.stringify(settings1);
    const s2 = JSON.stringify(settings2);
    return (s1 === s2) || (empty(s1) && empty(s2));
}

export function attributeEqual(attr1, attr2) {
    return attr1.name.en === attr2.name.en &&
        attr1.attribute_type === attr2.attribute_type &&
        attr1.icon === attr2.icon &&
        settingsEqual(attr1.settings, attr2.settings);
}