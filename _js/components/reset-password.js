import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { validate, formValid } from '../plugins/validation.js';

const Profile = function(){
    	this.password = '';
    	this.userId = '';
        this.role = 0;
        this.name = '';
 	}

class ResetPassword extends React.Component{

	constructor(props) {
    	super(props);
        this.new_profile = new Profile();
        this.new_profile.userId = id;
    	this.state = {
            pending: true,
            me: this.new_profile,
    		profile: this.new_profile
    	};
    	this.handleChange = this.handleChange.bind(this);
    	this.handleSubmit = this.handleSubmit.bind(this);
        this.loadProfile = this.loadProfile.bind(this);
        this.signOut = this.signOut.bind(this);
  	}

    componentWillMount(){
        //get user session
        $.get('/api/v1/user_session/').then((response)=>{
            if(response.status === 'error'){
                window.location.href = "/";
            }else{
                //set my profile so I can use it in our logic
                let myProfile = new Profile();
                myProfile.role = response.data.role;
                myProfile.userId = response.data._id;
                this.setState({me: myProfile})
                //are you the user or admin, if so load user's profile
                if (response.data.role > 0) {
                    this.loadProfile(this.state.profile.userId)
                }
                else {
                    this.new_profile.role = response.data.role;
                    this.new_profile.name = response.data.name;
                    this.setState({profile: this.new_profile});
                }
            }
        });
    }

  	handleChange(event) {
  		let target = event.target;
        //new profile
        if(target.name in this.new_profile) {
  		    this.new_profile[target.name] = target.value;
            this.setState({profile: this.new_profile});
        }
        //toggle submit button
        formValid(event);
  	}

    signOut(){
        let self = this;
        $.get('/api/v1/logout').then((response)=>{
            if(response.status !== "error") window.location.href = "/password-reset";
        });
    }

    loadProfile(id){
        let $this = this;
        $.get('/api/v1/users/' + id).then((response)=>{
            //in the meantime setup user data
            this.new_profile.role = response.data.role;
            this.new_profile.name = response.data.name;
            this.setState({
                profile: this.new_profile
            });
        });
    }

	handleSubmit(event){
        let $this = this;
        //update profile

        $.ajax({
            url: '/api/v1/reset_password',
            type: 'post',
            data: this.state.profile,
            dataType: 'json',
            success: function(response){
                if(response.status !== "error"){
                    if($this.state.me.role > 0 && $this.state.me.userId !== $this.state.profile.userId){
                        $this.setState({pending: false});
                    }else{
                        $this.signOut()
                    }
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                alert(errorThrown);

            }
        });

        event.preventDefault();
	}

	render(){
        let title = (this.state.me.role > 0) && (this.state.me.userId !== this.state.profile.userId)  ? "Reset " + this.state.profile.name + "'s password." : "Reset your Password";
		return(
            <div>
                {this.state.pending &&
                    <div>
                        <header>
                            <h3>{title}</h3>
                        </header>
            			<form onSubmit={this.handleSubmit}>
            				<h4>Enter your new password below</h4>
                            <span className="instructions">Password must be 8 to 10 characters and contain at least one uppercase letter, lowercase letter, number, and special character (etc. @$!%*?&).</span>
            				<ul className="field-list">
            					<li>
                                    <div className="title">
                                        <label htmlFor="password1"><span>*</span>New Password</label>
                                        <span className="help-text">Please enter your new password</span>
                                    </div>
                                    <input id="password1" name="password" type="password" value={this.state.profile.password} onChange={this.handleChange} onBlur={validate} data-maxlength="12" data-minlength="10" data-validation="password,required,maxlength,minLength" />
            					</li>
            					<li>
                                    <div className="title">
                                        <label htmlFor="password2"><span>*</span>Confirm Password</label>
                                        <span className="help-text">This password does not match</span>
                                    </div>
            						<input id="password2" type="password" onBlur={validate} data-password={this.state.profile.password} onChange={this.handleChange} data-validation="confirmPassword,required"/>
            					</li>
            				</ul>
            				<hr/>
                            <div className="submit-row">
                                <div className="field">
                                </div>
                                <div className="buttons">
                                    <a className="button button-white" href=".">Close</a>
                                    <input className="button button-red" type="submit" value="Reset Password" disabled/>
                                </div>
                            </div>
            			</form>
                    </div>
                }
                {!this.state.pending &&
                    <div>
                        <header>
                            <h3>{this.state.profile.name + "'s Password was Reset!"}</h3>
                        </header>
                        <div className="field">
                            <span>What would you like to do next?</span>
                        </div>
                        <hr/>
                        <div className="submit-row">
                            <div className="field"></div>
                            <div className="buttons">
                                <a className="button button-white" href=".">Close</a>
                                <a className="button button-red" href="/dashboard">Go to Dashboard</a>
                            </div>
                        </div>
                    </div>
                }
            </div>
		)
	}
}

if(document.getElementById('reset-password'))
	ReactDOM.render(<ResetPassword />, document.getElementById('reset-password'))
