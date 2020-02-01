import React, { Component } from 'react';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import './EventList.css';
import Card from 'react-bootstrap/Card';
import { RouteComponentProps } from 'react-router';
import { Button } from 'react-bootstrap';
import { LanguageJson } from '../../../store/language/types';
import { LightEvent } from '../server';
import Dummy from './../../../assets/dummyObjects/pictures/dummy.jpg'
import { getEvents } from './../server'
import { Snackbar, SnackbarContent } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';

interface Data extends RouteComponentProps<any> {
    title: string,
    content: string,
    appLanguage: LanguageJson,
    loggedIn: any,
    sessionUser: any
}

interface IStats {
    items: LightEvent[],
    start: number,
    data: LightEvent[],
    imgs: any[],
    snackbar: boolean
}

export class EventList extends Component<Data, IStats> {

    constructor(props: any) {
        super(props);
        this.state = {
            items: [],
            start: 0,
            data: [],
            imgs: [],
            snackbar: false
        }
        this.buttonOnClick = this.buttonOnClick.bind(this);
        this.arrowOnClick = this.arrowOnClick.bind(this);
        this.setupImages = this.setupImages.bind(this);
        this.stopSnackbar = this.stopSnackbar.bind(this);
    }

    buttonOnClick(index: number) {
        this.props.history.push('/events/viewandedit/' + this.state.items[index].id);
    }

    componentDidMount() {
        getEvents(undefined, this.props.content, undefined).then(
            res => {
                if (res.data.results.length < 4) {
                    let size = res.data.results.length;
                    let results = res.data.results;
                    for (let i = 0; i < 4 - size; i++)
                        results.push({
                            title: this.props.appLanguage.appLanguage.eventList.noEvents,
                            img_path: Dummy,
                            description: this.props.appLanguage.appLanguage.eventList.create
                        })
                    this.setState({
                        data: results,
                        items: results
                    }, () => { this.setupImages(); })
                } else {
                    this.setState({ data: res.data.results as LightEvent[] }, () => {
                        this.setState({ items: this.state.data.slice(0, 4) }, () => {
                            this.setupImages();
                        })
                    });
                }
            },
            err => {
                let results = [];
                results.push({
                    title: this.props.appLanguage.appLanguage.eventList.noEvents,
                    img_path: Dummy,
                    description: this.props.appLanguage.appLanguage.eventList.create
                })
                results.push({
                    title: this.props.appLanguage.appLanguage.eventList.noEvents,
                    img_path: Dummy,
                    description: this.props.appLanguage.appLanguage.eventList.create
                })
                results.push({
                    title: this.props.appLanguage.appLanguage.eventList.noEvents,
                    img_path: Dummy,
                    description: this.props.appLanguage.appLanguage.eventList.create
                })
                results.push({
                    title: this.props.appLanguage.appLanguage.eventList.noEvents,
                    img_path: Dummy,
                    description: this.props.appLanguage.appLanguage.eventList.create
                })
                this.setState({
                    data: results,
                    items: results
                }, () => { this.setupImages(); })
            }
        );
    }

    arrowOnClick(side: boolean) {
        let current = this.state.start;
        if (side) {
            if (current + 3 < this.state.data.length) {
                let update = this.state.data.slice(current, current + 4);
                this.setState({ items: update, start: current + 1 });
            } else {
                this.setState({ snackbar: true })
            }
        } else {
            if (current - 1 !== -1) {
                var update = this.state.data.slice(current - 1, current + 3);
                this.setState({ items: update, start: current - 1 })
            } else {
                this.setState({ snackbar: true })
            }
        }
    }

    setupImages = () => {
        let auxArray = [];
        for (let i = 0; i < this.state.items.length; i++) {
            if (this.state.items[i].img_path === undefined || this.state.items[i].img_path === null) {
                auxArray[i] = Dummy;
            } else {
                auxArray[i] = this.state.items[i].img_path;
            }
        }
        this.setState({ imgs: [...auxArray] });
    }

    stopSnackbar() {
        this.setState({ snackbar: false })
    }

    render() {
        return (
            <div className="rectangle-wrapper">
                <div className="title-wrapper">
                    <p>
                        {this.props.title}
                    </p>
                </div>
                <div className="table-wrapper">
                    <div className="table-corner-cell">
                        <ChevronLeftIcon className="chevron-style" onClick={() => this.arrowOnClick(false)} />
                    </div>
                    <div className="table-middle-cell">
                        <div className="table-middle-container">
                            {this.state.items.map((i, index) => (
                                <Card className="card-wrapper">
                                    <Card.Img className="card-img-wrapper" variant="top" src={this.state.imgs[index]} />
                                    <Card.Title className="card-img-wrapper">{this.state.items[index].title}</Card.Title>
                                    <Card.Text className="card-desc-wrapper">{this.state.items[index].description}</Card.Text>
                                    <Button disabled={i.title === this.props.appLanguage.appLanguage.eventList.noEvents && i.description === this.props.appLanguage.appLanguage.eventList.create}
                                        className="card-button-wrapper" variant="primary" onClick={() => this.buttonOnClick(index)}>
                                        {this.props.appLanguage.appLanguage.eventList.check}</Button>
                                </Card>
                            ))}
                        </div>
                        <Snackbar anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }} open={this.state.snackbar} autoHideDuration={2000} onClose={this.stopSnackbar}>
                            <SnackbarContent style={{ 'backgroundColor': 'rgb(255, 208, 0)', 'color': 'black' }} message={
                                <span>
                                    <WarningIcon />
                                    {this.props.appLanguage.appLanguage.eventList.nomore}
                        </span>
                            }>
                            </SnackbarContent>
                        </Snackbar>
                    </div>
                    <div className="table-corner-cell">
                        <ChevronRightIcon className="chevron-style" onClick={() => this.arrowOnClick(true)} />
                    </div>
                </div>
            </div>
        )
    }
}

export default EventList;