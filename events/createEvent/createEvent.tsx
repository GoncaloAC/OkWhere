import React, { Component } from 'react';
import './createEvent.css';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Col, Button } from 'react-bootstrap';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker } from '@material-ui/pickers';
import { Grid, Snackbar, SnackbarContent } from '@material-ui/core';
import Selector from '../selector/selector';
import { LanguageJson } from '../../../store/language/types';
import ReactMapGL, { GeolocateControl, Marker, Popup } from 'react-map-gl';
import Geocoder from "react-map-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css"
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css"
import { OkWhereEvent } from './../server'
import { CSSProperties } from '@material-ui/styles';
import { postEvent } from './../server'
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import UserPicker from '../userPicker/userPicker';

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

const geolocateStyle: CSSProperties = {
    backgroundColor: 'transparent',
};

interface IProps {
    opened: boolean;
    callbackCreate: any;
    appLanguage: LanguageJson,
    loggedIn: any,
    sessionUser: any
}

interface IStats {
    event: OkWhereEvent,
    dates: Date[],
    times: Date[],
    opened: boolean,
    viewport: MapLocation;
    mapOpen: boolean;
    allMarkers: MapMarker[];
    selectedMarker: MapMarker | null;
    searchResultLayer: any | null;
    eventPicture: any,
    hidden: boolean,
    success: boolean,
    error: boolean,
    right: boolean[],
    hasWritten: boolean[],
    snackbar: boolean[],
    callbackToBring: any,
    callbackOffered: any,
    callbackUsers: any,
    notMapSelected: boolean,
    buttonDisabled: boolean
}

// Snackbar funciona como semaforo [vermelho, amarelo, verde]

const mapToken = 'pk.eyJ1IjoiZ29uY2Fsb2FjIiwiYSI6ImNrMnowbHozNjAzemEzbmp3cWMybjhzbHUifQ.81qtIcUgKhRVHxCE6zlb7g';

export class CEvent extends Component<IProps, IStats> {

