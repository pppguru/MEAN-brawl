import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import {Ads, AdElement} from '../components/ads/Ad';

//shared forumla's and variables

//profiles we're dealing with
const Users = [],
Me = {},
usersPerPage = 8,
currentPage = parseInt(location.href.split("/").pop());
let skip = (currentPage * usersPerPage) - usersPerPage;

class Friends extends React.Component{

	constructor(props) {
    	super(props);
        this.users = Users;
        this.me = Me;
    	this.state = {
            me: this.me,
    		users: this.users,
            allUsers: this.users,
            currentPage: currentPage,
            numOfPages: 1
    	};
  	}

    componentWillMount(){
        //get user session
        $.get('/api/v1/user_session/').then((response)=>{
            if(response.status === "error"){
                window.location.href = "/";
            }else {
                this.setState({me: response.data});
                this.getFriends(this.state.me._id);
            }
        });
    }

    paginate = (users, skip) => {
        let $this = this;
        return users.filter(function(user,index){
            //filter followers
            return index >= skip && index < (skip + usersPerPage)
        });
    }

    getFriends = (id) => {
        let self = this;
        $.get('/api/v1/users/' + id).then((response)=>{
            if(response.status === "error"){
                console.log(response.message);
            }else{
                let all_followers = response.data.following_authors;
                this.users = self.paginate(all_followers, skip);
                this.setState({
                    users: this.users,
                    allUsers: all_followers,
                    numOfPages: Math.ceil(all_followers.length / usersPerPage)
                });
            }
        });
    }

    unfollow = (userId,myId) => {
        let data = {
          authorId: userId,
        };
        $.post('/api/v1/unfollow_author', data).then(response => {
          if (response.status === "error") {
            console.log(response.message);
          } else {
            this.getFriends(myId);
          }
        });
    }

	render(){
        let self = this,
        currentPage = parseInt(this.state.currentPage);

        return(
            <div>
								{!this.state.users.length?<p>You are not currently following anyone.</p>:''}
                <ul className="user-list">
                    {this.state.users.map(function(user, i){
                    return (
                        <li key={user._id}>
                            <a href={'/author/' + user._id}>
                                <figure className="avatar">
                                    <img src={user.avatar} />
                                </figure>
                                <h5>{user.name}</h5>
                            </a>
                            <div>
                                <div className="control add-button" onClick={ () => self.unfollow(user._id, self.state.me._id) }>Unfollow</div>
                            </div>
                        </li>
                    )
                    })}
                </ul>
								{this.state.users.length?(<div className="pages">
                    {currentPage > 1 &&
                        <a href={"/dashboard/following/" + (currentPage - 1)} className="prev">Previous</a>
                    }
                    <span className="currentPage">Page {this.state.currentPage}</span>
                    <span>of</span>
                    <span className="allPages">{this.state.numOfPages}</span>
                    {currentPage < this.state.numOfPages &&
                        <a href={"/dashboard/following/" + (currentPage + 1)} className="next">Next</a>
                    }
                </div>):''}

            </div>
		)
	}
}

if(document.getElementById('friends'))
	ReactDOM.render(<Friends />, document.getElementById('friends'))



class AllUsers extends React.Component{

    constructor(props) {
        super(props);
        this.users = Users;
        this.me = Me;
        this.state = {
            me: this.me,
            users: this.users,
            allUsers: this.users,
            currentPage: currentPage,
            numOfPages: 1
        };
    }

    componentWillMount(){
        //get user session
        $.get('/api/v1/user_session/').then((response)=>{
            if(response.status === "error"){
                window.location.href = "/";
            }else{
                this.setState({me: response.data});
                if(this.state.me.role > 0){
                	this.getUsers(this.state.me._id);
                }
            }
        });
    }

    paginate = (users, skip) => {
        let $this = this;
        return users.filter(function(user,index){
            //filter followers
            return index >= skip && index < (skip + usersPerPage)
        });
    }

    filterOutAdmins = (users) => {
        return users.filter(function(user,index){
            return user.role === 0;
        })
    }

    getUsers = (id) => {
        let self = this;
        $.get('/api/v1/users').then((response)=>{
            if(response.status === "error"){
                console.log(response.message);
            }else{
                let users = this.filterOutAdmins(response.data);
                this.setState({
                    users: self.paginate(users,skip),
                    allUsers: users,
                    numOfPages: Math.ceil(users.length / usersPerPage)
                });
            }
        });
    }

    render(){
        let self = this,
        currentPage = parseInt(this.state.currentPage);

        return(
            <div>
                <ul className="user-list">
                    {this.state.users.map(function(user, i){
                    return (
                        <li key={user._id}>
                            <a href={'/author/' + user._id}>
                                <figure className="avatar">
                                    <img src={user.avatar} />
                                </figure>
                                <h5>{user.name}</h5>
                            </a>
                            <div>
                                <a className="control add-button" href={'/author/' + user._id + '/edit'}>Edit</a>
                            </div>
                        </li>
                    )
                    })}
                </ul>
                <div className="pages">
                    {currentPage > 1 &&
                        <a href={"/dashboard/all-users/" + (currentPage - 1)} className="prev">Previous</a>
                    }
                    <span className="currentPage">Page {this.state.currentPage}</span>
                    <span>of</span>
                    <span className="allPages">{this.state.numOfPages}</span>
                    {currentPage < this.state.numOfPages &&
                        <a href={"/dashboard/all-users/" + (currentPage + 1)} className="next">Next</a>
                    }
                </div>
            </div>
        )
    }
}

if(document.getElementById('all-users'))
    ReactDOM.render(<AllUsers />, document.getElementById('all-users'))


class AdsSpace extends React.Component {

    constructor(props) {
        super(props);
		this.state = {
			ads: false
		};
    }

    componentDidMount() {
        document.getElementById('ads-div-container').style.display = 'none'
		//Get the ads
		$.get('/api/v1/ads').then((ads)=>{
			ads.data.map((ad, key)=>{
				if(ad.page == 'dashboard' && ad.ads){
                    this.setState({ads:true});
                    document.getElementById('ads-div-container').style.display = 'block'
				}
			});
		})
    }
    
    render() {
        return <div style={(!this.state.ads) ? { 'display' : 'none' } : {}}>
                    <AdElement page='dashboard'/>
                    <AdElement page='dashboard'/>
                </div>
    }
}

if(document.getElementById('ads-div-container'))
    ReactDOM.render(<AdsSpace />, document.getElementById('ads-div-container'))