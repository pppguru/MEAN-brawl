import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import BookType from './BookType.js';
import Library from './books/Library';

const Profile = function(){
		this.id = id;
		this.avatar = '';
    	this.name = '';
    	this.password = '';
    	this.email = '';
    	this.bday = '';
    	this.gender = '';
    	this.social_media = {
    		website: '',
    		good_reads: '',
    		amazon: '',
    		wordpress: '',
    		facebook: '',
    		twitter: ''
    	}
    	this.genres = [];
    	this.themes = [];
    	this.newsletter = true;
 	}


class Author extends React.Component{

	constructor(props) {
    	super(props);
    	this.user = new Profile();
    	this.state = {
    		id: id, //the user id
    		me: this.user, //my id
    		user: this.user, //whose looking at the profile
    		following: false,
    		authorsBooks: [],
    		followingBooks: [],
    		library: [],
    		showBrawl: false
    	};
    	this.handleFollow = this.handleFollow.bind(this);
    	this.isFollowing = this.isFollowing.bind(this);
  	}

  	getLibrary = () => {
        var query = '/api/v1/books/library/' + this.state.id + '?limit=8';
        $.get(query).then((books)=>{
            this.setState({library: books.data});
        })
    }


	followBook(book){
		$.post(`/api/v1/books/${book._id}/follow`)
		.then(res => {
			this.loadAuthorsBooks(this.state.user._id);
		})
	}

	unfollowBook = (book) => {
		$.ajax({
			url: `/api/v1/books/${book._id}/follow`,
			type: 'DELETE',
		}).then(res => {
			this.loadAuthorsBooks(this.state.user._id);
		})
    }

	handleFollow(){
		var data = {
			authorId: this.state.user._id
		};
		$.post('/api/v1/follow_author',data).then((response)=>{
			if(response.status === "error"){
				alert(response.message)
			}else {
				this.setState({
					following: true
				})
			}
		});
	}

	handleUnfollow = (event) => {
        var data = {
                authorId: this.state.user._id
        };
        $.post('/api/v1/unfollow_author',data).then((response)=>{
            if(response.status === "error"){
                alert(response.message)
            }else{
				this.setState({
					following: false
				})
            }
        });
    }

    loadMyInfo = (id) => {
    	//my ifo
		$.get('/api/v1/users/' + id).then((response)=>{
			//in the meantime setup user data
			this.setState({
				followingBooks: response.data.following_books
			});
		});
    }

	componentWillMount(){
		let self = this;
		$.get('/api/v1/user_session/').then((response)=>{
			if(!status.error){
				self.setState({me: response.data})
				self.loadUserInfo(response.data._id,this.state.id);
				self.loadMyInfo(response.data._id)
				self.loadAuthorsBooks(this.state.id)
			}else {
				window.location.href = "/";
			}
		});
	}

	enterBrawl = () => {
		$.ajax({
            url: '/api/v1/books/' + this.state.brawlBook._id,
            type: 'PUT',
            data: {brawl_submit: true}
        }).then((response)=>{
        	this.setState({showBrawl: false})
        	this.loadAuthorsBooks(this.state.id);
        });
	}

	hideBrawl = (e) => {
		if(e.target.classList.contains('overlay') || e.target.classList.contains('close')){
			this.setState({showBrawl: false})
		}
	}

	showBrawl = (book) => {
		if(!book.brawl_submit){
			this.setState({showBrawl: true, brawlBook: book})
		}
	}

	loadAuthorsBooks(userId){
		let self = this;
		$.get(`/api/v1/users/${userId}/books?limit=8`)
		.then(function(res){
		 	self.setState({
				authorsBooks: res.data
			})
		})
	}

	isFollowing(userId,followers){
		let myAccount = followers.filter(function(follower,index){
			return follower._id === userId;
		});
		return myAccount.length > 0;
	}

	loadUserInfo = (userId,profileId) => {
		let $this = this;
		//user info
		$.get('/api/v1/users/' + profileId).then((response)=>{
			//in the meantime setup user data
			this.setState({
				user: response.data,
				following: $this.isFollowing(userId,response.data.followers)
			});
		});
		this.getLibrary();
	}

