export const parsePicture = (picture) => {
    const pictureBase64 = `data:${picture.mimetype};base64,${picture.data.toString("base64")}`;
    return pictureBase64;
};
