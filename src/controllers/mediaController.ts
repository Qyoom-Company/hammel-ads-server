import crypto from "crypto";
import path from "path";
class MediaController {
    static saveFile(file: any) {
        return new Promise((resolve, reject) => {
            const filename = this.generateRandomName(20);
            const extention = path.parse(file.name).ext;
            file.mv(
                `${__dirname}/../../uploads/${filename}${extention}`,
                (err: any) => {
                    if (err) reject(err);
                    else resolve(filename);
                }
            );
        });
    }

    static generateRandomName(length: number) {
        return crypto
            .randomBytes(Math.ceil(length / 2))
            .toString("hex")
            .slice(0, length);
    }
}

export default MediaController;
