import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import UploadCover from '../../components/dashboard/UploadCover';
import Checkbox from '../../components/dashboard/Checkbox';
import SocialMedia from '../../components/dashboard/SocialMedia';
import {validate, formValid} from '../../plugins/validation';
import $ from 'jquery';

import tags from '../../../data/tags.json';
import genres from '../../../data/genres.json';
import warnings from '../../../data/warnings.json';

const types = ["Serial", "Published"];

class DashboardCreate extends Component {
	state = {
		bookId: bookId,
		user:{},
		coverFile: '',
		title: '',
		description: '',
		type: '',
		genres: [],
		tags: [],
		warnings: [],
		socialMedia: {
			amazon: 'http://',
			kobo: 'http://',
			smashword: 'http://',
			itunes: 'http://',
			barnesandnoble: 'http://',
			twitter: 'http://'
		}
	};

  componentDidMount = () => {
    $.get('/api/v1/user_session/')
      .then(resp => {
        if(resp.data._id){
				  this.setState({user: resp.data, type: "Serial", formDisabled: true});
        }else{
          window.location = "/"
        }
		});

    if(bookId){
      this.getBookInfo();
    }
  }

  getBookInfo = () => {
		if(bookId){
			$.get(`/api/v1/books/${bookId}`).then((book)=>{
        this.setState({
					user: book.data.author,
					coverFile: book.data.cover,
					title: book.data.title,
					description: book.data.description,
					type: book.data.type,
					genres: [book.data.genre],
					tags: book.data.tags,
					warnings: book.data.warnings,
					socialMedia: book.data.social_media || this.state.socialMedia
				})
			})
		}
  }

  _handleChange = e => {
    this.setState({[e.target.id]: e.target.value});
    formValid(e);
  }

