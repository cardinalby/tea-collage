import '../css/app.css';
import '../css/spinner.css';
import '../css/overlay.css';
import '../css/collage.css';

import React from "react";
import Collage from "./Collage";
import {HashRouter, Route} from 'react-router-dom'
import {RouteComponentProps} from "react-router";

function getRouteLayerId(routeProps: [RouteComponentProps<any>]) {
    return routeProps
        .map(props => props.match?.params?.layerId)
        .filter(layerId => layerId)
        [0];
}

function App() {
    return (
    <div className="App">
        <HashRouter>
            <Route path="/" exact
                   render={() => renderCollage()}/>
            <Route path="/overlay/:layerId"
                   render={(...routeProps) => renderCollage(getRouteLayerId(routeProps))}/>
            <Route path="/description/:layerId"
                   render={(...routeProps) => renderDescription(getRouteLayerId(routeProps))}/>
        </HashRouter>
    </div>
    );
}

function renderCollage(layerId?: string) {
    return <Collage layerId={layerId} />
}

function renderDescription(layerId: string) {
    return <div>
        <h1>{layerId}</h1>
        Description
    </div>
}

export default App;
