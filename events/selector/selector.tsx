import React, { Component } from 'react';
import alchool from './../../../assets/images/ItemPicker/alchool.jpg'
import bakery from './../../../assets/images/ItemPicker/bakery.jpg'
import dairy from './../../../assets/images/ItemPicker/dairy.jpg'
import fish from './../../../assets/images/ItemPicker/fish.jpg'
import juice from './../../../assets/images/ItemPicker/juice.jpg'
import meat from './../../../assets/images/ItemPicker/meat.jpg'
import plates from './../../../assets/images/ItemPicker/plates.jpg'
import veggies from './../../../assets/images/ItemPicker/veggies.jpg'
import napkins from './../../../assets/images/ItemPicker/napkins.jpg'
import cutlery from './../../../assets/images/ItemPicker/cutlery.png'
import games from './../../../assets/images/ItemPicker/games.jpg'
import pc from './../../../assets/images/ItemPicker/pc.png'
import './selector.css';
import { LanguageJson } from '../../../store/language/types';
import { Snackbar, SnackbarContent, Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { Button } from 'react-bootstrap';

interface Image {
  src: any,
  desc: string,
  title: string
}

interface IProps {
  appLanguage: LanguageJson,
  loggedIn: any,
  sessionUser: any,
  title: string,
  callBack: any,
  picked: any,
  loaded: boolean
}

interface IStats {
  chosen: Image[];
  available: Image[];
  title: string;
  showMe: boolean;
  snackbar: boolean,
  load: boolean
}

export class Selector extends Component<IProps, IStats>  {

  constructor(props: any) {
    super(props);
    this.getAll = this.getAll.bind(this);
    this.state = {
      title: props.title,
      chosen: [],
      available: this.getAll(),
      showMe: false,
      snackbar: true,
      load: props.loaded
    }
    this.onClickAvailable = this.onClickAvailable.bind(this);
    this.onClickChosen = this.onClickChosen.bind(this);
    this.swap = this.swap.bind(this);
    this.callback = this.callback.bind(this);
    this.stopSnackbar = this.stopSnackbar.bind(this);
  }

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.picked !== this.props.picked && this.state.load) {
      let tmpavailable = this.state.available
      let tmpchosen = this.state.chosen
      for (let i = 0; i < this.state.available.length; i++) {
        for (let j = 0; j < this.props.picked.items.length; j++) {
          if (this.state.available[i] !== undefined && this.state.available[i].title === this.props.picked.items[j].label) {
            let current = tmpavailable[i]
            tmpchosen.push(current)
            tmpavailable.splice(i, 1)
          }
        }
      }
      this.setState({
        available: tmpavailable,
        chosen: tmpchosen,
        load: false
      })
    }
  }

  private getAll(): Image[] {
    return [
      {
        src: alchool,
        desc: "Alcohoolic beverages",
        title: "Alchool"
      },
      {
        src: bakery,
        desc: "Bakery products",
        title: "Bread"
      },
      {
        src: dairy,
        desc: "Dairy products",
        title: "Milk"
      },
      {
        src: fish,
        desc: "Fishery products",
        title: "FISH"
      },
      {
        src: juice,
        desc: "Juices",
        title: "Juice"
      },
      {
        src: meat,
        desc: "Meat products",
        title: "Meats"
      },
      {
        src: plates,
        desc: "Plates",
        title: "Plates"
      },
      {
        src: napkins,
        desc: "Napkins",
        title: "Napkins"
      },
      {
        src: cutlery,
        desc: "Cutlery",
        title: "Cutlery"
      },
      {
        src: veggies,
        desc: "Vegetables",
        title: "Veggies"
      },
      {
        src: games,
        desc: "Videogames",
        title: "games"
      },
      {
        src: pc,
        desc: "Computers",
        title: "Pcs"
      }
    ]
  }

  onClickChosen(i: any, index: number) {
    this.swap(this.state.chosen, this.state.available, index, false)
    this.callback();
  }

  onClickAvailable(i: any, index: number) {
    this.swap(this.state.available, this.state.chosen, index, true)
    this.callback();
  }

  callback() {
    let data: any[];
    if(this.state.chosen.length !== 0) {
      data = [{amount: 1, label: this.state.chosen[0].title}]
      for (let i = 0; i < this.state.chosen.length; i++)
        data[i] = { amount: 1, label: this.state.chosen[i].title }
      this.props.callBack(data)
    }
  }

  private swap(remove: Image[], add: Image[], index: number, method: boolean) {
    var element = remove[index];
    remove.splice(index, 1);
    add.push(element);
    if (method) {
      this.setState({ 'available': remove, 'chosen': add })
    } else {
      this.setState({ 'chosen': remove, 'available': add })
    }
  }

  stopSnackbar() {
    this.setState({ snackbar: false })
  }

  render() {
    return (
      <div className="wrapper-global">
        <Button className="selector-title" onClick={() => this.setState({ showMe: !this.state.showMe })}>{this.state.title}</Button>
        {
          this.state.showMe ?
            <>
              <div className="selector-wrapper">
                <div className="title-wrapper">
                  <span>{this.props.appLanguage.appLanguage.selector.picked}</span>
                </div>
                <div className="div-wrapper">
                  {this.state.chosen.map((i, index) => (
                    <Tooltip title={i.desc} placement="bottom">
                      <img className="img-wrapper" src={i.src} onClick={(i) => this.onClickChosen(i, index)} alt = {"NOT HAPPENING"} />
                    </Tooltip>
                  ))}
                </div>
              </div>
              <div className="selector-wrapper">
                <div className="title-wrapper">
                  <span>{this.props.appLanguage.appLanguage.selector.available}</span>
                </div>
                <div className="div-wrapper">
                  {this.state.available.map((i, index) => (
                    <Tooltip title={i.desc} placement="bottom">
                      <img className="img-wrapper" src={i.src} onClick={(i) => this.onClickAvailable(i, index)}  alt = {"NOT HAPPENING"} />
                    </Tooltip>
                  ))}
                </div>
              </div>
              <Snackbar anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }} open={this.state.snackbar} autoHideDuration={2000} onClose={this.stopSnackbar}>
                <SnackbarContent style={{ 'backgroundColor': 'rgb(0, 128, 255)', 'color': 'white' }} message={
                  <span>
                    <InfoIcon />
                    {this.props.appLanguage.appLanguage.selector.info}
                  </span>
                }>
                </SnackbarContent>
              </Snackbar>
            </>
            : null
        }
      </div>
    );
  }
}

export default Selector;