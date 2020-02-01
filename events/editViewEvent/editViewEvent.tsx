import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import { Col, InputGroup, Button } from 'react-bootstrap';
import './editViewEvent.css';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers';
import { Grid, SnackbarContent, Snackbar } from '@material-ui/core';
import Selector from '../selector/selector';
import { LanguageJson } from '../../../store/language/types';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import { putEvent, OkWhereEvent, getParticipants, getItems } from './../server'
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import { RouteComponentProps } from 'react-router';
import { getEvent } from './../server'
import UserPicker from '../userPicker/userPicker';

const mapToken = 'pk.eyJ1IjoiZ29uY2Fsb2FjIiwiYSI6ImNrMnowbHozNjAzemEzbmp3cWMybjhzbHUifQ.81qtIcUgKhRVHxCE6zlb7g';

interface IProps extends RouteComponentProps<any> {
    appLanguage: LanguageJson,
    loggedIn: any,
    sessionUser: any
}

interface IStats {
    event: OkWhereEvent,
    dates: Date[],
    times: Date[],
    right: boolean[],
    hasWritten: boolean[],
    snackbar: boolean[],
    success: boolean,
    error: boolean,
    viewport: MapLocation;
    allMarkers: MapMarker[];
    mapOpen: boolean;
    selectedMarker: MapMarker | null;
    userLocation: boolean;
    notMapSelected: boolean;
    searchResultLayer: any | null;
    eventPicture: any,
    unlocked: boolean[],
    callbackToBring: any,
    callbackOffered: any,
    callbackUsers: any,
    canEdit: boolean
}

interface MapLocation {
    longitude: number,
    latitude: number,
    zoom: number,
    width: any,
    height: any
}
interface MapMarker {
    key: number,
    longitude: number,
    latitude: number
}

export class EditViewEvent extends Component<IProps, IStats>  {

    mapRef: any;
    geocoderContainerRef: any;

    constructor(props: any) {
        super(props);
        var selectedDate = new Date();
        this.state = {
            event: {
                title: "",
                type: -1,
                date_start: "",
                date_end: "",
                location: "",
                unseen: true
            },
            canEdit: false,
            success: false,
            right: [
                true, true
            ],
            hasWritten: [
                false, false
            ],
            snackbar: [
                false, false, false
            ],
            callbackOffered: undefined,
            callbackToBring: undefined,
            callbackUsers: undefined,
            unlocked: [true, true, true, true, true],
            error: false,
            dates: [selectedDate, selectedDate],
            times: [selectedDate, selectedDate],
            viewport: { longitude: -9.135697499999992, latitude: 38.7078936, zoom: 12, width: '100%', height: '100%' },
            mapOpen: false,
            allMarkers: [],
            notMapSelected: false,
            selectedMarker: null,
            userLocation: false,
            searchResultLayer: null,
            eventPicture: null
        }
        this.unlock = this.unlock.bind(this);
        this.onFileSelected = this.onFileSelected.bind(this);
        this.onViewportChange = this.onViewportChange.bind(this);
        this.handleOnResult = this.handleOnResult.bind(this);
        this.onLocationChange = this.onLocationChange.bind(this);
        this.notMapSelectHandler = this.notMapSelectHandler.bind(this);
        this.locationGetInfo = this.locationGetInfo.bind(this);
        this.locationHandleError = this.locationHandleError.bind(this);
        this.selectPopupHandler = this.selectPopupHandler.bind(this);
        this.addMarkerHandler = this.addMarkerHandler.bind(this);
        this.delMarkerHandler = this.delMarkerHandler.bind(this);
        this.fixPosition = this.fixPosition.bind(this);
        this.onMarkerDragEnd = this.onMarkerDragEnd.bind(this);
        this.changeInputHandler = this.changeInputHandler.bind(this);
        this.mapRef = React.createRef();
        this.geocoderContainerRef = React.createRef();
        this.submit = this.submit.bind(this);
        this.parseDate = this.parseDate.bind(this);
        this.stopSnackbar = this.stopSnackbar.bind(this);
        this.callbackOfferedFunction = this.callbackOfferedFunction.bind(this);
        this.callbackToBringFunction = this.callbackToBringFunction.bind(this);
        this.fill = this.fill.bind(this);
        this.callbackUsersFunction = this.callbackUsersFunction.bind(this);
    }

