import { hash, compare } from "bcryptjs";

export async function hashPassword(plainText: string): Promise<string> {
    return hash(plainText, 12);
}

export async function verifyPassword(
    plainText: string,
    hashed: string
): Promise<boolean> {
    return compare(plainText, hashed);
}
