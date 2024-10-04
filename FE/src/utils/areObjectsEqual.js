export function areObjectsEqual(obj1, obj2) {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        return obj1 === obj2;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    try {
        keys1.forEach((key) => {
            if (!keys2.includes(key) || !areObjectsEqual(obj1[key], obj2[key])) {
                throw new Error(false);
            }
        });
        return true;
    } catch (error) {
        console.log(error);
    }
    return false;
}
