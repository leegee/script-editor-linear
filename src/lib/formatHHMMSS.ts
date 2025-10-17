export const formatHHMMSS = (secs: number) =>
    [Math.floor(secs / 3600), Math.floor((secs % 3600) / 60), Math.floor(secs % 60)]
        .map(n => n.toString().padStart(2, "0"))
        .join(":");
