import React from 'react';
import { render } from 'react-dom';
import $ from 'jQuery';
import {AdElement} from '../../components/ads/Ad';

import BookRow from '../../components/books/BooksRow';
import Brawl from '../../components/brawl/Brawl';

const apiUrl = '/api/v1';

import genres from '../../../data/genres.json';

const limit = 8;

class Home extends React.Component{
	state = {books:[], topBooks:[], trendingBooks:[], recommendedBooks:[], genre:'', user:'',brawls:[]}
	componentDidMount(){
		this.getUser();
		this.getAllBooks();
	}

	getUser = ()=>{
		$.get(`${apiUrl}/user_session`).then((user)=>{
			if(user.data._id){
				$.get(`${apiUrl}/users/${user.data._id}?book_list=true`).then((user)=>{
					console.log(user.data);
					this.setState({user:user.data});
				})
			}
		})
	}

	getAllBooks = (genre)=>{
		this.getBooks(genre);
		this.getRecommended(genre);
		this.getTopRated(genre);
		this.getTrending(genre);
	}

	getBooks = (genre)=>{
		var url = apiUrl + '/books?limit='+limit;
		if(genre) url = url + '&genre='+genre;
		$.get(url).then((books)=>{
			this.setState({books: books.data});
		}).catch(err=>{
			console.log(err);
		})
	}

	getRecommended = (genre)=>{
		var url = apiUrl + '/books/recommended?limit='+limit;
		if(genre) url = url + '&genre='+genre;
		$.get(url).then((books)=>{
			this.setState({recommendedBooks: books.data});
		}).catch(err=>{
			console.log(err);
		})
	}

	getTopRated = (genre)=>{
		var url = apiUrl + '/books?sort=-rating&limit='+limit;
		if(genre) url = url + '&genre='+genre;
		$.get(url).then((books)=>{
			this.setState({topBooks: books.data});
		}).catch(err=>{
			console.log(err);
		})
	}

	getTrending = (genre)=>{
		var url = apiUrl + '/books?trending=true&limit='+limit;
		if(genre) url = url + '&genre='+genre;
		$.get(url).then((books)=>{
			console.log(books);
			this.setState({trendingBooks: books.data});
		}).catch(err=>{
			console.log(err);
		})
	}

	changeGenre = (e)=>{
		this.setState({genre: e.target.value});
		this.getAllBooks(e.target.value);
	}

	followBook = (e)=>{
		var bookId = e.target.id;
		$.post(`/api/v1/books/${bookId}/follow`)
		.then(res => {
			this.getUser();
		})
	}

	unfollowBook = (e) => {
		var bookId = e.target.id;
		$.ajax({
			url: `/api/v1/books/${bookId}/follow`,
			type: 'DELETE',
		}).then(res => {
			this.getUser();
		})
  }

	render(){
		return(
			<div>
				<Brawl me={this.state.user}/>
				<section className="standard-section">
						<div className="container">
								<AdElement page='home'/>
								<div className="filter-controls">
										<div className="flex-row">
												<strong>View: </strong>
												<div className="minimal-select minimal-select-large">
														<select value={this.state.genre} onChange={this.changeGenre}>
																<option value="">All Genres</option>
																{genres.map((genre, key)=>(
																	<option key={key} value={genre}>{genre}</option>
																))}
															</select>
												</div>
										</div>
								</div>

						{this.state.genre?<BookRow title={this.state.genre} link={'/books/all?genres='+ this.state.genre} books={this.state.books} user={this.state.user} followBook={this.followBook} unfollowBook={this.unfollowBook}/>:''}

						{this.state.recommendedBooks && this.state.recommendedBooks.length?<BookRow title="Recommended" link='/books/all?view=recommended' books={this.state.recommendedBooks} user={this.state.user} followBook={this.followBook} unfollowBook={this.unfollowBook}/>:''}

						<BookRow title="Top Rated" link='/books/all?view=top' books={this.state.topBooks} user={this.state.user} followBook={this.followBook} unfollowBook={this.unfollowBook}/>
						<BookRow title="Trending" link='/books/all?view=trending' books={this.state.trendingBooks} user={this.state.user} followBook={this.followBook} unfollowBook={this.unfollowBook}/>

						<div className="content-block-spread">
							<AdElement page='home'/>
							<AdElement page='home'/>
						</div>
					</div>
				</section>
			</div>
		)
	}
}

if (document.getElementById('home')) {
  render(
    <Home />,
    document.getElementById('home'),
  );
}