  _handleCover = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = upload => {
      // const coverFile = upload.target.result;
      this.setState({coverFile: upload.target.result});
      //toggle submit
      //formValid(event);
    };
    //toggle submit
    formValid(e);
    reader.readAsDataURL(file);
  }

  _handleGenre = e => {
    let temp_genres = this.state.genres;

    if(e.target.checked){
      temp_genres.push(e.target.value);
    }else{
      temp_genres = temp_genres.filter(genre => genre !== e.target.value)
    }
    this.setState({genres: temp_genres});
    //toggle submit
    formValid(e);
  }

  cleanUrls = links => {
    for (var key in links) {
        // skip loop if the property is from prototype
        if (!links.hasOwnProperty(key)) continue;
        //clear out empty urls
        links[key] = links[key].replace('https://', '').replace('http://', '');
    }

    return links;
  }

  _handleTags = e => {
    const {tags} = this.state;
    const newTag = e.target.value;
    if (tags.indexOf(newTag) < 0) {
      const newAry = [...tags, newTag];
			this.setState({...this.state, tags: newAry });
    } else if (tags.indexOf(newTag) >= 0) {
      const newAry = tags.filter(tag => tag !== newTag);
      this.setState({ ...this.state, tags: newAry });
    }
    //toggle submit
    formValid(e);
  }

  _handleWarnings = e => {
    const {warnings} = this.state;
    const newWarning = e.target.value;
    if (warnings.indexOf(newWarning) < 0) {
      const newAry = [...warnings, newWarning];
      this.setState({ ...this.state, warnings: newAry});
    } else if (warnings.indexOf(newWarning) >= 0) {
      const newAry = warnings.filter(warning => warning !== newWarning);
      this.setState({ ...this.state, warnings: newAry});
    }
    //toggle submit
    formValid(e);
  }

  _handleType = e => {
    this.setState({type: e.target.value});
    //toggle submit
    formValid(e);
  }

  cleanUrls = (links) => {
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

  _handleSubmit = e => {
    e.preventDefault();
    const data = {
      title: this.state.title,
      description: this.state.description,
      genre: this.state.genres,
      tags: this.state.tags,
      warnings: this.state.warnings,
			cover: this.state.coverFile,
			type: this.state.type,
      social_media: this.cleanUrls(this.state.socialMedia)
    };
    if(!bookId){
			$.ajax({
				url: '/api/v1/books',
				method: 'POST',
				data: JSON.stringify(data),
				dataType: 'json',
				contentType: 'application/json; charset=UTF-8',
			}).then(res => {
        if (res.status === "error") {
          console.log(res.message);
        } else {
  				window.location.href = "/books/" + res.data._id;
        }
      });
    }else{
      $.ajax({url:`/api/v1/books/${bookId}`,
				method: 'PUT',
				data: JSON.stringify(data),
				dataType: 'json',
				contentType: 'application/json; charset=UTF-8',
       }).then((response)=>{
          window.location.href = "/books/" + bookId;
       })
    }
  }

  _onUrlChange = e => {
    let props = e.target.name.split('.');
    let social_links = this.state.socialMedia;


    if(props.length > 1){
      // add sub properties here
      let http = 'http://',
      urlMinusHttp = e.target.value.replace(http,"");

      if(props[0] === "social_media"){
        if(urlMinusHttp !== "http:/"){
          social_links[props[1]] = http + urlMinusHttp;
        }
      }
    }

    this.setState({
      socialMedia: social_links
    });

    //toggle submit
    formValid(e);
  }

  render() {
    const {coverFile, description, socialMedia, title, type, formDisabled} = this.state;
    const author = this.state.user.name;
    return (
      <div className="content-block content-block-standard account-block">
        <header>
          <h3>Create Your Book</h3>
        </header>
        <hr />
        <form onSubmit={this._handleSubmit}>
          <UploadCover title={title} author={author} handleChange={this._handleChange} coverAdd={this._handleCover} coverFile={coverFile} validate={validate}/>
          <Description description={description} handleChange={this._handleChange} validate={validate} />
          <BookType types={types} handleChange={this._handleType} validate={validate} currentType={type}/>
          <hr />
          <h4><span>Step 3.</span> How would you like users to find you?</h4>
          <Genres checked={this.state.genres} genres={genres} handleCheckbox={this._handleGenre} validate={validate}/>
          <Tags tags={tags} checked={this.state.tags} handleCheckbox={this._handleTags} validate={validate}/>
          <Warnings checked={this.state.warnings} warnings={warnings} handleCheckbox={this._handleWarnings} validate={validate}/>
          <hr />
          {type === "Published" ? <SocialMedia sources={socialMedia} onUrlChange={this._onUrlChange} /> : ""}
					<p>{this.state.bookId? '': 'Once you click Create, your book will be visible in your dashboard and will be added to the queue to be approved by an administrator. Please note that you will need to add your first chapter before your book will be approved.'}</p>
          <div className="submit-row submit-row-single">
            <div className="buttons">
              <a href={this.state.bookId ? '/books/' + bookId : '/dashboard/'} className="button button-white">Cancel</a>
              <input id="bookSubmit" type="submit" className="button button-red" disabled={formDisabled} value={this.state.bookId ? 'Update' : 'Create'}/>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export const Description = ({description, handleChange, validate}) => (
  <div>
    <h4><span>Step 2.</span> Tell us about your book</h4>
    <ul className="inner-fields">
      <li>
        <div className="title">
          <label htmlFor="description"><span>*</span>Description</label>
          <span className="help-text">Description must be between 30 and 250 characters</span>
        </div>
        <textarea
          id="description"
          rows="5"
          placeholder="Description must be between 30 and 250 characters"
          data-minlength="30"
          data-maxlength="250"
          data-validation="required,minlength,maxlength"
          onBlur={validate}
          onChange={handleChange}
          value={description}
        />
      </li>
    </ul>
  </div>
);

export const Genres = ({genres, handleCheckbox, checked, validate}) => (
  <ul className="inner-fields">
    <li>
      <div className="title">
          <label htmlFor="checkbox"><span>*</span>Select <strong>one</strong> genre for your book to be listed.</label>
          <span className="help-text">Please select one tag.</span>
      </div>
      <div className="new-create-books-row">
        { 
          genres.map((genre, index) => (
            <Checkbox name="genres" label={genre} key={index} handleCheckboxChange={handleCheckbox} validation="minChecks,maxChecks,required" validate={validate} minCheck={1} maxCheck={1} checked={checked.indexOf(genre) >= 0}/>
          ))
        }
      </div>
    </li>
  </ul>
);

export const Tags = ({tags, handleCheckbox, validate, checked}) => (
  <ul className="inner-fields">
    <li>
      <div className="title">
        <label htmlFor="checkbox1"><span>*</span>Select up to <strong>three</strong> tags that best describe your book.</label>
        <span className="help-text">Select up to 3 tags.</span>
      </div>
      <div className="new-create-books-row">
        {tags.map((tag, index) => (
          <Checkbox name="tags" checked={checked.indexOf(tag) >= 0} label={tag} key={index} handleCheckboxChange={handleCheckbox} validation="maxChecks,minChecks,required" validate={validate}  minCheck={1} maxCheck={3} />
        ))}
      </div>
    </li>
  </ul>
);

export const Warnings = ({warnings, handleCheckbox, validate, checked}) => (
  <div>
    <p>Content warning.</p>
    <div className="new-create-books-row">
      {warnings.map((warning, index) => (
        <Checkbox name="warnings" checked={checked.indexOf(warning) >= 0} label={warning} key={index} handleCheckboxChange={handleCheckbox} validation="maxChecks" minCheck={1} validate={validate} />
      ))}
    </div>
  </div>
);

export const BookType = ({types, handleChange, currentType}) => (
  <div>
    <div className="title">
      <label htmlFor="description"><span>*</span>What kind of book is it?</label>
      <span className="help-text">Pick Book Type</span>
    </div>
    <ul className="radio-list radio-list-inline">
      {types.map((type, index) => (
        <li key={index}>
          <input type="radio" name="avatar" id={"avatar-" + (index + 1)} checked={currentType === type} value={type} onChange={handleChange} />
          <label htmlFor={"avatar-"+ (index + 1)}>
            {type}
          </label>
        </li>
      ))}
    </ul>
  </div>
);


if(document.getElementById('dashboard-create'))
  {ReactDOM.render(<DashboardCreate />, document.getElementById('dashboard-create'));}
