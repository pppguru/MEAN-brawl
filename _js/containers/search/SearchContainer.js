import React from 'react';
import ReactDOM from 'react-dom';
import StarRatingComponent from 'react-star-rating-component';

import $ from 'jQuery';

import RadioButton from '../../components/dashboard/RadioButton';
import SearchCheckbox from '../../components/search/SearchCheckbox';
import SearchCategory from '../../components/search/SearchCategory';

import {AdElement} from '../../components/ads/Ad';

import BookRow from '../../components/books/BooksRow';

const apiUrl = '/api/v1';

const oldCategories = ["Book", "Author"];
const oldTags = ["Contemporary", "Historical",
								"Drama", "ChickLit", "Tragedy",
								"Adventure", "Urban", "Epic",
								"Romance", "Spiritual", "Humor",
								"Paranormal", "Young Adult",
								"Middle Grade","Gaming","Thriller",
								"Mystery","Anime"];
const oldGenres = ["Fantasy","Science Fiction",
								"Horror","Xianxia","Mystery",
								"Romance","FanFiction","LitRPG"]

export default class SearchContainer extends React.Component {
		state = {
			user:'',
			search: "", //input field
			searchBy: "Book", // default search by
			rating: 0, //star rating
			tags: [], // all tags
			genres: [], // all genre
			results: null,
			savedSearches: [{
				link: "#",
				searchBy: "Book",
				search: "",
				genres: ["Xianxia"],
				tags: ["Spiritual", "Humor","Mystery"]
			},{
				link: "#",
				searchBy: "Author",
				search: "Elon Mitchell",
				genres: [],
				tags: []
			}] //saved searches
		};

	componentDidMount(){
		this.getUser();

		//Get the ads
		$.get('/api/v1/ads').then((ads)=>{
			ads.data.map((ad, key)=>{
				if(ad.page == 'search' && ad.ads){
					this.setState({ads:true})
				}
			});
		})
	}

	getUser=()=>{
		$.get(apiUrl+'/user_session').then((user)=>{
			if(user.data && user.data._id){
				$.get(apiUrl+'/users/'+user.data._id).then((user)=>{
					this.setState({user: user.data});
				})
			}
		})
	}

	getUrl = ()=>{
		var url = '/books/all?view=search';
		var search = '', tags = '', genres = '', rating = '';
		if(this.state.searchBy == 'Author'){
			url = '/authors/all?view=search';
			if(this.state.search)search = '&author='+this.state.search;
		}else{
			if(this.state.search)search = '&title='+this.state.search;
		}

		if(this.state.tags.length){
			tags = '&tags='+this.state.tags.join(',');
		}

		if(this.state.genres.length){
			genres = '&genres='+this.state.genres.join(',');
		}

		if(this.state.rating > 0){
			rating = '&rating=' + this.state.rating;
		}
		url = url + search + tags + genres + rating;
		return url;
	}

	saveSearch = e =>{
		e.preventDefault();
		var search = {
				link: this.getUrl(),
				searchBy: this.state.searchBy,
				search: this.state.search,
				genres: this.state.genres,
				tags: this.state.tags
			}

			var searches = this.state.user.searches;
			searches.push(search);

			$.ajax({
				method: 'PUT',
				url: '/api/v1/users/'+this.state.user._id,
				data: JSON.stringify({searches: searches}),
				dataType: 'json',
				contentType: 'application/json; charset=UTF-8',
			}).then(()=>{
				this.getUser();
			})
	}

	removeSearch = e => {
		e.preventDefault();
		var index = e.target.id;
		var searches = this.state.user.searches;
		searches.splice(index, 1);

		$.ajax({
			method: 'PUT',
			url: '/api/v1/users/'+this.state.user._id,
			data: JSON.stringify({searches: searches}),
			dataType: 'json',
			contentType: 'application/json; charset=UTF-8',
		}).then(()=>{
			this.getUser();
		})

	}

	handleChange = e => {
		const { tags, genres, searchBy } = this.state;
		if (e.target.name === "genres") {
			if(e.target.checked){
				genres.push(e.target.value)
			}else{
				genres.splice(genres.indexOf(e.target.value), 1);
			}
		}
		else if (e.target.name === "tags") {
			if(e.target.checked){
				tags.push(e.target.value)
			}else{
				tags.splice(tags.indexOf(e.target.value), 1);
			}
		}
		else if(e.target.name === "searchCategoryValue"){
				this.setState({search: e.target.value});
		}
		else if(e.target.name === "categories"){
				this.setState({searchBy: e.target.value, search: ""})
		}
	}

	handleRating = (nextValue) => {
		this.setState({ ...this.state, rating: nextValue });
	}

	handleSearch = e => {
		let change = {};
		change[e.target.name] = e.target.value;
		this.setState(change);
	}

