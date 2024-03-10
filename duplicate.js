function countDuplicates(arr) {

    const counts = {};


    arr.forEach(element => {
        if (counts[element]) {
            counts[element]++
        } else {
            counts[element] = 1;
        }
    });


    const uniqueValues = [];

    for (const key in counts) {
        if (Object.hasOwnProperty.call(counts, key)) {
            uniqueValues.push({
                value: key,
                count: counts[key]
            });
        }
    }

    return uniqueValues;
}

const arr = [1, 2, 3, 4, 5, 1, 2, 3, 4, 1, 1, 2];
const uniqueCounts = countDuplicates(arr);
console.log(uniqueCounts);
