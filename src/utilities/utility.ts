import { randomInt } from 'crypto';
export class Utility {

    public async generateRandomString() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 30; i++) {
            const randomIndex = randomInt(0, chars.length);
            result += chars[randomIndex];
        }
        return result;
    }


    // Function to generate n unique random strings
    public async generateUniqueRandomStrings(n) {
        const uniqueStrings = new Set();
        while (uniqueStrings.size < n) {
            uniqueStrings.add(this.generateRandomString());
        }
        return Array.from(uniqueStrings);
    }
}