    callbackOfferedFunction(childData: any) {
        this.setState({ callbackOffered: childData })
    }

    callbackToBringFunction(childData: any) {
        this.setState({ callbackToBring: childData })
    }

    parseDate(date: Date, time: Date): string {
        let dateFormat = require('dateformat');
        return dateFormat(date, "yyyy/MM/dd") + " " + dateFormat(time, "HH:mm") + ":00";
    }

    submit(event: any) {
        let tmp = this.state.event
        this.setState({
            event: {
                ...tmp,
                date_start: this.parseDate(this.state.dates[0], this.state.times[0]),
                date_end: this.parseDate(this.state.dates[1], this.state.times[1]),
            }
        }, () => {
            let data = new FormData();
            let submitedEvent: OkWhereEvent = this.state.event;
            data.append('event', JSON.stringify(submitedEvent))
            let offered = undefined;
            let bring = undefined;
            offered = {
                label: "OFFERED",
                type: 0,
                items: this.state.callbackOffered !== undefined ? this.state.callbackOffered as any[] : undefined
            }
            bring = {
                label: "BRING",
                type: 1,
                items: this.state.callbackToBring !== undefined ? this.state.callbackToBring as any[] : undefined
            }

            console.log(offered)
            console.log(bring)
            console.log(this.state.callbackOffered)
            console.log(this.state.callbackToBring)
            if (this.state.eventPicture !== null)
                data.append('img', this.state.eventPicture)
            if (offered !== undefined)
                data.append("item_rows", JSON.stringify(offered))
            if (bring !== undefined)
                data.append("item_rows", JSON.stringify(bring))
            putEvent(this.state.event.id as number, data).then(
                res => {
                    let old = this.state.snackbar;
                    old[2] = true;
                    this.setState({ snackbar: old })
                },
                err => {
                    let old = this.state.snackbar;
                    old[0] = true;
                    this.setState({ snackbar: old })
                });
        })
    }

    onFileSelected(event: any) {
        this.setState({
            eventPicture: event.target.files[0]
        })
    }

    onViewportChange(viewport: any) {
        if (this.state.mapOpen) this.setState({ viewport: viewport });
    }

    handleOnResult(event: any) {
        this.setState({ viewport: { longitude: event.result.center[0], latitude: event.result.center[1], zoom: 12, width: '100%', height: '100%' } })
    }

    onLocationChange(viewport: any) {
        if (viewport.zoom > 16)
            viewport.zoom = 12;
        this.setState({ viewport: { ...viewport, transitionDuration: 0 } })
    }

    notMapSelectHandler(event: any) {
        this.setState({ notMapSelected: true })
    }


    locationGetInfo(position: any) {
        this.setState({ viewport: { longitude: position.coords.longitude, latitude: position.coords.latitude, zoom: 12, width: this.state.viewport.width, height: this.state.viewport.height } })
    }


    locationHandleError = (error: any) => {
        switch (error.code) {
            case 3:
                window.alert('Expired!'); //NEVER ENTER HERE, CUZ THERE IS NO TIMEOUT
                break;
            case 2:
                window.alert('You dont support geolocation, so we cant initialize your default language');
                break;
            case 1:
                window.alert('You dont allow geolocation, so we cant initialize your default language');
        }
    }

    selectPopupHandler(evt: any, marker: MapMarker) {
        evt.preventDefault();
        this.setState({ selectedMarker: marker })
    }


    addMarkerHandler(evt: any) {
        if (evt.leftButton && !this.state.notMapSelected) {
            evt.preventDefault();
            const evtLng: number = evt.lngLat[0];
            const evtLat: number = evt.lngLat[1];
            this.setState({ allMarkers: [{ key: 0, longitude: evtLng, latitude: evtLat }] })
        } else {
            this.setState({ notMapSelected: false })
        }
    }

    delMarkerHandler(marker: MapMarker) {
        let botArray = [...this.state.allMarkers];
        botArray.splice(marker.key - 1, 1)
        this.fixPosition(botArray)
        this.setState({ allMarkers: [...botArray] })
        this.setState({ selectedMarker: null })
    }

