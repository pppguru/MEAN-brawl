import React from 'react';
import $ from 'jQuery';
import Rating from '../dashboard/Rating';
import Brawlers from './Brawlers.js';

const apiUrl = '/api/v1';

export default class Brawl extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {
	      currentBrawl: [],
	      title: "Current Brawl"
	    };
	}

  	componentDidMount() {
    	this.getBrawls();
  	}

	vote = (e,brawlId,bookId) => {
		$.ajax({
			url: '/api/v1/brawls/'+brawlId,
			method: 'PUT',
			data: {vote: bookId}
		}).then((response)=>{
			this.getBrawls();
		})
		e.preventDefault();
		e.stopPropagation();
	}

	getBrawls = () => {
		$.get('/api/v1/brawls?limit=2').then((response)=>{
			this.setState({currentBrawl: response.data.reverse()});
		})
	}


	followBook = (e)=>{
		$.post(`${apiUrl}/books/${e.target.id}/follow`)
		.then(res => {
			this.getBrawls();
		})
		e.preventDefault();
		e.stopPropagation();
	}

	unfollowBook = (e)=>{
		$.ajax({
			url: `${apiUrl}/books/${e.target.id}/follow`,
			type: 'DELETE',
		}).then(res => {
			this.getBrawls();
		})
	}

	render() {
		const $this = this;
		let {currentBrawl, title} = this.state;
		const {me} = this.props;
		let brawlDeclared, isLatestBrawl;
		let currentResult = "Please Vote";
		let lastResult = "Please Vote";

		return (
			<section className="brawl-feature" id="home">
					<header>
						<div className="container">
							<div className="flex-row">
								<a href="#last-week" className={"week-control-last" + (currentBrawl.length < 2 ? " hide" : "")}>
									<div>
										<span className="label label-small">Previous</span>
										<span className="label label-large">Last Week’s Brawl</span>
									</div>
								</a>
								<h2>
									<span className="week-title week-title-this">{title}</span>
									<span className="week-title week-title-last">Last Week’s Brawl</span>
								</h2>
								<a href="#this-week" className="week-control-this">
									<span className="label label-small">Next</span>
									<span className="label label-large">This Week’s Brawl</span>
								</a>
								</div>
						</div>
					</header>
					<main>
						{currentBrawl.length ? (
							currentBrawl.map(function(brawl, i){

								let votedForA = $.inArray(me._id,brawl.book_a_vote) === 0;
								let votedForB = $.inArray(me._id,brawl.book_b_vote) === 0;
								let iVoted = votedForA || votedForB;
								let brawlDeclared = brawl.status > 1;
								let winner = brawl.book_a_vote.length > brawl.book_b_vote.length ? brawl.book_a : brawl.book_b;
								let latestBrawl = (currentBrawl.length - 1) === i;

								if(!latestBrawl){
									lastResult = winner.title + " won!"
								}else{
									currentResult = (iVoted && !brawlDeclared) ? "Keep checking for results" : brawlDeclared ? winner.title + " won!" : "Please Vote"
								}

								return (
									<div key={i} className={currentBrawl.length === 1 ? "week-this" : latestBrawl ? "week week-this" : "week week-last"}>
										<Brawlers isAdmin={false} showAvatar="true" brawl={brawl} vote={$this.vote} user={me} title={title} showResultsBy="percentage" onFollow={$this.followBook} unFollow={$this.unfollowBook}/>
									</div>
								)
							})

							) : (
								<div className="empty book">
										<div>The Very First Book Brawl will start soon!</div>
								</div>
							)
						}
					</main>
					<footer>
						<div className="container">
							<h4>
								<span className="week-results week-results-this">{currentResult}</span>
								<span className="week-results week-results-last is-announced">{lastResult}</span>
							</h4>
						</div>
					</footer>
			</section>
		)
	}
}
