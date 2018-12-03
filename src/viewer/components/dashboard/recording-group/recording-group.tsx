import React from "react";
import { MetadataGroup } from "../../../services/recording-service";
import { RecordingList } from "../recording-list/recording-list";

export const RecordingGroup = ({group}: { group: MetadataGroup }) => {
    const thumbnail = firstThumbnail(group);
    return <div className="recording-group">
        { thumbnail ? <img src={ thumbnail }></img> : null } 
        <ul>
            
        </ul>
    </div>
}

function firstThumbnail(group: MetadataGroup) {
    const res = group.results.find(result => result.thumbnail !== undefined);
    return res ? `/screenshots/${res.thumbnail}` : null;
}