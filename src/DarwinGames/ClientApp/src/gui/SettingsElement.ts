import { ElementRenderer } from "./ElementRenderer";
import { SettingsUpdater } from "./SettingsUpdater";

export type SettingsElementProps<TSettings> = {
    settings: TSettings,
    update: SettingsUpdater<TSettings>,
    disabled: boolean,
};
export type SettingsElement<TSettings> = ElementRenderer<SettingsElementProps<TSettings>>;
