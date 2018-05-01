import React from 'react';
import ReactDOM from 'react-dom';

import $ from 'jQuery';

import BookRow from '../../components/books/BooksRow';
import AuthorRow from '../../components/authors/AuthorRow';

import {AdElement} from '../../components/ads/Ad';

const apiUrl = '/api/v1';

class ViewAll extends React.Component{
	state = {
		title: '',
		user:'',
		authorPage: author || false,
		view: query.view || '',
		genres: query.genres || '',
		tags: query.tags || '',
		author: query.author || '',
		author_id: query.author_id || '',
		rating: query.rating || '',
		bookTitle: query.title || '',
		page: parseInt(query.page) || 1,
		books:[],
		authors: [],
		limit: 20,
		count: 0,
		status: query.status || '',
		library_id: query.library_id || '',
		showBrawl: false
	}

	componentDidMount(){
		this.getUser()
	}

	getUser = ()=>{
		$.get(apiUrl+'/user_session').then((user)=>{
			if(user.data._id){
				$.get(apiUrl+'/users/'+user.data._id+'?book_list=true').then((user)=>{
					this.setState({user: user.data});
					this.getSection();
				})
			}else{
				this.getSection();
			}
		});
	}

	getSection = (page)=>{
		if(this.state.authorPage){
			this.getAuthors(page);
		}else{
			this.getView(page);
		}
	}

	getView = (page)=>{
		switch (this.state.view) {
			case 'user-library': this.getUserLibrary(page);
				break;
			case 'user-books': this.getUserBooks(page);
				break;
				case 'search':
					if(this.state.author){
						this.getAuthors(page);
					}else if(this.state.author_id){
						console.log('here');
						this.getAuthorBooks(page);
					}else{
						this.getBooks(page)
					}
					break;
			default:
				if(this.state.author){
					this.getAuthors(page);
				}else if(this.state.author_id){
					this.getAuthorBooks(page);
				}else{
					this.getBooks(page)
				}
		}
	}

	getAuthors = (page) => {
		var page = page || this.state.page, author = '';

		if(this.state.author) author = '&author='+this.state.author;

		var query = apiUrl+'/users?status=1&limit='+this.state.limit+'&page='+page + author;

		var title = 'Viewing Authors';
		if(this.state.view == 'search') title = 'Search Results';
		if(this.state.view == 'following'){
			title = 'Followed Authors';
			var state = {title: title};
			if(this.state.user && this.state.user.following_authors){
				state.authors = this.state.user.following_authors;
				state.count = this.state.user.following_authors.length;
			}
			this.setState(state);
		}else{
			$.get(query).then((authors)=>{
				this.setState({authors: authors.data, count: authors.count, title: title});
			})
		}
	}

