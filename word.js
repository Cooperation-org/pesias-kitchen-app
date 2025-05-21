function stringToNumber(str) {
    // Convert to lowercase and remove extra spaces
    const input = str.toLowerCase().trim();
    
    // Handle empty input
    if (!input) return 0;
    
    // Define number word mappings
    const ones = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
        'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18,
        'nineteen': 19
    };
    
    const tens = {
        'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
        'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
    };
    
    const scales = {
        'hundred': 100,
        'thousand': 1000,
        'million': 1000000,
        'billion': 1000000000,
        'trillion': 1000000000000
    };
    
    // Split input into words
    const words = input.split(/\s+/);
    let result = 0;
    let current = 0;
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        if (ones[word] !== undefined) {
            current += ones[word];
        } else if (tens[word] !== undefined) {
            current += tens[word];
        } else if (word === 'hundred') {
            current *= 100;
        } else if (scales[word] !== undefined) {
            if (word === 'hundred') {
                current *= 100;
            } else {
                // For thousand, million, billion, trillion
                current *= scales[word];
                result += current;
                current = 0;
            }
        }
    }
    
    result += current;
    return result;
}