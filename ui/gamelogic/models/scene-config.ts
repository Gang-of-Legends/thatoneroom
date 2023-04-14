import { Maps } from "../enums";

export interface SceneConfig {
    backgroundLayers?: string[];
    worldLayers?: string[];
    foregroundLayers?: string[];
    map: Maps;
}
