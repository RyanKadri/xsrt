import { RecordedMutationGroup, RecordedUserInput } from "../../../common/src";
import { inject, injectable } from "inversify";
import { RecordingEvents } from "../components/utils/recording-data-utils";
import { TweakableConfigs } from "./viewer-tweaks";

@injectable()
export class RegionService {

    constructor(
        @inject(TweakableConfigs) private uxTweaks: Pick<TweakableConfigs, "regionIdleTime">
    ) { }

    splitRegions(events: RecordingEvents, regionEndTime: number): Region[] {
        const orderedEvents: (RecordedUserInput | RecordedMutationGroup)[] =
            [...events.changes, ...events.inputs.flatMap(group => group.elements)]
                .sort((a, b) => a.timestamp - b.timestamp);
        const regions: Region[] = [];
        let currRegionStart = 0, lastEvt = 0;
        for (const evt of orderedEvents) {
            if (evt.timestamp - lastEvt > this.uxTweaks.regionIdleTime) {
                if (lastEvt !== 0) {
                    regions.push({ type: "action", start: currRegionStart, end: lastEvt });
                }
                regions.push({ type: "idle", start: lastEvt, end: evt.timestamp });
                currRegionStart = evt.timestamp;
            }
            lastEvt = evt.timestamp;
        }
        if (lastEvt !== 0) {
            regions.push({ type: "action", start: currRegionStart, end: lastEvt });
        }
        if (lastEvt !== regionEndTime) {
            regions.push({ type: "idle", start: lastEvt, end: regionEndTime });
        }
        return regions;
    }
}

export interface Region {
    start: number;
    end: number;
    type: "action" | "idle";
}
