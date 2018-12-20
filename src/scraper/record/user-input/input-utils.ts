import { Group, MapTo } from "../../../common/utils/type-utils";

export function convertMapToGroups<T>(map: MapTo<T[]>): Group<T>[] {
    return Object.entries(map)
        .map(([name, elements]) => {
            return {
                name,
                elements
            }
        })
}

export function mergeGroups<T>(oldInputs: Group<T>[], newInputs: Group<T>[], sortFn: (a: T, b: T) => number): Group<T>[] {
    const groupMap = new Map<string, T[]>();
    for(const group of oldInputs) {
        groupMap.set(group.name, group.elements)
    }
    for(const group of newInputs) {
        const oldGroup = groupMap.get(group.name);
        if(oldGroup) {
            groupMap.set(group.name, oldGroup.concat(group.elements))
        } else {
            groupMap.set(group.name, group.elements)
        }
    }
    return Array.from(groupMap.entries())
        .map(([key, elements]) => {
            return { name: key, elements: elements.sort(sortFn) }
        })
}

export function mergeMaps<T>(oldInputs: MapTo<T[]>, newInputs: MapTo<T[]>, sortFn: (a: T, b: T) => number): MapTo<T[]> {
    const allChannels = Array.from(new Set([...Object.keys(oldInputs), ...Object.keys(newInputs)]));
    return allChannels.map(channel => {
        return { 
            channel,
            inputs: (oldInputs[channel] || [])
                .concat(newInputs[channel] || [])
                .sort(sortFn)
        } 
    }).reduce((acc, el) => {
        acc[el.channel] = el.inputs;
        return acc;
    }, {} as MapTo<T[]>)
}
