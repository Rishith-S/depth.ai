import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";
import type { Config } from "@imgly/background-removal";

export const removeBackground = async (imageSrc: string): Promise<string> => {
    try {
        const config: Config = {
            progress: (key: string, current: number, total: number) => {
                console.log(`Downloading ${key}: ${current} of ${total}`);
            },
            debug: false,
            fetchArgs: {
                mode: 'cors',
            }
        };

        const blob = await imglyRemoveBackground(imageSrc, config);
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Background removal failed:", error);
        throw new Error("Failed to remove background. Your browser might be blocking the necessary assets (SharedArrayBuffer) or the image format is unsupported.");
    }
};