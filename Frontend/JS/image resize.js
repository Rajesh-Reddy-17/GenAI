async function resizeImageFile(file, maxDim = 1024, quality = 0.85) {
    if (!file.type.startsWith("image/")) return file;
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
        if (scale >= 1) return file;

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
        if (!blob) return file;

        const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
        return new File([blob], newName, { type: "image/jpeg" });
    } catch (e) {
        console.warn("Image resize failed, sending original file:", e);
        return file;
    }
}
