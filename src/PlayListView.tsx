import {Playlist, Track} from "./spotfiy/api.ts";
import QRCode from "qrcode.react";

export interface PlayListViewProps {
    playlist: Playlist;
}

interface TrackViewProps {
    track: Track;
}

function TrackView({track}: TrackViewProps) {
    return <div>
        <h3>{track.name}</h3>
        <QRCode value={track.external_urls.spotify}/>
        <p>Artists: {track.artists.map(artist => artist.name).join(', ')}</p>
        <p>Album: {track.album.name} - {track.album.release_date}</p>
    </div>;
}

export function PlayListView({playlist}: PlayListViewProps) {


    return (<>
        <h2>{playlist.name}</h2>
        {playlist.tracks.items.map(item => <TrackView key={item.track.id} track={item.track}/>)}
    </>);
}