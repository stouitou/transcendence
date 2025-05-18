import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "def_32_byte_key_1234567890123456"; // 32 bytes//@TODO remove this key
//const ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex"); // 32 bytes
const IV_LENGTH = 12; // Longueur du vecteur d'initialisation (IV)

  /**
   * encrypt a text using AES-256-GCM
   * @param text 
   * @returns - the encrypted text
   * @example
   * const encryptedText = encrypt("Hello World");
   * encryptedText ==> "vector:tag:encryptedData"
   */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);//"Initialization Vector"
    const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY), iv);//"chiffreur"
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag(); // "tag" pour l'authentification 
    //le resultat est une chaîne de caractères hexadécimale
    //le format est : iv:tag:encrypted
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
  } catch (error) {
    console.error("🔐 Error during encryption:", error);
    throw new Error("Encryption failed");
  }
}

export function decrypt(text: string): string {
  const [ivHex, tagHex, dataHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encryptedText = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString("utf8");
}

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}