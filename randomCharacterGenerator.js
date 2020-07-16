function randomChars(n) {
    let chars = ''
    for (let i = 0; i < n; i++) {
        chars += String.fromCharCode(Math.floor(Math.random() * 95) + 32)
    }
    return chars
}

console.log(randomChars(100))