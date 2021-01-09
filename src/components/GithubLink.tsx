import '../css/githubLink.css';
import {ReactComponent as Icon} from "../images/github_logo.svg";
import React from "react";
import {useTranslation} from "react-i18next";

export interface GithubLinkProps {
    url: string,
    title?: string
}

export function GithubLink(props: GithubLinkProps) {
    const {t} = useTranslation();

    return (
        <div className='github-link' title={t('actions.view_on_github')}>
            <a href={props.url} title={props.title}>
                <Icon/>
            </a>
        </div>
    );
}