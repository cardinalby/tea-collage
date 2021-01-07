import '../css/app.css';
import '../css/spinner.css';
import '../css/overlay.css';
import '../css/collage.css';
import '../css/smoothImage.css';
import '../css/qualitySelector.css';

import '../i18n/config';
import React, {useState} from "react";
import Collage from "./Collage";
import {HashRouter, Route} from 'react-router-dom'
import {RouteComponentProps, Redirect} from "react-router";
import {QualitySelector} from "./QualitySelector";
import collageSourcesSet, {CollageSources} from "../models/collageSourcesSet";
import {getRecommendedCollageSize} from "../models/sizeAutoSelector";
import {LanguageSelector} from "./LanguageSelector";

type RoutesProps = [RouteComponentProps<any>];

const recommendedCollageSize = getRecommendedCollageSize(collageSourcesSet.getSizes());

function getRouteParam(routeProps: RoutesProps, paramName: string): string|undefined {
    const foundProps = routeProps
        .map(props => props.match?.params[paramName])
        .filter(param => param);
    return foundProps.length ? foundProps[0] : undefined;
}

function App() {
    const [collageSources, setCollageSources] = useState(collageSourcesSet.getSources(recommendedCollageSize));

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
                <div className="control-panel">
                    <QualitySelector
                        sizes={collageSourcesSet.getSizes()}
                        initSizeName={recommendedCollageSize}
                        onChange={sizeName => setCollageSources(collageSourcesSet.getSources(sizeName))}
                    />
                    <div className='control-panel-center'/>
                    <LanguageSelector/>
                </div>
                <div className={'main-area'}>
                    {mainArea}
                </div>
            </div>
        );
    }

    return (
        <HashRouter>
            <Route path="/:section(collage|description)/:layerId?"
                   render={(...routeProps) => renderContents(routeProps)}/>
            <Redirect exact from="/" to="/collage/" />
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
