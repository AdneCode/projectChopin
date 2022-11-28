export const selectHotkeys = () => (state) => state.hotkeys;
export const selectInstrument = () => (state) => state.hotkeys.instrument;
export const selectCurrentPreset = () => (state) => state.hotkeys.currentPreset;
export const selectPresets = () => (state) => state.hotkeys.presets;
