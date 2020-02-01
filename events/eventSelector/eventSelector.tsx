import React, { Component } from 'react';
import { LanguageJson } from '../../../store/language/types';
import { RouteComponentProps } from 'react-router';
import { LightEvent } from '../server';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import './eventSelector.css'
import dummy from './../../../assets/dummyObjects/pictures/dummy.jpg'
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';

interface IProps extends RouteComponentProps<any> {
  appLanguage: LanguageJson,
  loggedIn: any,
  sessionUser: any,
  events: LightEvent[],
  opened: boolean,
  callbackSearch: any
}

interface IStats {
  open: boolean
}

class EventSelector extends Component<IProps, IStats>  {

  constructor(props: any) {
    super(props);
    this.state = {
      open: false
    }
    this.onClick = this.onClick.bind(this);
    this.closeCreateHandler = this.closeCreateHandler.bind(this);
  }

  componentDidUpdate(prevProps: IProps, prevStats: IStats) {
    if(prevProps.opened !== this.props.opened && this.props.opened) {
      this.setState({open: this.props.opened})
    }
  }

  closeCreateHandler() {
    this.setState({ open: false });
    this.props.callbackSearch('closed');
}

  onClick(e: any) {
    this.props.history.push('/events/viewandedit/' + e.id)
  }

  render() {
    return (
      <div>
        <Modal show={this.state.open}>
          <Modal.Header>
            <Modal.Title>{this.props.appLanguage.appLanguage.eventSelector.select}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <List dense className="list-wrapper">
              {this.props.events.map((e) => (
                <ListItem key={e.title} button>
                  <ListItemAvatar>
                    <Avatar
                      src={(e.img_path === null || e.img_path === undefined) ? dummy : e.img_path}
                    />
                  </ListItemAvatar>
                  <ListItemText primary={e.title} />
                  <ListItemSecondaryAction>
                    <Button onClick={() => this.onClick(e)} >{this.props.appLanguage.appLanguage.eventSelector.open}</Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Modal.Body>
          <Modal.Footer style={{ 'marginTop': '1vh', 'border': 'none' }}>
                    <Button variant="primary" onClick={this.closeCreateHandler}>{this.props.appLanguage.appLanguage.createEvent.close}</Button>
                </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default EventSelector;
