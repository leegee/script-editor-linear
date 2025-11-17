export function filetypeFromExt(filename: string): "audio" | "image" | "video" | "other" {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";

    switch (ext) {
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "webp":
        case "bmp":
        case "tiff":
            return "image";

        case "mp4":
        case "mov":
        case "avi":
        case "mkv":
        case "webm":
        case "flv":
            return "video";

        case "mp3":
        case "wav":
        case "flac":
        case "aac":
        case "ogg":
        case "m4a":
            return "audio";

        default:
            return "other";
    }
}

