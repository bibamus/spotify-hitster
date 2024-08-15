import './App.css'
import {useEffect, useState} from "react";
import {beginLogin, completeLogin, isAuthenticated} from "./auth/auth.ts";
import {SpotifyHitster} from "./SpotifyHitster.tsx";

function App() {

    useEffect(() => {
        if (!authenticated && window.location.pathname === '/callback') {
            completeLogin().then(() => setAuthenticated(true)).catch(console.error);
        }
    }, []);


    const [authenticated, setAuthenticated] = useState(isAuthenticated())

    return (
        <>
            {authenticated ? (
                <SpotifyHitster/>
            ) : (
                <button onClick={() => beginLogin()}>Log in</button>
            )}

        </>
    )
}

export default App
