import { NativeSet } from "./enum/NativeSet";

// TODO: Replace with a union of supported Lua types
export type LuaType = string;

export interface ParamOverride {
    name?: string;
    type?: LuaType;
    defaultValue?: string | number | boolean | null;
}

type NativeOverrides = Record<string, Record<number, ParamOverride>>;

const GetVehiclePedIsIn: NativeOverrides = {
    "GetVehiclePedIsIn": {
        1: { defaultValue: false } // lastVehicle
    }
};

// Shared between GTA and RDR3
const GameOverrides: NativeOverrides = {
    ...GetVehiclePedIsIn,
    "IsPedInAnyVehicle": {
        1: { defaultValue: false } // atGetIn
    }
};

export const NativeParamOverrides: Partial<Record<NativeSet, NativeOverrides>> = {
    [NativeSet.GTA]: GameOverrides,
    [NativeSet.RDR3]: GameOverrides,
    [NativeSet.Cfx]: {
        ...GetVehiclePedIsIn,
        "GetResourceMetadata": {
            2: { defaultValue: 0 } // index
        }
    }
};

// Types only, a param with a default should include nil (e.g. "integer|nil")
export const GlobalParamOverrides: Partial<Record<NativeSet, Record<string, LuaType>>> = {
    [NativeSet.Cfx]: {
        "playerSrc": "integer|string"
    }
};