    //aux function
    fixPosition = (array: MapMarker[]) => {
        let counter = 0;
        array.forEach((element: MapMarker) => {
            if (element.key !== counter + 1) {
                element.key = counter + 1;
            }
            counter++;
        })
    }

    onMarkerDragEnd(evt: any, marker: MapMarker) {
        evt.preventDefault();
        const evtLng: number = evt.lngLat[0];
        const evtLat: number = evt.lngLat[1];
        let botArray = [...this.state.allMarkers];
        for (let pos = 0; pos < botArray.length; pos++) {
            if (botArray[pos].key === marker.key) {
                botArray[pos].latitude = evtLat;
                botArray[pos].longitude = evtLng;
                break;
            }
        }
        this.setState({
            allMarkers: [...botArray]
        })
    }

    changeInputHandler(event: any) {
        const input = event.currentTarget;
        const value = input.value;
        const formId = input.id;
        let currEvent = this.state.event
        switch (formId) {
            case "eventDesc":
                this.setState({
                    event: {
                        ...currEvent,
                        description: value as string === '' ? undefined : value as string
                    }
                })
                break;
            case "eventEmail":
                this.setState({
                    event: {
                        ...currEvent,
                        email: value as string === '' ? undefined : value as string
                    }
                })
                break;
            case "eventPhone":
                this.setState({
                    event: {
                        ...currEvent,
                        phone: value as number === 0 ? undefined : value as number
                    }
                })
                break;
            case "imgpath":
                this.setState({
                    event: {
                        ...currEvent,
                        img_path: value as string === '' ? undefined : value as string
                    }
                });
                break;
        }
    }



    stopSnackbar(i: number) {
        var nsnackbar = this.state.snackbar;
        nsnackbar[0] = false;
        this.setState({ snackbar: nsnackbar })
    }

    componentDidUpdate(prevProps: IProps) {
        if (prevProps.sessionUser !== this.props.sessionUser && this.props.sessionUser === this.state.event.creator) {
            this.setState({ canEdit: false })
        }
    }

    componentDidMount() {
        getEvent(this.props.match.params.id).then(
            res => {
                this.setState({ event: res.data }, () => {
                    this.fill();
                    getParticipants(this.state.event.id as number).then(
                        res => {
                            let result = res.data.results;
                            let currEvent = this.state.event
                            this.setState({
                                event: {
                                    ...currEvent,
                                    participants: result
                                }
                            })
                        }
                    )
                    getItems(this.state.event.id as number).then(
                        res => {
                            let result = res.data.results;
                            if (result.length === 1) {
                                if (result[0].label === "OFFERED") {
                                    this.setState({ callbackOffered: result[0] })
                                } else {
                                    this.setState({ callbackToBring: result[0] })
                                }
                            } else if (result.length === 2) {
                                if (result[0].label === "OFFERED")
                                    this.setState({
                                        callbackOffered: result[0],
                                        callbackToBring: result[1]
                                    })
                                else
                                    this.setState({
                                        callbackToBring: result[0],
                                        callbackOffered: result[1]
                                    })
                            }
                        }
                    )
                })
            })
    }

    callbackUsersFunction(childData: any) {
        this.setState({ callbackUsers: childData })
    }

    fill() {
        this.setState({ mapOpen: true })
        let lol: string[] = this.state.event.location.split(' ', 2)
        this.setState({
            viewport: { longitude: parseFloat(lol[0]), latitude: parseFloat(lol[1]), zoom: 12, width: this.state.viewport.width, height: this.state.viewport.height },
            allMarkers: [{
                key: 0,
                longitude: parseFloat(lol[0]),
                latitude: parseFloat(lol[1])
            }]
        })
        let _dates = [];
        let _times = [];
        let strings = this.state.event.date_start.split(" ", 2)
        _dates[0] = new Date(strings[0]);
        _times[0] = new Date(strings[0] + " " + strings[1]);
        strings = this.state.event.date_end.split(" ", 2);
        _dates[1] = new Date(strings[0]);
        _times[1] = new Date(strings[0] + " " + strings[1]);
        this.setState({
            dates: _dates,
            times: _times
        })
    }

