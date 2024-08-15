import './App.css'
import {useEffect} from "react";
import {beginLogin, completeLogin, isAuthenticated} from "./auth/auth.ts";
import {SpotifyHitster} from "./SpotifyHitster.tsx";

function App() {

    useEffect(() => {
        if (!isAuthenticated() && new URLSearchParams(location.search).has('code')) {
            completeLogin();
        }
    }, []);



    return (
        <>
            {isAuthenticated() ? (
                <SpotifyHitster/>
            ) : (
                <button onClick={() => beginLogin()}>Log in</button>
            )}

        </>
    )
}

export default App
