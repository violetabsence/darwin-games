import React from "react";

export enum SetFromInputType {
    Text,
    Number,
    Checkbox,
    Radio
}

export function setFromInput<TValue>(
    dispatch: React.Dispatch<React.SetStateAction<TValue>> | ((value: TValue) => void),
    type?: SetFromInputType) {
    return (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (type === undefined) {
            switch ((event.currentTarget.type ?? "text").toLowerCase()) {
                case "number":
                    type = SetFromInputType.Number;
                    break;
                case "checkbox":
                    type = SetFromInputType.Checkbox;
                    break;
                case "radio":
                    type = SetFromInputType.Radio;
                    break;
            }
        }

        let value: unknown;
        switch (type) {
            case SetFromInputType.Checkbox:
                value = (event as React.FormEvent<HTMLInputElement>).currentTarget.checked;
                break;
            case SetFromInputType.Radio:
                value = event.currentTarget.value;
                break;
            case SetFromInputType.Number:
                value = +event.currentTarget.value;
                break;
            case SetFromInputType.Text:
            default:
                value = event.currentTarget.value;
                break;
        }

        dispatch(value as TValue);
    };
};
