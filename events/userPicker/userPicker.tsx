import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Switch from '@material-ui/core/Switch';
import Avatar from '@material-ui/core/Avatar';
import './userPicker.css'
import { Participant, getUsers } from './../server'
import { LanguageJson } from '../../../store/language/types';
import dummy from './../../../assets/images/profileclick3.png'

interface IProps {
	sessionUser: any;
	callBack: any,
	appLanguage: LanguageJson,
	pickedUsers: Participant[];
}

interface IStats {
	users: Participant[],
	picked: Participant[],
	checked: boolean[]
}

class UserPicker extends Component<IProps, IStats>  {

	constructor(props: any) {
		super(props)
		this.state = {
			users: [],
			checked: [],
			picked: this.props.pickedUsers
		}
		this.handleToggle = this.handleToggle.bind(this);
		this.returnData = this.returnData.bind(this);
		this.isChecked = this.isChecked.bind(this)
	}

	handleToggle(u: any, index: number) {
		let dummy = this.state.checked
		dummy[index] = !dummy[index];
		this.setState({ checked: dummy })
		this.returnData();
	}

	returnData() {
		let data = []
		for (let i = 0; i < this.state.users.length; i++)
			if (this.state.checked[i])
				data.push({ username: this.state.users[i].username })
		this.props.callBack(data);
	}

	componentDidMount() {
		getUsers(undefined).then(
			res => {
				this.setState({
					users: res.data.results
				}, () => {
					let isChecked = this.state.checked;
					for (let i = 0; i < this.state.users.length; i++) {
						if (this.props.sessionUser !== this.state.users[i].username) {
							isChecked.push(false);
						} else {
							let lol = [...this.state.users]
							lol.splice(i, 1);
							this.setState({ users: [...lol] })
						}
					}
					this.setState({ checked: isChecked })
				})
			}
		)

	}

	componentDidUpdate(prevProps: IProps, prevStats: IStats) {
		if (prevProps.pickedUsers !== this.props.pickedUsers) {
			if (this.props.pickedUsers !== null && this.props.pickedUsers !== []) {
				this.setState({ picked: this.props.pickedUsers })
			}
		}
		if (prevStats.picked !== this.state.picked && this.state.picked.length > 0) {
			let isChecked = this.state.checked
			for (let i = 0; i < this.state.picked.length; i++) {
				for (let j = 0; j < this.props.pickedUsers.length; j++) {
					if (this.state.picked[i].username === this.props.pickedUsers[j].username) {
						let tmp = this.state.picked
						tmp.splice(i, 1)
						this.setState({ picked: tmp })
						isChecked[i] = true;
					}
				}
			}
			this.setState({ checked: [...isChecked] })

		}
	}

	isChecked(index: number): boolean {
		return this.state.checked[index]
	}

	render() {
		return (
			<div className="picker-wrapper">
				<span>{this.props.appLanguage.appLanguage.usersToInvite}</span>
				<List dense className="list-wrapper">
					{this.state.users.map((u, index) => (
						<ListItem key={u.username} button>
							<ListItemAvatar>
								<Avatar
									src={u.img_path === undefined ? dummy : u.img_path}
								/>
							</ListItemAvatar>
							<ListItemText primary={u.username} />
							<ListItemSecondaryAction>
								<Switch
									edge="end"
									onChange={() => this.handleToggle(u, index)}
									checked={this.isChecked(index)}
								/>
							</ListItemSecondaryAction>
						</ListItem>
					))}
				</List>
			</div>
		);
	}
}

export default UserPicker;
