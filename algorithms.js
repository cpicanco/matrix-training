function wordsFromSyllables(syllables, swap_syllables = false) {
    const newList = [];
    let s1 = 0;
    let s2 = 1;

    // check if it is odd
    if (syllables.length % 2 !== 0) {
        syllables.push(syllables[0]);
    }

    if (swap_syllables) {
        s1 = 1;
        s2 = 0;
    }

    for (let i = 0; i < syllables.length; i += 2) {
        if (i + 1 < syllables.length) {
            newList.push(syllables[i+s1] + syllables[i+s2]);
        }
    }
    return newList;
}

function rotate(syllables, n) {
    if (n === undefined) {
        return [...syllables];
    }

    if (n === 0) {
        return [...syllables];
    }

    const d = [...syllables];

    n = n % d.length;
    if (n > 0) {
        // Rotate right
        const removed = d.splice(-n, n);
        d.unshift(...removed);
    } else if (n < 0) {
        // Rotate left
        const removed = d.splice(0, -n);
        d.push(...removed);
    }
    return d;
}

export const algorithms = {
    hanna: (selectedOrder) => {;
        selectedOrder.length = 0;
        selectedOrder.push('ni', 'bo', 'fa', 'le');
        return algorithms.hanna_generalized(selectedOrder);
    },

    hanna_generalized: (selectedOrder) => {
        // use the first syllable list as given
        const l1 = selectedOrder;
        // rotate list items left one time
        const l2 = rotate(l1, -1);
        // rotate list items right one time, except for the last one
        const l3 = rotate(l2.slice(0, l2.length - 1), 1).concat([l2[l2.length - 1]]);
        // now, create words from
        const words = [
            // first three lists in original order
            ...wordsFromSyllables(l1),
            ...wordsFromSyllables(l2),
            ...wordsFromSyllables(l3),
            // remaining lists in reverse order
            ...wordsFromSyllables(l1, true),
            ...wordsFromSyllables(l2, true),
            ...wordsFromSyllables(l3, true)
          ];
        return words;
    }
};