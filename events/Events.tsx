import React, { Component } from 'react';
import EventList from './eventList/EventList';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { TextField, InputAdornment, IconButton, Tooltip } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import './Events.css';
import CEvent from './createEvent/createEvent';
import { RouteComponentProps } from 'react-router';
import { LanguageJson } from '../../store/language/types';
import { LightEvent, getEvents } from './server';
import ErrorIcon from '@material-ui/icons/Error';
import { SnackbarContent, Snackbar } from '@material-ui/core';
import EventSelector from './eventSelector/eventSelector';
import InfoIcon from '@material-ui/icons/Info';

interface IProps extends RouteComponentProps<any> {
  appLanguage: LanguageJson,
  loggedIn: any,
  sessionUser: any
}

interface IStats {
  openCreate: boolean,
  callbackCreate: any,
  popular: LightEvent[],
  recent: LightEvent[],
  mine: LightEvent[],
  search: string,
  events: LightEvent[]
  snackbar: boolean[],
  openSearch: boolean
}
//dataStorage.set(key, value);

export class Events extends Component<IProps, IStats> {

  constructor(props: any) {
    super(props);
    this.state = {
      popular: [],
      recent: [],
      mine: [],
      openCreate: false,
      callbackCreate: 'closed',
      search: '',
      events: [],
      snackbar: [false, false],
      openSearch: false
    }
    this.searchOnClick = this.searchOnClick.bind(this);
    this.registerHandler = this.registerHandler.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.callbackRegisterFunction = this.callbackRegisterFunction.bind(this);
    this.onChange = this.onChange.bind(this);
    this.stopSnackbar = this.stopSnackbar.bind(this);
    this.callbackSearchFunction = this.callbackSearchFunction.bind(this);
  }

  registerHandler() {
    this.state.openCreate ? this.setState({ openCreate: false }) : this.setState({ openCreate: true });
  }

  searchOnClick() {
    let eventTypes: string[] = this.props.appLanguage.appLanguage.createEvent.eventTypes
    let i = 0;
    for (; i < eventTypes.length; i++) {
      if (eventTypes[i].toUpperCase() === this.state.search.toUpperCase())
        break;
    }
    if (i === 10 && eventTypes[10] !== this.state.search)
      i++;
    if (i === 11) {
      let snack = this.state.snackbar
      snack[0] = true
      this.setState({ snackbar: snack })
    } else {
      getEvents(undefined, "type", undefined, i).then(
        res => {
          this.setState({events: res.data.results}, () => {
            console.log(this.state.events)
            if(this.state.events.length === 0) {
              let snack = this.state.snackbar
              snack[1] = true;
              this.setState({snackbar: snack})
            } else {
              this.state.openSearch ? this.setState({ openSearch: false }) : this.setState({ openSearch: true });
            }
          })
        }
      );
    }
  }

  onKeyPress(event: any) {
    if (event.key === "Enter") {
      this.searchOnClick();
    }
  }

  componentWillUnmount() {
    this.setState({
      openCreate: false,
      callbackCreate: 'closed'
    })
  }

  callbackRegisterFunction(childData: any) {
    this.setState({ callbackCreate: childData },
      () => {
        if (this.state.callbackCreate === 'closed') {
          this.setState({
            openCreate: false
          })
        }
      });
  }

  onChange(event: any) {
    this.setState({ search: event.target.value })
  }

  stopSnackbar(i: number) {
    let snack = this.state.snackbar
    snack[i] = false;
    this.setState({ snackbar: snack })
  }

  callbackSearchFunction() {
    this.setState({ openSearch: false })
  }

  render() {
    return (
      <div>
        <div className="task-wrapper">
          <div className="text-field-wrapper">
            <TextField label={this.props.appLanguage.appLanguage.events.search} className="text-field"
              onChange={(val) => this.onChange(val)} onKeyDown={(event) => this.onKeyPress(event)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={this.searchOnClick}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div className="tooltip-container">
            <Tooltip title={this.props.appLanguage.appLanguage.events.newEvent} placement="bottom" onClick={this.registerHandler}>
              <AddCircleOutlineIcon className="tooltip-centering" />
            </Tooltip>
          </div>
        </div>
        <EventList title={this.props.appLanguage.appLanguage.events.popular} content={"POP"} location={this.props.location} history={this.props.history} match={this.props.match} appLanguage={this.props.appLanguage} loggedIn={this.props.loggedIn} sessionUser={this.props.sessionUser} />
        <EventList title={this.props.appLanguage.appLanguage.events.recent} content={"DATE"} location={this.props.location} history={this.props.history} match={this.props.match} appLanguage={this.props.appLanguage} loggedIn={this.props.loggedIn} sessionUser={this.props.sessionUser} />
        <div className="last-list">
          <EventList title={this.props.appLanguage.appLanguage.events.mine} content={"MINE"} location={this.props.location} history={this.props.history} match={this.props.match} appLanguage={this.props.appLanguage} loggedIn={this.props.loggedIn} sessionUser={this.props.sessionUser} />
        </div>
        <CEvent opened={this.state.openCreate} callbackCreate={this.callbackRegisterFunction} appLanguage={this.props.appLanguage} loggedIn={this.props.loggedIn} sessionUser={this.props.sessionUser} />
        <EventSelector opened={this.state.openSearch} callbackSearch={this.callbackSearchFunction} events={this.state.events} location={this.props.location} history={this.props.history} match={this.props.match} appLanguage={this.props.appLanguage} loggedIn={this.props.loggedIn} sessionUser={this.props.sessionUser} />
        <Snackbar anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }} open={this.state.snackbar[0]} autoHideDuration={2000} onClose={() => this.stopSnackbar(0)}>
          <SnackbarContent style={{ 'backgroundColor': 'red', 'color': 'white' }} message={
            <span>
              <ErrorIcon />
              {this.props.appLanguage.appLanguage.events.error}
            </span>
          }>
          </SnackbarContent>
        </Snackbar>
        <Snackbar anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }} open={this.state.snackbar[1]} autoHideDuration={2000} onClose={() =>this.stopSnackbar(1)}>
                <SnackbarContent style={{ 'backgroundColor': 'rgb(0, 128, 255)', 'color': 'white' }} message={
                  <span>
                    <InfoIcon />
                    {this.props.appLanguage.appLanguage.selector.info}
                  </span>
                }>
                </SnackbarContent>
              </Snackbar>
      </div>
    )
  }
}

export default Events;