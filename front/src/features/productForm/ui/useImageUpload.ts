import { ChangeEvent, useCallback, useRef, useState } from 'react';

import { readFileAsDataUrl } from '@shared/lib';

type TUseImageUploadOptions = {
    /** Максимальный размер файла в байтах (по умолчанию 10 МБ). */
    maxSize?: number;
    /** Коллбэк при успешной загрузке изображения. */
    onImageLoaded: (dataUrl: string) => void;
};

type TUseImageUploadReturn = {
    /** Ref для скрытого <input type="file">. */
    fileInputRef: React.RefObject<HTMLInputElement>;
    /** Текст ошибки валидации изображения. */
    imageError: string | undefined;
    /** Обработчик onChange для <input type="file">. */
    handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
    /** Сброс изображения (очищает стейт и инпут). */
    handleRemoveImage: () => void;
};

export const useImageUpload = ({ maxSize = 10 * 1024 * 1024, onImageLoaded }: TUseImageUploadOptions): TUseImageUploadReturn => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageError, setImageError] = useState<string>();

    const handleImageChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
        setImageError(undefined);
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        if (!file.type.startsWith('image/')) {
            setImageError('Выберите изображение');
            return;
        }
        if (file.size > maxSize) {
            setImageError('Размер изображения не должен превышать 10 МБ');
            return;
        }
        try {
            const dataUrl = await readFileAsDataUrl(file);
            onImageLoaded(dataUrl);
        } catch {
            setImageError('Не удалось загрузить изображение');
        }
    }, [maxSize, onImageLoaded]);

    const handleRemoveImage = useCallback(() => {
        onImageLoaded('');
        setImageError(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onImageLoaded]);

    return { fileInputRef, imageError, handleImageChange, handleRemoveImage };
};
