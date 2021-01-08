import '../css/app.css';

import '../i18n/config';
import React, {useMemo} from "react";
import Collage from "./Collage";
import {HashRouter, Route} from 'react-router-dom'
import {RouteComponentProps, Redirect} from "react-router";
import collageSourcesSet, {CollageSources} from "../models/collageSourcesSet";
import {getRecommendedCollageSize} from "../models/sizeAutoSelector";
import {ControlPanel} from "./ControlPanel";
import {useStateSafe} from "../hooks/useStateSafe";

type RoutesProps = [RouteComponentProps<any>];

const recommendedCollageSize = getRecommendedCollageSize(collageSourcesSet.getSizes());

function getRouteParam(routeProps: RoutesProps, paramName: string): string|undefined {
    const foundProps = routeProps
        .map(props => props.match?.params[paramName])
        .filter(param => param);
    return foundProps.length ? foundProps[0] : undefined;
}

function App() {
    const [collageSizeName, setCollageSizeName] = useStateSafe(recommendedCollageSize);
    const collageSources = useMemo(() =>
        collageSourcesSet.getSources(collageSizeName),
        [collageSizeName]
    );

    function renderContents(routeProps: RoutesProps) {
        const section = getRouteParam(routeProps, 'section');
        const layerId = getRouteParam(routeProps, 'layerId');

        let mainArea: any = undefined;
        switch (section) {
            case 'collage': mainArea = renderCollage(collageSources, layerId); break;
            case 'description': mainArea = renderDescription(layerId); break;
        }

        return (
            <div className='app'>

                <div className={'main-area'}>
                    {mainArea}
                </div>
                <ControlPanel collageSizeName={collageSizeName} onCollageSizeChange={setCollageSizeName} />
            </div>
        );
    }

    return (
        <HashRouter>
            <Route path="/:section(collage|description)/:layerId?"
                   render={(...routeProps) => renderContents(routeProps)}/>
            <Route exact path="/">
                <Redirect to="/collage/" />
            </Route>
        </HashRouter>
    );
}

function renderCollage(collageSources: CollageSources, layerId?: string) {
    return <Collage layerId={layerId} collageSources={collageSources}/>
}

function renderDescription(layerId?: string) {
    return <div>
        <h1>{layerId}</h1>
        Description
    </div>
}

export default App;