    unlock(event: any) {
        const input = event.currentTarget;
        const formId = input.id;
        var edit = this.state.unlocked;
        switch (formId) {
            case "eventEmail":
                edit[2] = !edit[2];
                break;
            case "eventPhone":
                edit[3] = !edit[3];
                break;
            case "eventDesc":
                edit[4] = !edit[4];
                break;
        }
        this.setState({ unlocked: edit });
    }

    handleDateChange(date: Date, index: Number) {
        if (index === 0)
            this.setState({ dates: [date, this.state.dates[1]] })
        else
            this.setState({ dates: [this.state.dates[0], date] })
    }

    handleTimeChange(date: Date, index: Number) {
        if (index === 0)
            this.setState({ times: [date, this.state.times[1]] });
        else
            this.setState({ times: [this.state.times[0], date] });
    }

    render() {
        return (
            <Form onSubmit={(event: any) => this.submit(event)} className="wrapper-div">
                <Form.Row>
                    <input type="file" accept='image/*' onChange={this.onFileSelected} />
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="eventName" className="name-wrapper">
                        <Form.Label>{this.props.appLanguage.appLanguage.createEvent.name}</Form.Label>
                        <InputGroup>
                            <Form.Control disabled type="text"
                                value={this.state.event.title === "" ? undefined : this.state.event.title} />
                            <Form.Control.Feedback type="invalid">{this.props.appLanguage.appLanguage.createEvent.invalid}</Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="span-wrapper">
                        <span>{this.props.appLanguage.appLanguage.createEvent.typeEq + this.props.appLanguage.appLanguage.createEvent.eventTypes[this.state.event.type]}</span>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="eventEmail">
                        <Form.Label>{this.props.appLanguage.appLanguage.createEvent.email}</Form.Label>
                        <InputGroup>
                            <Form.Control disabled={this.state.unlocked[2]} type="text" onChange={(event: any) => this.changeInputHandler(event)}
                                placeholder={this.state.event.email === null ? this.props.appLanguage.appLanguage.createEvent.email : this.state.event.email} />
                            <InputGroup.Append>
                                <InputGroup.Text hidden={this.state.canEdit} style={{ 'cursor': 'pointer' }} id="eventEmail" onClick={(e: any) => this.unlock(e)}>Edit</InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group as={Col} controlId="eventPhone">
                        <Form.Label>{this.props.appLanguage.appLanguage.createEvent.phone}</Form.Label>
                        <InputGroup>
                            <Form.Control disabled={this.state.unlocked[3]} type="tel" onChange={(event: any) => this.changeInputHandler(event)}
                                placeholder={this.state.event.phone === undefined ? this.props.appLanguage.appLanguage.createEvent.phone : this.state.event.phone.toString()} />
                            <InputGroup.Append>
                                <InputGroup.Text hidden={this.state.canEdit} style={{ 'cursor': 'pointer' }} id="eventPhone" onClick={(e: any) => this.unlock(e)}>Edit</InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId={"map"}>
                        <Form.Label>{this.props.appLanguage.appLanguage.createEvent.map}</Form.Label>
                        <div className="wrapper-map">
                            <ReactMapGL className="map-container" {...this.state.viewport}
                                mapboxApiAccessToken={mapToken} onViewportChange={(viewport: any) => this.onViewportChange(viewport)}
                                mapStyle="mapbox://styles/mapbox/streets-v11"
                                doubleClickZoom={true} ref={this.mapRef}>
                                {this.state.allMarkers.map((marker: MapMarker) => (
                                    <Marker className="wrapper-marker" key={marker.key} longitude={marker.longitude} latitude={marker.latitude} offsetTop={-40} offsetLeft={-20}>
                                        <button className="marker-button"
                                            onClick={(evt) => this.selectPopupHandler(evt, marker)}>
                                        </button>
                                    </Marker>
                                ))}
                                {this.state.selectedMarker ? (
                                    <Popup latitude={this.state.selectedMarker.latitude} longitude={this.state.selectedMarker.longitude} offsetTop={-35} offsetLeft={-2.5}
                                        onClose={() => {
                                            this.setState({ selectedMarker: null })
                                        }}>
                                        <div>
                                            <h3>{this.props.appLanguage.appLanguage.createEvent.location}</h3>
                                            <span>{this.props.appLanguage.appLanguage.createEvent.marker}</span>
                                        </div>
                                    </Popup>
                                ) : null}
                            </ReactMapGL>
                        </div>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <Grid container justify="space-around" className="dates-desc">
                            {this.state.dates.map((d, index) => (
                                <KeyboardDatePicker
                                    hidden={this.state.canEdit}
                                    label={index === 0 ? this.props.appLanguage.appLanguage.createEvent.startDate : this.props.appLanguage.appLanguage.createEvent.endDate}
                                    format={"dd/MM/yyyy"}
                                    className={"picker"}
                                    value={d}
                                    onChange={(d: any) => this.handleDateChange(d, index)}
                                />
                            ))}
                            {this.state.times.map((t, index) => (
                                <KeyboardTimePicker
                                    hidden={this.state.canEdit}
                                    label={index === 0 ? this.props.appLanguage.appLanguage.createEvent.startTime : this.props.appLanguage.appLanguage.createEvent.endTime}
                                    format={"HH:mm"}
                                    className={"picker"}
                                    value={t}
                                    onChange={(date: any) => this.handleTimeChange(date, index)}
                                    ampm={false}
                                />
                            ))}
                        </Grid>
                    </MuiPickersUtilsProvider>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="eventDesc">
                        <Form.Label>{this.props.appLanguage.appLanguage.createEvent.description}</Form.Label>
                        <InputGroup>
                            <Form.Control as="textarea" rows="4" disabled={this.state.unlocked[4]}
                                type="text" placeholder={this.state.event.description === null ? this.props.appLanguage.appLanguage.createEvent.descPlaceholder : this.state.event.description} />
                            <InputGroup.Append>
                                <InputGroup.Text hidden={this.state.canEdit} style={{ 'cursor': 'pointer' }} id="eventDesc" onClick={(e: any) => this.unlock(e)}>Edit</InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form.Group>
                </Form.Row>
                <div>
                    <Selector loaded = {true} picked={this.state.callbackToBring} callBack={this.callbackToBringFunction} title={this.props.appLanguage.appLanguage.createEvent.toBring} appLanguage={this.props.appLanguage} loggedIn={this.props.loggedIn} sessionUser={this.props.sessionUser} />
                </div>
                <div>
                    <Selector loaded = {true}  picked={this.state.callbackOffered} callBack={this.callbackOfferedFunction} title={this.props.appLanguage.appLanguage.createEvent.offered} appLanguage={this.props.appLanguage} loggedIn={this.props.loggedIn} sessionUser={this.props.sessionUser} />
                </div>
                <div>
                    <UserPicker appLanguage={this.props.appLanguage} pickedUsers={this.state.event.participants === null || this.state.event.participants === undefined ? [] : this.state.event.participants} callBack={this.callbackUsersFunction} sessionUser={this.props.sessionUser} />
                </div>
                <Button onClick={this.submit}>{this.props.appLanguage.appLanguage.createEvent.submit}</Button>
                <Snackbar anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }} open={this.state.snackbar[2]} autoHideDuration={2000} onClose={() => this.stopSnackbar(1)}>
                    <SnackbarContent style={{ 'backgroundColor': 'green' }} message={
                        <span>
                            <CheckCircleIcon />
                            {this.props.appLanguage.appLanguage.snackbarsEvents.editSucess}
                        </span>
                    }>
                    </SnackbarContent>
                </Snackbar>
                <Snackbar anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }} open={this.state.snackbar[1]} autoHideDuration={2000} onClose={() => this.stopSnackbar(0)}>
                    <SnackbarContent style={{ 'backgroundColor': 'rgb(255, 208, 0)', 'color': 'black' }} message={
                        <span>
                            <WarningIcon />
                            {this.props.appLanguage.appLanguage.snackbarsEvents.addWarning}
                        </span>
                    }>
                    </SnackbarContent>
                </Snackbar>
                <Snackbar anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }} open={this.state.snackbar[0]} autoHideDuration={2000} onClose={() => this.stopSnackbar(0)}>
                    <SnackbarContent style={{ 'backgroundColor': 'red', 'color': 'white' }} message={
                        <span>
                            <ErrorIcon />
                            {this.props.appLanguage.appLanguage.snackbarsEvents.error}
                        </span>
                    }>
                    </SnackbarContent>
                </Snackbar>
            </Form>
        );
    }
}

export default EditViewEvent;