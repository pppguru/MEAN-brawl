import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { validate, formValid } from '../plugins/validation.js';

//variables that will never change
const Profile = function(){
    	this.password = '';
    	this.email = '';
 	  }

class Login extends React.Component{

	constructor(props) {
    	super(props);
        this.profile = new Profile();
    	this.state = {
    		profile: this.profile,
            error: '',
            isFlipped: false,
            formState: true
    	};
    	this.handleChange = this.handleChange.bind(this);
    	this.handleLogin = this.handleLogin.bind(this);
        this.closeLogin = this.closeLogin.bind(this);
        this.handleResetPassword = this.handleResetPassword.bind(this);
        this.flipWindow = this.flipWindow.bind(this);
  	}

    resetProfile(){
        this.profile = new Profile();
        this.setState({profile: this.profile});
    }

    resetErrors(event){
        if(!event || !event.target)
            return;
        
        let form = $(event.target).closest('form');
        form.find('.help-text').hide();
        form.find('.field-error').removeClass('field-error');
    }

    handleChange(event) {
        //get target
        let target = event.target;
        //run form validation
        formValid(event);
        //set value
        this.profile[target.name] = target.value;
        //set state
        this.setState({profile: this.profile, error: ''});
    }

    flipWindow(event){
        this.setState({isFlipped: !this.state.isFlipped, formState: true});
        this.resetProfile();
        this.resetErrors(event);
        event.preventDefault();
    }

    closeLogin(event){
        $('body').removeClass('modal-showing');
        this.setState({isFlipped: false});
        this.resetProfile();
        this.resetErrors(event);
        $('.login-modal').css({visibility: 'hidden', opacity: 0});
    }

    handleClick(event){
        event.stopPropagation();
    }

    handleResetPassword(event){
        let new_profile = {
            email: this.state.profile.email
        }
        //restart profile
        $.post('/api/v1/reset_request',new_profile).then((data)=>{
            if(data.status === "error"){
                this.setState({error: data.message});
            }else{
                window.location.href = "/recover-password";
            }
            this.resetProfile();
            this.resetErrors();
        });
        event.preventDefault();
    }

	handleLogin(event){

        $.post('/api/v1/login', this.profile).then((data)=>{
            if(data.status === "error"){
                this.setState({error: data.message});
            }else{
                window.location.href = "/dashboard";
            }
            this.resetProfile();
            this.resetErrors();
        })
        //restart profile
		event.preventDefault();
	}

	render(){
		return(
                <div className="overlay">
                    <div className={this.state.isFlipped ? 'card effect__click flipped' : 'card effect__click'}>
                        <div className="card__front overlay">
                            <div className="content-block-small content-block" onClick={this.handleClick}>
                                <h3>Book Brawl Log In</h3>
                                <p className="quote">“We do not need magic to transform our world. We carry all of the power we need inside ourselves already." - J.K. Rowling</p>
                                {this.state.error &&
                                    <p className="error-message">{this.state.error}</p>
                                }
                                <form onSubmit={this.handleLogin}>
                                    <ul className="field-list field-list-small">
                                        <li>
                                            <div className="title">
                                                <label htmlFor="email"><span>*</span>Email Address</label>
                                                <span className="help-text">Please enter email address</span>
                                            </div>
                                            <input id="email" name="email" value={this.state.profile.email} onChange={this.handleChange} onBlur={validate} data-validation="required,email" type="text"/>
                                        </li>
                                        <li>
                                            <div className="title">
                                                <label htmlFor="passwprd"><span>*</span>Password</label>
                                                <span className="help-text">Please enter your password</span>
                                            </div>
                                            <input id="password" name="password" value={this.state.profile.password} onChange={this.handleChange} onBlur={validate} data-validation="required" type="password"/>
                                        </li>
                                    </ul>
                                    <div className="submit-row submit-row-small">
                                        <div className="buttons">
                                            <a className="button button-white" href="javascript:void(0)" onClick={this.closeLogin}>Close</a>
                                            <input className="button button-red" type="submit" value="Login" disabled={this.state.formState}/>
                                        </div>
                                        <div className="controls">
                                            <p>New user?  Please click <a href="/signup/" className="modal-trigger-password">here to sign up.</a></p>
                                            <p>Forgot your Password? <a className="modal-trigger-password" href="javascript:void(0)" onClick={this.flipWindow}>Reset it here.</a></p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="card__back overlay">
                            <div className="content-block-small content-block" id="reset">
                                <h3>Password Reset</h3>
                                <p className="instructions">Instructions here.</p>
                                {this.state.error &&
                                    <p className="error-message">{this.state.error}</p>
                                }
                                <form onSubmit={this.handleResetPassword}>
                                    <ul className="field-list field-list-small">
                                        <li>
                                            <div className="title">
                                                <label htmlFor="email"><span>*</span>Email Address</label>
                                                <span className="help-text">Please enter email address</span>
                                            </div>
                                            <input id="email" name="email" value={this.state.profile.email} onChange={this.handleChange} onBlur={validate} data-validation="required,email" type="text"/>
                                        </li>
                                    </ul>
                                    <div className="submit-row submit-row-small">
                                        <div className="buttons">
                                            <a className="button button-white" href="javascript:void(0)" onClick={this.closeLogin}>Close</a>
                                            <input className="button button-red" type="submit" value="Reset Password" disabled={this.state.formState}/>
                                        </div>
                                        <div className="controls">
                                            <p>Know your password? <a className="modal-trigger-password link" onClick={this.flipWindow} href="javascript:void(0)">Login Here</a>.</p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
		)
	}
}

if(document.getElementById('log-in'))
	ReactDOM.render(<Login />, document.getElementById('log-in'))
