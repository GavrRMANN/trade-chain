export const checkImageUrl = (url: string): Promise<boolean> =>
    new Promise((resolve) => {
        const image = new Image();

        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);

        image.src = url;
    });