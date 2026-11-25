/* A copy of the world for "what would this owner's company do" runs. Open decisions hold functions that structuredClone cannot copy, and a copy never needs them. */
export function cloneWorld(S) { const { activeScene, sceneQueue, ...rest } = S; return structuredClone({ ...rest, activeScene: null, sceneQueue: [] }); }
