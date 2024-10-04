export function findKeyInObject(obj, keyToFind) {
    // Function to recursively search for the key in the object
    function search(obj) {
        let result = null;
        Object.keys(obj).forEach((key) => {
            if (result) return;
            const value = obj[key];
            if (key === keyToFind) {
                result = value;
            } else if (typeof value === 'object' && value !== null) {
                result = search(value);
            }
        });
        return result;
    }

    // Get the value of the specified key
    let keyValue;

    if (typeof obj === 'object') {
        keyValue = search(obj);
    }

    // Check if the key value is an array containing the check word and return the first value
    if (keyValue && Array.isArray(keyValue)) {
        return keyValue[0];
    }

    return keyValue;
}
