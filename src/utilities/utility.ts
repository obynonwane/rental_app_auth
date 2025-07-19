import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'crypto';
import { customAlphabet } from 'nanoid';
import slugify from 'slugify';
import User from '../user/user.entity';
import { Like, Repository } from 'typeorm';
export class Utility {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

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



    /** Slugifies a full name (first + last) */
    private makeBaseSlug(firstName: string, lastName: string): string {
        const full = `${firstName} ${lastName}`;
        return slugify(full, { lower: true, strict: true });
    }

    /** Generates a unique slug, appending –1, –2, … if needed */
    public async generateUniqueSlug(firstName: string, lastName: string): Promise<string> {
        const base = this.makeBaseSlug(firstName, lastName);

        // Find all existing slugs starting with that base
        const existing = await this.userRepository.find({
            where: { user_slug: Like(`${base}%`) },
            select: ['user_slug'],
        });
        const used = existing.map(u => u.user_slug);

        // If “john-doe” isn’t taken, use it
        if (!used.includes(base)) {
            return base;
        }

        // Otherwise bump the suffix until we find a free one
        let suffix = 1;
        let candidate: string;
        do {
            candidate = `${base}-${suffix++}`;
        } while (used.includes(candidate));

        return candidate;
    }

}