

export function insertAtIndex(str: string, substring: string, index: number) {
    return str.slice(0, index) + substring + str.slice(index);
}