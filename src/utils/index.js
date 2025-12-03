export const detectarMimeType = (buffer) => {
    if (!buffer || buffer.length < 4) return null;

    // PNG signature: 89 50 4E 47
    if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
    ) {
        return "image/png";
    }

    // JPEG signature: FF D8
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
        return "image/jpeg";
    }

    // GIF signature: GIF87a or GIF89a
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        return "image/gif";
    }

    // WebP signature: "RIFF....WEBP"
    if (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46
    ) {
        return "image/webp";
    }

    // AVIF
    if (
        buffer.toString("ascii", 0, 4) === "ftyp" ||
        buffer.toString("ascii", 4, 8).includes("avif") ||
        buffer.toString("ascii", 0, 4).toUpperCase() === "UKLG"
    ) {
        return "image/avif";
    }

    return "application/octet-stream"; // fallback genérico
};

export const parseRespOk = (data, message) => {
    return {
        status: true,
        message: message,
        data: data,
    };
};

export const parseRespError = (message) => {
    return {
        status: false,
        message: message,
    };
};

export const isEmpty = (value) => {
    if (value == null) return true; // null o undefined
    if (typeof value === "string" && value.trim() === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
};
