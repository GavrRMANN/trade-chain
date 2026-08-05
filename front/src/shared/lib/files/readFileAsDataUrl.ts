export const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
                return;
            }

            reject(new Error('Не удалось прочитать файл'));
        });

        reader.addEventListener('error', () => reject(reader.error));

        reader.readAsDataURL(file);
    });
