import '../css/app.css';

import '../i18n/config';
import React from "react";
import {HashRouter, Route} from 'react-router-dom'
import {RouteComponentProps, Redirect} from "react-router";
import {withTranslation} from "react-i18next";
import {AppContents} from "./AppContents";
import {useHitsCounter} from "../hooks/useHitsCounter";

type RoutesProps = [RouteComponentProps<any>];

function getRouteParam(routeProps: RoutesProps, paramName: string): string|undefined {
    const foundProps = routeProps
        .map(props => props.match?.params[paramName])
        .filter(param => param);
    return foundProps.length ? foundProps[0] : undefined;
}

function App() {
    function renderContents(routeProps: RoutesProps) {
        const section = getRouteParam(routeProps, 'section') || 'collage';
        const itemId = getRouteParam(routeProps, 'itemId');

        const TranslatedContents = withTranslation()(AppContents);

        return (
            <React.Suspense fallback="loading...">
                <TranslatedContents section={section} itemId={itemId}/>
            </React.Suspense>
        );
    }

    useHitsCounter();

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
