import React from 'react';
import $ from 'jQuery';
import Rating from '../dashboard/Rating';
import Brawlers from './Brawlers.js';
import BookType from '../BookType.js';
import moment from 'moment';

let currentResult = "";
let lastResult = "";
const genres = ["Fantasy","Science Fiction","Horror","Xianxia","Mystery","Romance","FanFiction","LitRPG"]

export default class BrawlAdmin extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {
	      currentBrawl: [],
	      oldBrawls: [],
	      brawlers: [],
	      title: "Current Brawl",
	      showBrawlers: false,
	      selectedBrawler: 0,
	      startBrawl: false,
	      brawlType: "Fantasy",
	      undeclaredBrawls: false
	    };
	}

  	componentDidMount() {
  		const {brawlType} = this.state;
    	this.getBrawls();
    	this.getBrawlers(brawlType);
  	}

	vote = (e,brawlId,bookId) => {
		$.ajax({
			url: '/api/v1/brawls/'+brawlId,
			method: 'PUT',
			data: {vote: bookId}
		}).then(()=>{
			this.getBrawls();
		})
		e.preventDefault();
		e.stopPropagation();
	}

	findBrawlByProp = (prop,value) => {
		return this.state.oldBrawls.filter(function(brawl,index){
			return brawl[prop] === value;
		})[0]
	}

	handleChange = (e) => {
		let newBrawl = {
		  	book_a: {
		        _id:"",
		        author:{
		           _id:"0",
		           name:"Brawler Name",
		           avatar:"/assets/images/blank-dog.png"
		        },
		        cover:"/assets/images/default-brawl-art.jpg",
		        title:"Some Book",
		        rating:0
			},
			book_a_vote: [],
		    book_b: {
		        _id:"",
		        author:{
		           _id:"1",
		           name:"Brawler Name",
		           avatar:"/assets/images/blank-cat.png"
		        },
		        cover:"/assets/images/default-brawl-art.jpg",
		        title:"Some Book",
		        rating:0
		    },
		    book_b_vote: [],
		    _id: "0"
		}
		let createBrawlSelected = e.target.value === "Create Brawl"
		let currentBrawl = createBrawlSelected ? newBrawl : this.findBrawlByProp('_id',e.target.value);
		let title = createBrawlSelected ? "Create Brawl" : (e.target.selectedIndex === 1) ? "Current Brawl" : moment(currentBrawl.updated_at).format('MM-DD-YYYY') + " Brawl";
		if(createBrawlSelected && this.state.undeclaredBrawls){
			alert('Please declare brawl, before you start a new one')
			return false;
		}
		this.setState({currentBrawl: currentBrawl, title: title, startBrawl: false, showBrawlers: false})
	}

	declareWinner = (currentBrawl) => {
		if(currentBrawl){
			var url = '/api/v1/brawls/'+currentBrawl._id;
			$.ajax({
				url: url,
				method: 'PUT',
				data: {status: 2}
			}).then((brawl)=>{
				this.getBrawls();
			});
		}
	}

	startBrawl = (isCreatePage) => {
		const {currentBrawl} = this.state;
		if(isCreatePage){
			var postData = {book_a: currentBrawl.book_a._id, book_b: currentBrawl.book_b._id};
			$.post('/api/v1/brawls', postData).then((brawl)=>{
				alert('Brawl Started!!!')
			 	this.getBrawls()
			});
		}
	}

	showBrawlers = (currentBrawl, e, index) => {
		if(currentBrawl){
			this.setState({showBrawlers: true, selectedBrawler: index})
		}
		e.preventDefault();
		e.stopPropagation();
	}

	changeType = (e) => {
		this.getBrawlers(e.target.value);
	   	this.setState({brawlType: e.target.value})
		e.preventDefault();
		e.stopPropagation();
	}

	pickBrawler = (brawl,book,e) => {
		const {oldBrawls, selectedBrawler, currentBrawl} = this.state;
		const brawlerID = ["a","b"] //two types of books

		//add new book to current book brawl
		currentBrawl['book_' + brawlerID[selectedBrawler]] = book;

		if(brawl){
			if(currentBrawl.book_a._id !== "" && currentBrawl.book_b._id !== ""){
				this.setState({currentBrawl: currentBrawl, showBrawlers: false, startBrawl: true});
			}else{
				this.setState({currentBrawl: currentBrawl, showBrawlers: false, startBrawl: false});
			}
		}
		e.preventDefault();
		e.stopPropagation();
	}

	filterBy = (array,prop,value) => {
		return array.filter(function(obj,index){
			return obj[prop] === value;
		})
	}

	getBrawlers = (brawlType) => {
		//brawlers=true&type=brawlType
		$.get('/api/v1/books?brawlers=true').then((brawlers)=>{
			let brawl_type = this.filterBy(brawlers.data, "genre", brawlType);
			this.setState({brawlers: brawl_type});
		})
	}

	getCurrentBrawls = () => {
		let currentBrawl = this.filterBy(this.state.oldBrawls, 'status', 1).length > 0;
		this.setState({undeclaredBrawls: currentBrawl});
	}

	getBrawls = () => {
		let newBrawl = {
		  	book_a: {
		        _id:"",
		        author:{
		           _id:"0",
		           name:"Brawler Name",
		           avatar:"/assets/images/blank-dog.png"
		        },
		        cover:"/assets/images/default-brawl-art.jpg",
		        title:"Some Book",
		        rating:0
			},
			book_a_vote: [],
		    book_b: {
		        _id:"",
		        author:{
		           _id:"1",
		           name:"Brawler Name",
		           avatar:"/assets/images/blank-cat.png"
		        },
		        cover:"/assets/images/default-brawl-art.jpg",
		        title:"Some Book",
		        rating:0
		    },
		    book_b_vote: [],
		    _id: "0"
		}
		$.get('/api/v1/brawls').then((brawls)=>{
			let currentBrawl = brawls.data.length ? brawls.data[0] : newBrawl;
			let title = brawls.data.length ? 'Current Brawl' : 'Create Brawl';
			this.setState({currentBrawl: currentBrawl, oldBrawls: brawls.data, title: title, startBrawl: false});
			this.getCurrentBrawls();
		})
	}

	render() {
		const $this = this;
		const {oldBrawls, title, brawlers, showBrawlers, startBrawl, selectedBrawler, currentBrawl, brawlType} = this.state;
		const isCurrentBrawl = currentBrawl.status < 2;
		const isDeclared = currentBrawl.status === 2;

		return (
			<section className="brawl-feature" id="admin">
				<header>
					<div className="container">
						<div className="flex-row">
							<h2>
								<span className="week-title week-title-this">{title}</span>
							</h2>
							<div className="week-control-this">
								<span>Select Brawl: </span>
								<select onChange={$this.handleChange} value={currentBrawl ? currentBrawl._id : "Create Brawl"} className="label label-large">
									<option value="Create Brawl">Create Brawl</option>;
									{
										oldBrawls.map(function(brawl, i){
											return (
												<option key={i} value={brawl._id}>{brawl.status === 1 ? "Current Brawl" : moment(brawl.updated_at).format('MM-DD-YYYY')}</option>
											)
										})
									}
								</select>
							</div>
						</div>
					</div>
				</header>
				<main>
					<div className="week week-this">
						{currentBrawl._id &&
							<Brawlers showAvatar={true} showResultsBy="number" brawl={currentBrawl} isAdmin={true} title={title} showBrawlers={this.showBrawlers}/>
						}
					</div>
				</main>
				<div className={"brawlers book-blocks book-blocks-small" + (showBrawlers ? " open" : "")}>
					<div className="dropdown">
					<select id="selection" value={brawlType} onChange={(e)=>{$this.changeType(e)}}>
						{
							genres.map((genre,index) => {
								return (
									<option key={index} value={genre}>{genre}</option>
								)
							})
						}
					</select>
					</div>
					{brawlers.length ? (
						<ul>
							{
								brawlers.map((book, i)=>{
									//Need to change
									return (
										<li key={i} className={((currentBrawl.book_a && book && currentBrawl.book_a._id === book._id) || (currentBrawl.book_b && book && currentBrawl.book_b._id === book._id)) ? "active" : ""}>
											<div className="content-block content-block-book">
												<BookType type={book.type}/>
												<figure>
													<div className="cover" style={{backgroundImage: 'url('+book.cover+')'}}>
														<div className="overlay">
															<a target="_blank" href={"/books/" + book._id} className="button button-white">Read</a>
															<a href="javascript:void(0)" onClick={(e) => {$this.pickBrawler(title === "Create Brawl",book,e)}} className="button button-white" id={book._id}>Brawl</a>
														</div>
													</div>
													<figcaption>
														<h4>{book.title}</h4>
														<p>{book.author.name}</p>
														<Rating stars={book.rating} />
													</figcaption>
												</figure>
											</div>
										</li>
									)
								})
							}
							<li className="book-spacing">
							</li>
						</ul>
						) : (
						<div className="no-brawlers">
							No {brawlType.toLowerCase()} books have signed up for Book Brawl
						</div>
						)
					}
				</div>
				<footer>
					<div className="container all-buttons">
						<a href="javascript:void(0)" onClick={() => {this.startBrawl(title === "Create Brawl")}} className={"button" + ((startBrawl && title === "Create Brawl") ? "" : " disabled")}>Start Brawl</a>
						<a href="javascript:void(0)" onClick={() => {this.declareWinner(currentBrawl)}} className={"button btn-positive" + ((!isDeclared && title !== "Create Brawl") ? "" : " disabled")}>Declare Winner</a>
					</div>
				</footer>
			</section>
		)
	}
}
