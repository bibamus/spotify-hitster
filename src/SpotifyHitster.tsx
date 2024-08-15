import {getPlaylist, getPlayLists, Playlist} from "./spotfiy/api.ts";
import {useEffect, useState} from "react";
import {PlayListView} from "./PlayListView.tsx";

export function SpotifyHitster() {

    const [playlists, setPlaylists] = useState([] as Playlist[]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null as Playlist | null);

    useEffect(() => {
        getPlayLists().then(playlists => {
            setPlaylists(playlists.items);
        });

    }, [])


    function choosePlaylist(playlist: Playlist) {
        getPlaylist(playlist.id).then(playlist => {
            setSelectedPlaylist(playlist);
        });
    }

    return <>
        <h1>SpotifyHitster</h1>{selectedPlaylist ? <PlayListView playlist={selectedPlaylist}/> : (
        <ul style={{listStyleType: 'none', padding: 0, margin: 0}}>
            {playlists.map(playlist => <li key={playlist.id}><a href={"#"} onClick={() => choosePlaylist(playlist)}
            >{playlist.name}</a></li>)}
        </ul>
    )}

    </>;
}