import { Dispatch, SetStateAction, useState } from "react";

export type TUseSearchProps = {
    initialValue: string;
};

export type TUseSearchReturn = [
    value: string,
    setValue: Dispatch<SetStateAction<string>>
];

export const useSearch = ({
                              initialValue,
                          }: TUseSearchProps): TUseSearchReturn => {
    const [value, setValue] = useState<string>(initialValue);

    console.log(value);

    return [value, setValue];
};