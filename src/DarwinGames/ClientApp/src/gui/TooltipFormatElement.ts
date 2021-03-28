import { ElementRenderer } from "./ElementRenderer";

export type TooltipFormatProps<T> = { value: T };
export type TooltipFormatElement<T> = ElementRenderer<TooltipFormatProps<T>>;
