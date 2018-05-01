import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { validate, formValid } from '../plugins/validation.js';

//list all of the genre's so we can loop through them
const genres = ["Fantasy","Science Fiction",
                "Horror","Xianxia","Mystery",
                "Romance","FanFiction","LitRPG"];
//list all of the genre's so we can loop through them
const themes = ["Contemporary", "Historical",
                "Drama", "ChickLit", "Tragedy",
                "Adventure", "Urban", "Epic",
                "Romance", "Spiritual", "Humor",
                "Paranormal", "Young Adult",
                "Middle Grade","Gaming","Thriller",
                "Mystery","Anime"];

const Profile = function(){
  		  this.avatar = '';
      	this.name = '';
      	this.password = '';
      	this.email = '';
      	this.bday = '';
      	this.gender = 'Select One';
      	this.social_media = {
      		website: 'http://',
      		good_reads: 'http://',
      		amazon: 'http://',
      		wordpress: 'http://',
      		facebook: 'http://',
      		twitter: 'http://'
      	}
      	this.genres = [];
      	this.themes = [];
      	this.newsletter = true;
}

class SignUp extends React.Component{

	constructor(props) {
    	super(props);
      this.new_profile = new Profile();
      this.new_profile.id = profile_id;
    	this.state = {
    		profile: this.new_profile,
        me: this.new_profile,
        formState: true
    	};
    	this.handleChange = this.handleChange.bind(this);
    	this.handleSubmit = this.handleSubmit.bind(this);
  	}

    componentWillMount(){
        //get user session
        $.get('/api/v1/user_session/').then((response)=>{
            if(response.status !== "error"){
                this.setState({me: response.data});
                let id = this.new_profile.id !== "0" ? this.new_profile.id : response.data._id;
                this.loadInfo(id);
            }else{
                window.location.href = "/";
            }
        });
    }