	enterBrawl = (e) => {
		$.ajax({
            url: '/api/v1/books/' + this.state.brawlBook._id,
            type: 'PUT',
            data: {brawl_submit: true}
        }).then((response)=>{
        	this.getUserBooks();
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

	getUserBooks = (page)=>{
		var page = page || this.state.page;
		var query = apiUrl+'/users/'+this.state.user._id+'/books?limit='+this.state.limit+'&page='+page;

		if(this.state.status){
			query = query + '&status='+this.state.status;
		}


		$.get(query).then((books)=>{
			this.setState({books: books.data, count: books.count, title: 'Viewing Your Books'});
		})
	}

	getAuthorBooks = (page)=>{
		var page = page || this.state.page;
		var query = apiUrl+'/users/'+this.state.author_id+'/books?limit='+this.state.limit+'&page='+page;

		if(this.state.status){
			query = query + '&status='+this.state.status;
		}
		$.get(apiUrl+'/users/'+this.state.author_id).then((author)=>{
			author = author.data;
			$.get(query).then((books)=>{
				this.setState({books: books.data, count: books.count, title: 'Books By '+author.name});
			})
		})
	}

	getUserLibrary = (page)=>{
		var query = apiUrl+'/books/library?limit='+this.state.limit;
		var page = page || this.state.page;

		if(this.state.status){
			query = query + '&status='+this.state.status;
		}

		if(this.state.library_id){
			query = query + '&library_id='+this.state.library_id;
			$.get(apiUrl+'/users/'+this.state.library_id).then((library)=>{
				library = library.data;
				$.get(query+'&page='+page).then((books)=>{
					this.setState({books: books.data, count: books.count, title: 'Viewing '+library.name+'\'s Library'});
				})
			})
		}else{
			$.get(query+'&page='+page).then((books)=>{
				this.setState({books: books.data, count: books.count, title: 'Viewing Your Library'});
			})
		}
	}

	getBooks = (page)=>{
		var query = apiUrl+'/books?limit='+this.state.limit, title = 'Viewing All Books';
		if(this.state.view == 'top'){ query = query + '&sort=-rating'; title = 'Viewing Top Rated' }
		if(this.state.view == 'recommended'){ query + '/recommended' + query; title = 'Viewing Recommended' }
		if(this.state.view == 'trending'){ query = query + '&trending=true'; title = 'Viewing Trending' }

		if(this.state.bookTitle){ query = query + '&title='+this.state.bookTitle }
		if(this.state.rating){ query = query + '&rating='+this.state.rating }
		if(this.state.author_id){ query = query + '&author_id='+this.state.author_id }
		if(this.state.tags){query = query + '&tags=' + this.state.tags}
		if(this.state.genres){ query = query + '&genres='+this.state.genres; title = title + ' : ' + this.state.genres }
		if(this.state.status){ query = query + '&status='+this.state.status;}

		if(this.state.view == 'search') title = 'Search Results';
		var page = page || this.state.page;
		console.log(query+'&page='+page);
		$.get(query+'&page='+page).then((books)=>{
			this.setState({books: books.data, count: books.count, title: title});
		})
	}

	prev = (e)=>{
		e.preventDefault();
		var page = this.state.page - 1;
		this.setState({page: page}, this.getSection(page));
		window.history.pushState('Browse', 'Browse', e.target.href);
	}

	next = (e)=>{
		e.preventDefault();
		var page = this.state.page + 1;
		this.setState({page: page}, this.getSection(page));
		window.history.pushState('Browse', 'Browse', e.target.href);
	}

	followBook = (e)=>{
		$.post(`${apiUrl}/books/${e.target.id}/follow`)
		.then(res => {
			this.getUser();
		})
	}

	unfollowBook = (e)=>{
		console.log('UNFOLLOW');
		$.ajax({
			url: `${apiUrl}/books/${e.target.id}/follow`,
			type: 'DELETE',
		}).then(res => {
			this.getUser();
		})
	}

	render(){
		var section = '/books/all?';
		if(this.state.authorPage){
			section = '/authors/all?';
		}
		var url = section, view = '', tags = '', genres = '', author='', paginate;
		if(this.state.view) view = 'view=' + this.state.view;
		if(this.state.tags) tags = '&tags=' + this.state.tags;
		if(this.state.genres) genres = '&genres=' + this.state.genres;
		if(this.state.author) author = '&author=' + this.state.author;
		url = url + view + tags + genres + author;

		if(Math.ceil(this.state.count/this.state.limit) > 1){
			paginate = (
				<div className="pages">
					{this.state.page > 1 &&
							<a href={url + '&page=' + (this.state.page - 1)} className="prev" onClick={this.prev}>Previous</a>
					}
					<span className="currentPage">Page {this.state.page}</span>
					<span>of</span>
					<span className="allPages">{Math.ceil(this.state.count/this.state.limit)}</span>
					{this.state.page < Math.ceil(this.state.count/this.state.limit) &&
							<a href={url+ '&page=' + (this.state.page + 1)} className="next" onClick={this.next}>Next</a>
					}
				</div>
			)
		}

		var bookRow;
		if(!this.state.authorPage && this.state.view == 'user-books'){
			bookRow = <BookRow userBooks='true' smallBooks='true' showBrawl={this.showBrawl} books={this.state.books} user={this.state.user} followBook={this.followBook} unfollowBook={this.unfollowBook}/>
		}else{
			bookRow = <BookRow smallBooks='true' books={this.state.books} user={this.state.user} followBook={this.followBook} unfollowBook={this.unfollowBook}/>
		}

		return(
			<div>
				<AdElement page='browse'/>
				<div className="content-block content-block-standard account-block">
				<div className={this.state.showBrawl ? "modal author-page show-modal" : "modal author-page"} onClick={(e) => {this.hideBrawl(e)}}>
					<div className="overlay overlay-create-brawl">
						<div className="content-block-small content-block">
							<h3>Are you ready to brawl?</h3>
							<p className="quote">By clicking "Yes," this book will be entered into the queue for the weekly brawl.  We only pit fictions of the same type (Serial/Published) and the same genre against each other.  We also try to select fictions with the same relative rating and popularity.  If you would like to withdraw your book from the queue after-the-fact, please email us at <a href="mailto:support@bookbrawl.com">support@bookbrawl.com</a>.</p>
							<div className="submit-row submit-row-small">
								<div className="buttons">
									<a className="button button-white close" onClick={(e) => {this.hideBrawl(e)}}>Close</a>
									<a className="button button-red close" onClick={(e) => {this.enterBrawl(e)}}>Yes</a>
								</div>
							</div>
						</div>
					</div>
				</div>
				<h3>{this.state.title}</h3>
				{this.state.authorPage || this.state.author?
					<AuthorRow authors={this.state.authors} user={this.state.user}/>
					:''
				}
				{bookRow}
				{paginate}
				{!this.state.books.length && !this.state.authors.length? <h4>No search results...</h4>:''}
				</div>
				<AdElement page='browse'/>
			</div>
		)
	}
}

if (document.getElementById('view_all')) {
  ReactDOM.render(
    <ViewAll />,
    document.getElementById('view_all'),
  );
}
