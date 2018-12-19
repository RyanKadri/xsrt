import { pluck, sortAsc } from "../../../common/utils/functional-utils";
import { RecordedInputChannels } from "../../types/types";

const sortByTimestamp = sortAsc(pluck('timestamp'));

export function mergeChanneledInputs(oldInputs: RecordedInputChannels, newInputs: RecordedInputChannels): RecordedInputChannels {
    const allChannels = Array.from(new Set([...Object.keys(oldInputs), ...Object.keys(newInputs)]));
    return allChannels.map(channel => {
        return { 
            channel,
            inputs: (oldInputs[channel] || [])
                .concat(newInputs[channel] || [])
                .sort(sortByTimestamp)
        } 
    }).reduce((acc, el) => {
        acc[el.channel] = el.inputs;
        return acc;
    }, {})
}