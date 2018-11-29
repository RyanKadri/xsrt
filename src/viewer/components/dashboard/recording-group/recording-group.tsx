import React, { Fragment } from "react";
import { MetadataGroup } from "../../../services/recording-service";
import { RecordingList } from "../recording-list/recording-list";

export const RecordingGroupList = ({groups}: { groups: MetadataGroup[] }) => 
    <Fragment>{
        groups.length > 0
            ? groups.map(group => <RecordingGroup {...group} key={group.site}></RecordingGroup>)
            : <p>No recordings found</p>
    }</Fragment>

export const RecordingGroup = (group: MetadataGroup) => {
    const thumbnail = firstThumbnail(group);
    return <div className="recording-group">
        <h3>{group.site}</h3>
        { thumbnail ? <img src={ thumbnail }></img> : null } 
        <ul>
            <RecordingList recordings={group.results}></RecordingList>
        </ul>
    </div>
}

function firstThumbnail(group: MetadataGroup) {
    const res = group.results.find(result => result.thumbnail !== undefined);
    return res ? `/screenshots/${res.thumbnail}` : null;
}