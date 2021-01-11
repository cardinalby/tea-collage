import '../css/app.css';

import '../i18n/config';
import React, {useMemo} from "react";
import Collage from "./Collage";
import {HashRouter, Route} from 'react-router-dom'
import {RouteComponentProps, Redirect} from "react-router";
import collageSourcesSet from "../models/collageSourcesSet";
import {getRecommendedCollageSize} from "../models/sizeAutoSelector";
import {ControlPanel} from "./ControlPanel";
import {useStateSafe} from "../hooks/useStateSafe";
import {useTranslation, withTranslation} from "react-i18next";
import {useWindowAspectRatioClass} from "../hooks/useWindowAspectRatio";
import {InfoWindow} from "./InfoWindow";

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
    useWindowAspectRatioClass(document.body, {
        'horizontal-control-panel': aspectRatio => aspectRatio < collageSourcesSet.collageAspectRatio
    });

    function renderContents(routeProps: RoutesProps) {
        const section = getRouteParam(routeProps, 'section');
        const itemId = getRouteParam(routeProps, 'itemId');

        const TranslatedContents = withTranslation()((props) => {
            return (
                <div className='app' lang={props.i18n && props.i18n.language}>
                    <div className={'main-area'}>
                        {section === 'collage' && <Collage layerId={itemId} collageSources={collageSources}/>}
                        {section === 'description' && <InfoWindow itemId={itemId}/>}
                    </div>
                    <ControlPanel collageSizeName={collageSizeName} onCollageSizeChange={setCollageSizeName}/>
                </div>
            );
        });

        return (
            <React.Suspense fallback="loading...">
                <TranslatedContents/>
            </React.Suspense>
        );
    }

    return (
        <HashRouter>
            <Route path="/:section(collage|description)/:itemId?"
                   render={(...routeProps) => renderContents(routeProps)}/>
            <Route exact path="/">
                <Redirect to="/collage/" />
            </Route>
        </HashRouter>
    );
}

export default App;
