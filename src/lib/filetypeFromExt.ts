export type YouTubeThumbURL = string;

export function filetypeFromExt(url: string): "audio" | "image" | "video" | YouTubeThumbURL | "other" {
    const ext = url.split(".").pop()?.toLowerCase() ?? "";

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
    }

    if (/(youtube\.com\/watch\?v=|youtu\.be\/)/.test(url)) {
        return youtubeThumb(url);
    }

    return "other";
}

function youtubeThumb(url: string) {
    const id = extractYouTubeID(url);
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg` as YouTubeThumbURL;
}

function extractYouTubeID(url: string): string {
    // youtu.be/JxSfrQbZp9k
    const short = url.match(/youtu\.be\/([^?&#]+)/);
    if (short) return short[1];

    // youtube.com/watch?v=JxSfrQbZp9k
    const long = url.match(/[?&]v=([^&#]+)/);
    if (long) return long[1];

    return "";
}
