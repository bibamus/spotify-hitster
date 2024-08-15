import {getAccessToken} from "../auth/auth.ts";

export interface Track {
    name: string;
    id: string;
    uri: string;
    external_urls: {
        spotify: string;
    },
    artists: {
        name: string;
    }[],
    album: {
        name: string;
        release_date: string;
    }

}

export interface PlaylistTrack {
    track: Track

}

export interface Playlist {
    name: string;
    id: string;
    snapshot_id: string;
    tracks: {
        items: PlaylistTrack[];
    }
}

export interface PlaylistsResponse {
    items: Playlist[];

}

export async function getPlayLists(): Promise<PlaylistsResponse> {
    const accessToken = await getAccessToken();
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(response => response.json());
    return response as PlaylistsResponse;
}

export async function getPlaylist(id: string) {
    const accessToken = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(response => response.json());
    return response as Playlist;
}