	handleSubmit = e => {
		e.preventDefault();
		var limit = 8;
		var search = '', tags = '', genres = '', rating = '';
		var url = '/books/all?view=search';
		if(this.state.searchBy == 'Author'){
			url = '/authors/all?view=search';
			if(this.state.search)search = '&author='+this.state.search;
		}else{
			if(this.state.search)search = '&title='+this.state.search;
		}

		if(this.state.tags.length){
			tags = '&tags='+this.state.tags.join(',');
		}

		if(this.state.genres.length){
			genres = '&genres='+this.state.genres.join(',');
		}

		if(this.state.rating > 0){
			rating = '&rating=' + this.state.rating;
		}
		url = url + search + tags + genres + rating;

		window.location.href = url;
	}

	render() {
		const { rating, searchBy, savedSearches, search } = this.state;
		return (
			<div className="standard-section-with-sidebar">
				<div className="container">
					<div className="flex-row">
						<div className="content-block content-block-standard-search">
							<form onSubmit={this.handleSubmit}>
								<header>
									<h3>Advanced Search</h3>
								</header>
								<SearchCategories
									handleChange={this.handleChange}
									searchBy={searchBy}
									search={search}
								/>
								<SearchRating
									handleRating={this.handleRating}
									searchBy={searchBy}
									rating={rating}
								/>
								<SearchTags
									handleChange={this.handleChange}
									tags={oldTags} genres={oldGenres}
									searchBy={searchBy}
								/>
								<div className="submit-row submit-row-single" style={{ marginTop: '0px' }}>
									<div className="buttons">
										{this.state.user?<button type="button" className="button button-white" onClick={this.saveSearch}>Save</button>:''}
										<button type="submit" className="button button-red">Search</button>
									</div>
								</div>
								{this.state.user?<SavedSearches onDelete={this.removeSearch} savedSearches={this.state.user.searches} />:''}
								{this.state.results?(<BookRow title='Search Results' books={this.state.results}/>):''}
							</form>
						</div>
						<div style={(!this.state.ads) ? { 'display' : 'none' } : {}}>
							<AdElement page='search'/>
							<AdElement page='search'/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}


const SearchCategories = props => (
	<div id="search-categories">
		<h4>Search by Book or Author</h4>
		<div>
			<form style={{ display: 'flex', position: 'relative' }}>
				<input
					name="searchCategoryValue"
					onChange={props.handleChange}
					placeholder={"Type in favorite " + props.searchBy}
					ref={props.inputRef}
					value={props.search}
					type="text"
				/>
			</form>
		</div>
		<div className="new-create-books-row">
			{oldCategories.map((category, index) => (
				<RadioButton
					key={index}
					name="categories"
					label={category}
					selected={props.searchBy === category}
					handleChange={props.handleChange}
				/>
			))}
		</div>
		<hr />
	</div>
);

const SavedSearches = props => (
	<div>
		<hr/>
		<h4>Saved Searches</h4>
		{props.savedSearches.map((search, index) => (
		<div style={{ display: 'flex' }} key={index}>
			<h5 className="saved-search-remover" id={index} onClick={props.onDelete}>Remove</h5>
			<a className="search-link" href={search.link}>{"Search by " + search.searchBy.toLowerCase() + (search.search.length ? " for " + search.search + " " : " ") + (search.tags.length ? " and tags " + search.tags.join(', ').toLowerCase() : "") + (search.genres.length ? " and genres " + search.genres.join(', ').toLowerCase() : "")}</a>
		</div>
		))}
	</div>
);

const SearchRating = props => (
	<div>
		{props.searchBy === "Book" &&
			<div>
				<h4>Search by Review</h4>
				<div style={{ fontSize: 32 }}>
					<StarRatingComponent
						name="rating"
						emptyStarColor="#D9DCDD"
						value={props.rating}
						onStarClick={props.handleRating}
					/>
				</div>
				<hr style={{ marginTop: 0 }} />
			</div>
		}
	</div>
);

const SearchTags = props => (
	<div>
		{props.searchBy === "Book" &&
			<div>
				<h4>Search by Genres</h4>
				<ul className="toggle-list">
					{props.genres.map((genre, index) => (
						<SearchCheckbox name="genres" label={genre} val={index} key={index} handleCheckboxChange={props.handleChange} />
					))}
				</ul>
				<hr/>
				<h4>Search by Tags</h4>
				<ul className="toggle-list">
					{props.tags.map((tag, index) => (
						<SearchCheckbox key={index} name="tags" label={tag} val={index} key={index} handleCheckboxChange={props.handleChange} />
					))}
				</ul>
				<hr style={{ marginTop: 0 }} />
			</div>
		}
	</div>
);