    mapRef: any;
    geocoderContainerRef: any;
    geolocateContainerRef: any;


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
            error: false,
            success: false,
            callbackOffered: undefined,
            callbackToBring: undefined,
            callbackUsers: undefined,
            right: [
                true, true, true
            ],
            hasWritten: [
                false, false, false
            ],
            snackbar: [
                false, false
            ],
            hidden: true,
            buttonDisabled: false,
            eventPicture: null,
            opened: false,
            dates: [selectedDate, selectedDate],
            times: [selectedDate, selectedDate],
            viewport: { longitude: -9.135697499999992, latitude: 38.7078936, zoom: 12, width: '100%', height: '100%' },
            mapOpen: false,
            allMarkers: [],
            notMapSelected: false,
            selectedMarker: null,
            searchResultLayer: null
        }
        this.closeCreateHandler = this.closeCreateHandler.bind(this);
        this.submit = this.submit.bind(this);
        this.changeInputHandler = this.changeInputHandler.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
        this.onViewportChange = this.onViewportChange.bind(this);
        this.handleOnResult = this.handleOnResult.bind(this);
        this.locationGetInfo = this.locationGetInfo.bind(this);
        this.selectPopupHandler = this.selectPopupHandler.bind(this);
        this.addMarkerHandler = this.addMarkerHandler.bind(this);
        this.delMarkerHandler = this.delMarkerHandler.bind(this);
        this.onMarkerDragEnd = this.onMarkerDragEnd.bind(this);
        this.onLocationChange = this.onLocationChange.bind(this);
        this.mapRef = React.createRef();
        this.geocoderContainerRef = React.createRef();
        this.onFileSelected = this.onFileSelected.bind(this);
        this.stopSnackbar = this.stopSnackbar.bind(this);
        this.callbackOfferedFunction = this.callbackOfferedFunction.bind(this);
        this.callbackToBringFunction = this.callbackToBringFunction.bind(this);
        this.callbackUsersFunction = this.callbackUsersFunction.bind(this);
        this.handleViewportChange = this.handleViewportChange.bind(this);
    }

    callbackOfferedFunction(childData: any) {
        this.setState({ callbackOffered: childData })
    }

    callbackToBringFunction(childData: any) {
        this.setState({ callbackToBring: childData })
    }

    callbackUsersFunction(childData: any) {
        this.setState({ callbackUsers: childData })
    }

    onFileSelected(event: any) {
        this.setState({
            eventPicture: event.target.files[0]
        })
    }

    onViewportChange(viewport: any) {
        this.setState({ viewport: { ...viewport, transitionDuration: 0 } })
    }

    handleOnResult(event: any) {
        this.setState({ viewport: { longitude: event.result.center[0], latitude: event.result.center[1], zoom: 12, width: '100%', height: '100%' } })
    }

    onLocationChange(viewport: any) {
        if (viewport.zoom > 16)
            viewport.zoom = 12;
        this.setState({ viewport: { ...viewport, transitionDuration: 0 } })
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
            this.setState({ allMarkers: [{ key: 0, longitude: evtLng, latitude: evtLat }] }, () => this.setState({
                event: {
                    ...this.state.event, location: this.state.allMarkers[0].longitude + " " + this.state.allMarkers[0].latitude
                }
            }))

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

    componentDidUpdate(prevProps: IProps, prevStats: IStats) {
        if (prevProps.opened !== this.props.opened && this.props.opened) {
            this.setState({ opened: this.props.opened }, () => {
                navigator.geolocation.getCurrentPosition(this.locationGetInfo, this.locationHandleError);
                this.setState({ mapOpen: true })
            });
        }
        if (prevProps.opened !== this.props.opened && !this.props.opened) {
            this.setState({
                hasWritten: [false, false, false],
                right: [true, true, true]
            })
        }
    }

    closeCreateHandler() {
        this.setState({ opened: false }, () => {
            this.setState({
                viewport: { longitude: -9.135697499999992, latitude: 38.7078936, zoom: 12, width: '100%', height: '100%' },
                mapOpen: false,
                allMarkers: [],
                notMapSelected: false,
                selectedMarker: null
            })
        });
        this.props.callbackCreate('closed');
    }

    parseDate(date: Date, time: Date): string {
        let dateFormat = require('dateformat');
        return dateFormat(date, "yyyy/MM/dd") + " " + dateFormat(time, "HH:mm") + ":00";
    }

    submit(event: any) {
        let data = new FormData();
        let currEvent = this.state.event
        this.setState({
            event: {
                ...currEvent,
                date_start: this.parseDate(this.state.dates[0], this.state.times[0]),
                date_end: this.parseDate(this.state.dates[1], this.state.times[1]),
                participants: this.state.callbackUsers
            }
        }, () => {
            if (this.state.hasWritten[0] && this.state.hasWritten[1] && this.state.right[0] && this.state.right[1] && this.state.allMarkers.length !== 0) {
                let submitedEvent: OkWhereEvent = this.state.event;
                data.append('event', JSON.stringify(submitedEvent))
                let offered = undefined;
                let bring = undefined;
                offered = {
                    label: "OFFERED",
                    type: 0,
                    items: this.state.callbackOffered !== null ? this.state.callbackOffered : []
                }
                bring = {
                    label: "BRING",
                    type: 1,
                    items: this.state.callbackToBring !== undefined ? this.state.callbackToBring : []
                }
                if (this.state.eventPicture !== null)
                    data.append('img', this.state.eventPicture)
                if (offered !== undefined)
                    data.append("item_rows", JSON.stringify(offered))
                if (bring !== undefined)
                    data.append("item_rows", JSON.stringify(bring))
                postEvent(data).then(
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
            } else {
                this.setState({
                    right: [
                        this.state.event.title !== '',
                        this.state.event.type !== -1,
                        this.state.allMarkers.length !== 0
                    ],
                    hasWritten: [
                        true,
                        true,
                        true
                    ]
                })
                let old = this.state.snackbar
                old[1] = true;
                this.setState({
                    snackbar: old
                })
            }
            postEvent(data)
        })
        this.setState({ buttonDisabled: true })
        setTimeout(() => this.setState({ buttonDisabled: false }), 5000);
        event.preventDefault();
        event.stopPropagation();
    }

    stopSnackbar(i: number) {
        var nsnackbar = this.state.snackbar;
        nsnackbar[i] = false;
        this.setState({ snackbar: nsnackbar })
    }

    changeInputHandler(eventThrown: any) {
        const input = eventThrown.currentTarget;
        const value = input.value;
        const formId = input.id;
        let event = this.state.event
        switch (formId) {
            case "description":
                this.setState({
                    event: {
                        ...event,
                        description: value as string === '' ? undefined : value as string
                    }
                })
                break;
            case "emailContact":
                this.setState({
                    event: {
                        ...event,
                        email: value as string === '' ? undefined : value as string
                    }
                })
                break;
            case "phoneContact":
                this.setState({
                    event: {
                        ...event,
                        phone: value as number === 0 ? undefined : value as number
                    }
                })
                break;
            case "eventName":
                this.setState({
                    event: {
                        ...event,
                        title: value as string
                    }
                }, () => {
                    if (this.state.event.title === '') {
                        this.setState({ right: [false, this.state.right[1]] })
                    } else {
                        this.setState({ right: [true, this.state.right[1]] })
                    }
                    if (!this.state.hasWritten[0]) {
                        this.setState({ hasWritten: [true, this.state.hasWritten[1]] })
                    }
                });
                break;
            case "eventType":
                this.setState({
                    event: {
                        ...event,
                        type: Number(value)
                    }
                }, () => {
                    if (this.state.event.type === -1) {
                        this.setState({ right: [this.state.right[0], false] })
                    } else {
                        this.setState({ right: [this.state.right[0], true] })
                    }
                    if (!this.state.hasWritten[1]) {
                        this.setState({ hasWritten: [this.state.hasWritten[0], true] })
                    }
                });
                break;
            case "imgpath":
                this.setState({
                    event: {
                        ...event,
                        img_path: value as string === '' ? undefined : value as string,
                    }
                });
                break;
        }
    }

    handleDateChange(date: Date, index: Number) {
        if (index === 0)
            this.setState({ dates: [date, this.state.dates[1]] });
        else
            this.setState({ dates: [this.state.dates[0], date] });
    }

    handleTimeChange(date: Date, index: Number) {
        if (index === 0)
            this.setState({ times: [date, this.state.times[1]] });
        else
            this.setState({ times: [this.state.times[0], date] });
    }

    handleViewportChange(viewport: any) {
        if (this.state.mapOpen) this.setState({ viewport: viewport });
    }

    render() {
        return (
            <Modal size="lg" show={this.state.opened} onHide={this.closeCreateHandler}>
                <Modal.Header style={{ 'marginBottom': '5vh' }}>
                    <Modal.Title className="modal-header" >{this.props.appLanguage.appLanguage.createEvent.creating}</Modal.Title>
                    <input type="file" accept='image/*' onChange={this.onFileSelected} />
                </Modal.Header>
                <Modal.Body>
                    <div className="modal-body-wrapper">
                        <Form>
                            <Form.Row>
                                <Form.Group as={Col} controlId={"eventName"}>
                                    <Form.Label>{this.props.appLanguage.appLanguage.createEvent.name}</Form.Label>
                                    <Form.Control type="text" placeholder={this.props.appLanguage.appLanguage.createEvent.namePlaceholder}
                                        onChange={(event: any) => this.changeInputHandler(event)}
                                        isInvalid={this.state.hasWritten[0] && !this.state.right[0]}
                                        isValid={this.state.hasWritten[0] && this.state.right[0]} />
                                    <Form.Control.Feedback />
                                    <Form.Control.Feedback type="invalid">{this.props.appLanguage.appLanguage.createEvent.titlereq}</Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>
                            <Form.Group controlId={"eventType"}>
                                <Form.Label>{this.props.appLanguage.appLanguage.createEvent.type}</Form.Label>
                                <Form.Control as="select" onChange={(event: any) => this.changeInputHandler(event)}
                                    isInvalid={this.state.hasWritten[1] && !this.state.right[1]} style={{ 'cursor': 'pointer' }}
                                    isValid={this.state.hasWritten[1] && this.state.right[1]}>
                                    <option value={-1} disabled selected hidden>{this.props.appLanguage.appLanguage.createEvent.selectType}</option>
                                    <option value={0}>{this.props.appLanguage.appLanguage.createEvent.eventTypes[0]}</option>
                                    <option value={1}>{this.props.appLanguage.appLanguage.createEvent.eventTypes[1]}</option>
                                    <option value={2}>{this.props.appLanguage.appLanguage.createEvent.eventTypes[2]}</option>
                                    <option value={3}>{this.props.appLanguage.appLanguage.createEvent.eventTypes[3]}</option>
                                    <option value={4}>{this.props.appLanguage.appLanguage.createEvent.eventTypes[4]}</option>
                                    <option value={5}>{this.props.appLanguage.appLanguage.createEvent.eventTypes[5]}</option>
                                    <option value={6}>{this.props.appLanguage.appLanguage.createEvent.eventTypes[6]}</option>
                                    <option value={7}>{this.props.appLanguage.appLanguage.createEvent.eventTypes[7]}</option>
                                    <option value={8}>{this.props.appLanguage.appLanguage.createEvent.eventTypes[8]}</option>
                                    <option value={9}>{this.props.appLanguage.appLanguage.createEvent.eventTypes[9]}</option>
                                    <option value={10}>{this.props.appLanguage.appLanguage.createEvent.eventTypes[10]}</option>
                                </Form.Control>
                                <Form.Control.Feedback />
                                <Form.Control.Feedback type="invalid">{this.props.appLanguage.appLanguage.createEvent.typereq}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>{this.props.appLanguage.appLanguage.createEvent.dateTime}</Form.Label>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <Grid container justify="space-around">
                                        {this.state.dates.map((d, index) => (
                                            <KeyboardDatePicker
                                                label={index === 0 ? this.props.appLanguage.appLanguage.createEvent.startDate : this.props.appLanguage.appLanguage.createEvent.endDate}
                                                format={"dd/MM/yyyy"}
                                                className={"picker"}
                                                value={d}
                                                onChange={(d: any) => this.handleDateChange(d, index)}
                                            />
                                        ))}
                                        {this.state.times.map((t, index) => (
                                            <KeyboardTimePicker
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
                            </Form.Group>
                            <Form.Row>
                                <Form.Group as={Col} controlId={"map"}
                                    isInvalid={this.state.hasWritten[2] && !this.state.right[2]}
                                    isValid={this.state.hasWritten[2] && this.state.right[2]}>
                                    <Form.Label>{this.props.appLanguage.appLanguage.createEvent.map}</Form.Label>
                                    <div className="wrapper-map">
                                        <div ref={this.geolocateContainerRef}></div>
                                        <div className="search-container" ref={this.geocoderContainerRef}></div>
                                        <ReactMapGL className="map-container" {...this.state.viewport}
                                            mapboxApiAccessToken={mapToken} onViewportChange={(viewport: any) => this.handleViewportChange(viewport)}
                                            mapStyle="mapbox://styles/mapbox/streets-v11" onClick={(evt: any) => this.addMarkerHandler(evt)}
                                            doubleClickZoom={true}
                                            ref={this.mapRef}
                                        >
                                            {this.state.allMarkers.map((marker: MapMarker) => (
                                                <Marker className="wrapper-marker" key={marker.key} longitude={marker.longitude} latitude={marker.latitude} offsetTop={-40} offsetLeft={-20}
                                                    draggable={true} onDragEnd={(evt: any) => this.onMarkerDragEnd(evt, marker)}>
                                                    <button className="marker-button"
                                                        onClick={(evt) => this.selectPopupHandler(evt, marker)} onContextMenu={() => this.delMarkerHandler(marker)}>
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
                                            <div className="wrapper-geolocate" onClick={() => { this.setState({ notMapSelected: true }) }}>
                                                <GeolocateControl
                                                    style={geolocateStyle}
                                                    positionOptions={{ enableHighAccuracy: true }}
                                                    trackUserLocation={true}
                                                    showUserLocation={true}
                                                    onViewportChange={(viewport: any) => this.onLocationChange(viewport)}/>
                                            </div>
                                            <Geocoder
                                                mapRef={this.mapRef} containerRef={this.geocoderContainerRef}
                                                onResult={this.handleOnResult} onViewportChange={this.onViewportChange}
                                                mapboxApiAccessToken={mapToken} trackProximity={true}
                                                placeholder={this.props.appLanguage.appLanguage.createEvent.where} clearOnBlur={true} countries="PT"/>
                                        </ReactMapGL>
                                    </div>
                                    <Form.Control.Feedback />
                                    <Form.Control.Feedback type="invalid">{this.props.appLanguage.appLanguage.createEvent.locreq}</Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>
                            <Form.Row className="bottom-two">
                                <Form.Group as={Col} controlId={"emailContact"}>
                                    <Form.Label>{this.props.appLanguage.appLanguage.createEvent.email}</Form.Label>
                                    <Form.Control type="text" placeholder={this.props.appLanguage.appLanguage.createEvent.emailPlaceholder}
                                        onChange={(event: any) => this.changeInputHandler(event)} />
                                    <Form.Control.Feedback />
                                </Form.Group>
                                <Form.Group as={Col} controlId={"phoneContact"}>
                                    <Form.Label>{this.props.appLanguage.appLanguage.createEvent.phone}</Form.Label>
                                    <Form.Control type="number" placeholder={this.props.appLanguage.appLanguage.createEvent.phonePlaceholder}
                                        onChange={(event: any) => this.changeInputHandler(event)} />
                                    <Form.Control.Feedback />
                                </Form.Group>
                            </Form.Row>
                            <Form.Group as={Col} controlId={"description"} className="desc-fix">
                                <Form.Label>{this.props.appLanguage.appLanguage.createEvent.description}</Form.Label>
                                <Form.Control as="textarea" rows="4" type="text"
                                    placeholder={this.props.appLanguage.appLanguage.createEvent.descPlaceholder}
                                    onChange={(event: any) => this.changeInputHandler(event)} />
                                <Form.Control.Feedback />
                            </Form.Group>
                            <Form.Row>
                                <Selector loaded = {false} picked = {[]} callBack={this.callbackToBringFunction} title={this.props.appLanguage.appLanguage.createEvent.toBring} appLanguage={this.props.appLanguage} loggedIn={this.props.loggedIn} sessionUser={this.props.sessionUser} />
                            </Form.Row>
                            <Form.Row>
                                <Selector loaded = {false} picked = {[]}  callBack={this.callbackOfferedFunction} title={this.props.appLanguage.appLanguage.createEvent.offered} appLanguage={this.props.appLanguage} loggedIn={this.props.loggedIn} sessionUser={this.props.sessionUser} />
                            </Form.Row>
                            <Form.Row>
                                <UserPicker appLanguage = {this.props.appLanguage} pickedUsers={[]} callBack={this.callbackUsersFunction} sessionUser={this.props.sessionUser} />
                            </Form.Row>
                            <Button disabled={this.state.buttonDisabled} type="submit" onClick={this.submit}>{this.props.appLanguage.appLanguage.createEvent.submit}</Button>
                        </Form>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ 'marginTop': '10vh', 'border': 'none' }}>
                    <Button variant="primary" onClick={this.closeCreateHandler}>{this.props.appLanguage.appLanguage.createEvent.close}</Button>
                </Modal.Footer>
                <Snackbar anchorOrigin={{
                    vertical: 'bottom', horizontal: 'left',
                }} open={this.state.snackbar[2]} autoHideDuration={2000} onClose={() => this.stopSnackbar(1)}>
                    <SnackbarContent style={{ 'backgroundColor': 'green' }} message={
                        <span>
                            <CheckCircleIcon />
                            {this.props.appLanguage.appLanguage.snackbarsEvents.addSuccess}
                        </span>
                    }>
                    </SnackbarContent>
                </Snackbar>
                <Snackbar anchorOrigin={{
                    vertical: 'bottom', horizontal: 'left',
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
                    vertical: 'bottom', horizontal: 'left',
                }} open={this.state.snackbar[0]} autoHideDuration={2000} onClose={() => this.stopSnackbar(0)}>
                    <SnackbarContent style={{ 'backgroundColor': 'red', 'color': 'white' }} message={
                        <span>
                            <ErrorIcon />
                            {this.props.appLanguage.appLanguage.snackbarsEvents.error}
                        </span>
                    }>
                    </SnackbarContent>
                </Snackbar>
            </Modal>
        );
    }
}

export default CEvent;