    _objectEmpty(obj){
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    populateUrls(links){

      for (var key in links) {
          // skip loop if the property is from prototype
          if (!links.hasOwnProperty(key)) continue;
          //clear out empty urls
          if(links[key] === ""){
            links[key] = "http://"
          }
      }

      return links;

    }

    loadInfo(id){
        let self = this;
        $.get('/api/v1/users/' + id).then((response)=>{
            let date = new Date(response.data.bday);
            response.data.bday = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            response.data.social_media = this.populateUrls(response.data.social_media);
						this.selectAvatar(response.data.level, response.data.avatar)
            self.setState({
                profile: $.extend(this.state.profile,response.data)
            });
        });
    }

    signOut = () => {
      $.get('/api/v1/logout').then((response)=>{
        let isLoggedIn = response.status = "ok" ? false : true;
        if(!isLoggedIn){
          window.location.href = "/";
        }
      });
    }


    handleDelete = (event) => {
      let self = this;
			let check = confirm('Are you sure that you want to delete the account?');

			let isAdminRole = 0;
			if (this.state.me.role > 0)
				isAdminRole = 1;

      if(check){
        $.ajax({
            url: '/api/v1/users/' + this.state.profile._id + '?' + 'admin=' + isAdminRole,
            type: 'DELETE',
            success: function(response){
              if(response.status === "ok"){
                if(self.state.me.role < 1){
                  self.signOut();
                }else{
									alert('The user ' + self.state.profile.name + ' has been removed!');
                  window.location.href = "/dashboard/all-users/1";
                }
              }
            }
        });
      }
    };

  	handleChange(event) {
  		let target = event.target,
  		props = target.name.split('.'),
  		value = (target.value === "true") ? true : (target.value === "false") ? false : target.value;
      //run form validation
      formValid(event);
  		//if the property is nested, dig 1 level deeper
  		if(props.length > 1){
        // add sub properties here
        let http = 'http://',
				realValue = value.replace(http,"");
				
				let https = 'https://';
        realValue = realValue.replace(https,"");

        if(props[0] === "social_media"){
          if(realValue !== "http:/"){
            this.new_profile.social_media[props[1]] = http + realValue;
          }
        }
  		}
  		//if its a checkbox, add/delete values in an array
  		else if(target.type === "checkbox" && Array.isArray(this.new_profile[target.name])){
  			//get index of value
  			let index = this.new_profile[target.name].indexOf(value);
  			//if checked, add value
  			if(target.checked){
  				this.new_profile[target.name].push(value);
  			}
  			//if not checked, remove value
  			else{
  				this.new_profile[target.name].splice(index,1);
  			}
  		}
  		//if it isn't a checkbox or a sub property
  		else {
  			this.new_profile[target.name] = value;
  		}
  		//set the state
    	this.setState({profile: this.new_profile});
  	}

  cleanUrls(links){

    for (var key in links) {
        // skip loop if the property is from prototype
        if (!links.hasOwnProperty(key)) continue;
        //clear out empty urls
        if(links[key] === "http://"){
          links[key] = ""
        }
    }

    return links;

  }

	handleSubmit(event){
        var self = this;
        //update profile
        delete this.new_profile.password;
        delete this.new_profile.bday;
        this.new_profile.social_media = this.cleanUrls(this.new_profile.social_media);

        $.ajax({
            url: '/api/v1/users/' + this.state.profile._id,
            type: 'put',
            data: JSON.stringify(this.new_profile),
            dataType: 'json',
            contentType: 'application/json; charset=UTF-8',
            success: function(response){
              if(self.state.me.role > 0){
                 window.location.href = "/author/" + profile_id + '/edit';
              }else{
                 window.location.href = "/dashboard/edit";
              }
            }
        });
        this.setState({formState: null});
        event.preventDefault();
	}

	isChecked(array,value){
		let val = array.filter(function(item,index){
				return item === value;
		});
		return val.length ? true : false;
	}

	createCheckboxes(items,type){
		let self = this;
		return items.map(function(item,index){
			let id = type + '-' + item.replace(/\s+/g,'-').toLowerCase();
      return (
        <li key={id}>
          <input id={id} type="checkbox" name={type} value={item} onChange={self.handleChange} checked={self.isChecked(self.state.profile[type],item)} data-min="1" onBlur={validate} data-validation="minChecks,required" />
          <label htmlFor={id}>{item}</label>
        </li>
      )
		})
	}

	selectAvatar = (level, avatar)=>{
		var animal = this.avatarCheck(avatar);

		if(animal === 'dog'){
			var selected = this.levelAvatar(level).puppy;
		}else{
			var selected = this.levelAvatar(level).kitty;
		}

		var profile = this.state.profile;
		profile.avatar = selected;
		this.setState({profile: profile});
	}

	levelAvatar = (level)=>{
		var avatar = {kitty: '', puppy:''}
		if(!level || level == 0){
			avatar.kitty = '/assets/images/avatars/Cat_1.png';
			avatar.puppy = '/assets/images/avatars/Dog_1.png';
		}
		if (level >= 1) {
			avatar.kitty = '/assets/images/avatars/Cat_2.png';
			avatar.puppy = '/assets/images/avatars/Dog_2.png';
		}
		if (level >= 11) {
			avatar.kitty = '/assets/images/avatars/Cat_3.png';
			avatar.puppy = '/assets/images/avatars/Dog_3.png';
		}
		if (level >= 21) {
			avatar.kitty = '/assets/images/avatars/Cat_4.png';
			avatar.puppy = '/assets/images/avatars/Dog_4.png';
		}
		if (level >= 31) {
			avatar.kitty = '/assets/images/avatars/Cat_5.png';
			avatar.puppy = '/assets/images/avatars/Dog_5.png';
		}
		if (level >= 41) {
			avatar.kitty = '/assets/images/avatars/Cat_6.png';
			avatar.puppy = '/assets/images/avatars/Dog_6.png';
		}

		return avatar;
	}

	avatarCheck = (avatar)=>{
		if(avatar === '/assets/images/avatars/Cat_1.png' || avatar === '/assets/images/avatars/Cat_2.png' || avatar === '/assets/images/avatars/Cat_3.png' || avatar === '/assets/images/avatars/Cat_4.png' || avatar === '/assets/images/avatars/Cat_5.png' || avatar === '/assets/images/avatars/Cat_6.png' || avatar === '/assets/images/avatars/cat_1.png'){
			return 'cat';
		}else{
			return 'dog';
		}
	}

	render(){
    let profile = this.state.profile;

		var kitty = this.levelAvatar(profile.level).kitty;
		var puppy = this.levelAvatar(profile.level).puppy;

		return(
      <div>
      <header>
      {this.state.me.role < 1 &&
          <h3>Edit your Profile</h3>
      }
      {this.state.me.role > 0 &&
          <h3>Edit {profile.name}s Profile</h3>
      }
      </header>
			<form onSubmit={this.handleSubmit}>
				<h4>Tell us about yourself</h4>
				<p>Edit your photo:</p>
				<div className="avatar-selection">
					<figure className="avatar"><img src={this.state.profile.avatar} /></figure>
          <ul className="radio-list">
            <li>
              <input type="radio" name="avatar" id="avatar-1" value={puppy} onChange={this.handleChange} checked={this.avatarCheck(profile.avatar) === 'dog'}/>
              <label htmlFor="avatar-1">{profile.level_title? (<span>{profile.level_title}</span>) : <span>Apprentice</span>} Puppy</label>
            </li>
            <li>
              <input type="radio" name="avatar" id="avatar-2" value={kitty} onChange={this.handleChange} checked={this.avatarCheck(profile.avatar) === 'cat'}/>
              <label htmlFor="avatar-2">{profile.level_title? (<span>{profile.level_title}</span>) : <span>Apprentice</span>} Kitty</label>
            </li>
          </ul>
				</div>
				<ul className="field-list">
					<li>
						<div className="title">
              <label htmlFor="name"><span>*</span>Your Username:</label>
              <span className="help-text">Please enter your full name. It must be under 20 characters</span>
            </div>
						<input id="name" name="name" type="text" value={profile.name} onChange={this.handleChange} onBlur={validate} data-maxlength="20" data-validation="name,required,maxlength"/>
					</li>
					<li>
            <div className="title">
						  <label htmlFor="email">Your email:</label>
            </div>
						<input id="email" name="email" type="text" value={profile.email} disabled/>
					</li>
					<li>
						<div className="title">
              <label htmlFor="bday">Your birth date:</label>
            </div>
						<input id="bday" name="bday" type="text" value={profile.bday} disabled/>
					</li>
					<li>
            <div className="title">
						  <label htmlFor="gender"><span>*</span>Your gender:</label>
              <span className="help-text">Please select your gender</span>
            </div>
            <select id="gender" name="gender" type="text" value={profile.gender} onChange={this.handleChange} onBlur={validate} data-validation="required">
              <option value="">Select One</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
					</li>
				</ul>
				<hr/>
				<h4>Where else can we find you?</h4>
    				<ul className="field-list">
    					<li>
                <div className="title">
    						  <label htmlFor="website">Your website URL</label>
                  <span className="help-text">Invalid Url</span>
                </div>
    						<input id="website" name="social_media.website" value={profile.social_media.website} onChange={this.handleChange} onBlur={validate} data-validation="url" type="text"/>
    					</li>
    					<li>
                <div className="title">
    						  <label htmlFor="good_reads">Goodreads URL</label>
                  <span className="help-text">Invalid Url</span>
                </div>
    						<input id="good_reads" name="social_media.good_reads" value={profile.social_media.good_reads} onChange={this.handleChange} onBlur={validate} data-validation="url" type="text"/>
    					</li>
    					<li>
                <div className="title">
    						  <label htmlFor="amazon">Amazon URL</label>
                  <span className="help-text">Invalid Url</span>
                </div>
    						<input id="amazon" name="social_media.amazon" value={profile.social_media.amazon} onChange={this.handleChange} onBlur={validate} data-validation="url" type="text"/>
    					</li>
    					<li>
                <div className="title">
    						  <label htmlFor="wordpress">WordPress URL</label>
                  <span className="help-text">Invalid Url</span>
                </div>
    						<input id="wordpress" name="social_media.wordpress" value={profile.social_media.wordpress} onChange={this.handleChange} onBlur={validate} data-validation="url"  type="text"/>
    					</li>
    					<li>
                <div className="title">
    						  <label htmlFor="facebook">Facebook URL</label>
                  <span className="help-text">Invalid Url</span>
                </div>
    						<input id="facebook" name="social_media.facebook" value={profile.social_media.facebook} onChange={this.handleChange} onBlur={validate} data-validation="url" type="text"/>
    					</li>
    					<li>
                <div className="title">
    						  <label htmlFor="twitter">Twitter URL</label>
                  <span className="help-text">Invalid Url</span>
                </div>
    						<input id="twitter" name="social_media.twitter" value={profile.social_media.twitter} onChange={this.handleChange} onBlur={validate} data-validation="url" type="text"/>
    					</li>
    				</ul>
				<hr/>
				<h4>Account Settings</h4>
				<ul className="field-list account-settings">
					<a href={"/author/" + profile._id + "/reset-password"} className="button reset-password">Reset Password</a>
          <div onClick={this.handleDelete} className="button button-red reset-password">Delete Account</div>
				</ul>
				<hr/>
				<h4>Tell us what you like to see</h4>
				<ul className="toggle-list">
          <div className="title password">
            <label htmlFor="password2"><span>*</span>What Genres do you like? Add at least one.</label>
            <span className="help-text">Please add at least one genre</span>
          </div>
					{ this.createCheckboxes(genres, 'genres') }
					<li className="spacing-block"></li>
					<li className="spacing-block"></li>
				</ul>
				<ul className="toggle-list">
        <div className="title password">
          <label htmlFor="password2"><span>*</span>What type of Tags? Add at least one.</label>
          <span className="help-text">Please add at least one theme</span>
        </div>
					{ this.createCheckboxes(themes, 'themes') }
					<li className="spacing-block"></li>
					<li className="spacing-block"></li>
				</ul>
				<div className="submit-row">
					<div className="field">
						<input type="checkbox" name="newsletter" id="newsletter" value={!profile.newsletter} onChange={this.handleChange} checked={profile.newsletter}/>
						<label htmlFor="newsletter">I want to subscribe to newsletters</label>
					</div>
					<div className="buttons">
						<a className="button button-white" href=".">Close</a>
						<input className="button button-red" type="submit" value="Save Changes" disabled={this.state.formState}/>
					</div>
				</div>
			</form>
      </div>
		)
	}
}

if(document.getElementById('edit-page'))
	ReactDOM.render(<SignUp />, document.getElementById('edit-page'))