	render(){
		let following = this.state.user.gender === "Male" ? "He isn't following any authors" : this.state.user.gender === "Other" ? "They haven't followed any authors" : "She isn't following any authors",
		self = this,
		authors = this.state.user.following_authors;

		if(authors){
			if(authors.length){
				let limit = authors.length > 5 ? 5 : authors.length;
				following = [];
				for (var i = 0; i < limit; i++) {
				  	if(authors[i]._id === this.state.me._id){
				  		following.push(<li key={i}><a href="/dashboard"><figure className="avatar"><img src={authors[i].avatar} alt=""/></figure><h5>Me</h5></a></li>);
					}else{
						following.push(<li key={i}><a href={'/author/' + authors[i]._id}><figure className="avatar"><img src={authors[i].avatar} alt=""/></figure><h5>{authors[i].name}</h5></a></li>);
					}
				}
			}
		}

		return(
			<div>
			<header>
				<h3>{this.state.user.name + " 's Account"} </h3>
			</header>
			<div className="title-row">
				<h4>Account Info</h4>
				{this.state.me.role > 0 &&
				<a className="control" href={'/author/' + this.state.user._id + '/edit'}>Edit</a>
				}
			</div>
			<div className="user-info">
				<div className="main">
					<div className={this.state.showBrawl ? "modal author-page show-modal" : "modal author-page"} onClick={(e) => {this.hideBrawl(e)}}>
						<div className="overlay overlay-create-brawl">
							<div className="content-block-small content-block">
								<h3>Are you ready to brawl?</h3>
								<p className="quote">By clicking "Yes," this book will be entered into the queue for the weekly brawl.  We only pit fictions of the same type (Serial/Published) and the same genre against each other.  We also try to select fictions with the same relative rating and popularity.  If you would like to withdraw your book from the queue after-the-fact, please email us at <a href="mailto:support@bookbrawl.com">support@bookbrawl.com</a>.</p>
								<div className="submit-row submit-row-small">
									<div className="buttons">
										<a className="button button-white close" onClick={(e) => {this.hideBrawl(e)}}>Close</a>
										<a className="button button-red" onClick={(e) => {this.enterBrawl()}}>Yes</a>
									</div>
								</div>
							</div>
						</div>
					</div>
					<figure className="avatar">
						<img src={this.state.user.avatar} alt="" />
					</figure>
					<div className="details">
						<h5>{this.state.user.name}</h5>
							{this.state.user.level_title?
								(<p className="level-title">{this.state.user.level_title} - Level {this.state.user.level}</p>):
								<p>Apprentice</p>
							}
						<div className="basic-profile">
							{this.state.user.social_media &&
								<div>
									{this.state.user.social_media.website &&
										<p>
											<a href={this.state.user.social_media.website} target="_blank">
												{this.state.user.social_media.website}
											</a>
										</p>
									}
									<ul className="social-links">
										{this.state.user.social_media.good_reads &&
											<li>
												<a href={this.state.user.social_media.good_reads} target="_blank">
													<img src="/assets/images/icons/social/goodreads.svg" alt="Goodreads" />
												</a>
											</li>
										}
										{this.state.user.social_media.amazon &&
											<li>
												<a href={this.state.user.social_media.amazon} target="_blank">
													<img src="/assets/images/icons/social/amazon.svg" alt="Amazon" />
												</a>
											</li>
										}
										{this.state.user.social_media.wordpress &&
											<li>
												<a href={this.state.user.social_media.wordpress} target="_blank">
													<img src="/assets/images/icons/social/wordpress.svg" alt="Wordpress" />
												</a>
											</li>
										}
										{this.state.user.social_media.facebook &&
											<li>
												<a href={this.state.user.social_media.facebook} target="_blank">
													<img src="/assets/images/icons/social/facebook.svg" alt="Facebook" />
												</a>
											</li>
										}
										{this.state.user.social_media.twitter &&
											<li>
												<a href={this.state.user.social_media.twitter} target="_blank">
													<img src="/assets/images/icons/social/twitter.svg" alt="Twitter" />
												</a>
											</li>
										}
									</ul>
								</div>
								}
								{this.state.me.role < 1 &&
								<div className="button-row">
									{this.state.following &&
										<a className="button button-small button-blue" href="javascript:void(0)" onClick={this.handleUnfollow}>Unfollow me</a>
									}
									{!this.state.following &&
										<a className="button button-small button-blue" href="javascript:void(0)" onClick={this.handleFollow}>Follow me</a>
									}
									<a className="button button-small button-white button-white-blue" href=".">Message Me</a>
								</div>
								}
							</div>
					</div>
				</div>
				{this.state.user.achievement &&
					<div className="progress-meter">
						<a href="." className="help-link">?</a>
						<figure>
							<figcaption>
								<h4>80%</h4>
							</figcaption>
							<div className="meter"></div>
						</figure>
					</div>
				}
			</div>
			<hr/>
				<div className="title-row">
					<h4>{this.state.user.name + "'s Favorite Authors"}</h4>
				</div>
				<ul className="user-list">
					{following}
				</ul>
			<hr/>
				<div className="title-row">
					{/*<a className="control" href=".">See All</a>*/}
				</div>
				{this.state.library.length ? (
						<Library books={this.state.library} author={this.state.user.name} title={this.state.user.name + "'s Library"} user={this.state.user} loadBooks={this.getLibrary} loadUserInfo={this.loadUserInfo} me={this.state.me} library="true" />
					) : (
						<div className="book-blocks book-blocks-small">
							<div class="title-row"><h4>{this.state.user.name + "'s"} Library</h4></div>
							{(this.state.user.gender === "Male" ? "He doesn't have any books in his library." : this.state.user.gender === "Other" ? "They don't have any books in their library." : "She doesn't have any books in her library.")}
						</div>
					)
				}
                {this.state.authorsBooks.length > 0 &&
                  <div>
                  	  <hr/>
	    			  <div className="title-row">
						<h4><span id="author-name">{this.state.user.name + "'s"}</span> Books</h4>
						<a className="control" href={"/books/all?author_id=" + this.state.user._id}>See All</a>
					  </div>
	                  <div className="book-blocks book-blocks-small">
		                  <ul>
		                  {
		                    this.state.authorsBooks.map(function(book, i){
		                      let isBrawler = book.brawl_submit;
		                      return (
		                        <li key={i}>
		                          <div className="content-block content-block-book">
		                           <BookType type={book.type}/>
		                            <figure>
		                              <div className="cover"
																		style={{
																			backgroundImage: book.cover ? "url("+book.cover+")": "url('/assets/images/default-cover-art.jpg')"}}>
		                                <div className="overlay">
		                                  <a className="button button-red" href={'/books/' + book._id}>Read</a>
		                                  {self.state.me.role > 0 &&
		                                  	<a className={"button button-red" + (!isBrawler ? " disabled" : "")} href="javascript:void(0)" onClick={(e) => {self.showBrawl(book)}}>Brawl</a>
		                                  }
		                                  {self.state.me.role === 0 && book.followers.includes(self.state.me._id) &&
		                                  	<a className="button button-red" href="javascript:void(0)" onClick={(e) => {self.unfollowBook(book)}}>Unfollow</a>
		                                  }
		                                  {self.state.me.role === 0 && !book.followers.includes(self.state.me._id) &&
		                                  	<a className="button button-red" href="javascript:void(0)" onClick={(e) => {self.followBook(book)}}>Follow</a>
		                                  }
		                                </div>
		                              </div>
		                              <figcaption>
		                                <h4>{book.title}</h4>
		                                <p>{book.author.name}</p>
		                                <ul className="rating-display">
		                                  <li className="filled"></li>
		                                  <li className="filled"></li>
		                                  <li className="filled"></li>
		                                  <li className="filled"></li>
		                                  <li className="filled"></li>
		                                </ul>
		                              </figcaption>
		                            </figure>
		                          </div>
		                        </li>
		                      )
		                    })
		                  }
		                  </ul>
	                  </div>
                  </div>
                }
			</div>
		)
	}
}

if(document.getElementById('author'))
	ReactDOM.render(<Author />, document.getElementById('author'))


class Book extends React.Component{

	constructor(props) {
    	super(props);
    	this.state = {
    		name: ''
    	};
  	}

  	_objectEmpty(obj){
	    for(var prop in obj) {
	        if(obj.hasOwnProperty(prop))
	            return false;
	    }

    	return JSON.stringify(obj) === JSON.stringify({});
	}

	componentWillMount(){
		let self = this;
		$.get('/api/v1/user_session/').then((response)=>{
			if(!self._objectEmpty(response.data)){
				self.loadUserInfo(this.state.id);
			}else {
				window.location.href = "/";
			}
		});
	}

	loadUserInfo(id){
		$.get('/api/v1/users/' + id).then((response)=>{
			if(response.data){
				this.setState({
					name: response.data.name + "'s"
				});
			}
		});
	}

	render(){
		return(
			<p>{this.state.name}</p>
		)
	}
}

if(document.getElementById('author-name'))
	ReactDOM.render(<Book />, document.getElementById('author-name'))
