import React from 'react';
import $ from 'jQuery';
import Rating from '../dashboard/Rating';
import BookType from '../BookType.js';

export default class Brawlers extends React.Component {

	constructor(props) {
	    super(props);
	}

	chooseAvi = (imgUrl) => {
		let image;
		let imgAbbr = imgUrl.split("_")[0].toLowerCase();
		switch (imgAbbr) {
		    case "dog":
		        image = "/assets/images/dog.gif";
		        break;
		    case "cat":
		        image = "/assets/images/cat.gif";
		        break;
		    case "blank-cat.png":
		        image = "/assets/images/blank-cat.png";
		        break;
		    case "blank-dog.png":
		        image = "/assets/images/blank-dog.png";
		        break;
		}
		return image;
	}

	render(){
		const $this = this;
		const {showAvatar, brawl, vote, user, title, showResultsBy, showBrawlers, isAdmin, onFollow, unFollow} = this.props;

		//helps us to decide is we need to show results
		const brawlDeclared = brawl.status > 1;
		let votedForA, votedForB, totalVotes, hideVoteButton,
		iVoted, votePercentageA, votePercentageB, voteUnit, followingA,
		followingB,
		//TO DO: erase all of these values
		small_avatarA, small_avatarB, avatarA, avatarB;

		//only define these varaibles if brawl winner declared
		if(brawlDeclared || isAdmin){
			//total votes. used to calculate percentage
			totalVotes = brawl.book_a_vote.length + brawl.book_b_vote.length;
			//vote percentage
			if(showResultsBy === "percentage"){
				voteUnit = "of the votes";
				votePercentageA = (brawl.book_a_vote.length === 0 ? 0 : Math.round((brawl.book_a_vote.length / totalVotes) * 100)) + "%";
				votePercentageB = (brawl.book_b_vote.length === 0 ? 0 : Math.round((brawl.book_b_vote.length / totalVotes) * 100)) + "%";
			}
			else if(showResultsBy === "number"){
				voteUnit = "votes";
				votePercentageA = brawl.book_a_vote.length;
				votePercentageB = brawl.book_b_vote.length;
			}
		}

		//only define these variables if voting is defined
		if(vote){
			//Check to see if I voted for a or b
			votedForA = brawl.book_a_vote.includes(user._id);
			votedForB = brawl.book_b_vote.includes(user._id);;
			iVoted = votedForA || votedForB;
			//hide vote button only if I voted, brawl is declared, or a user isn't logged in
			hideVoteButton = brawlDeclared || iVoted || user === "";
		}

		//TO DO: need to have big avatar come from database
		if(showAvatar && brawl.book_a && brawl.book_b){
			small_avatarA = brawl.book_a.author.avatar.split("/").pop();
			small_avatarB = brawl.book_b.author.avatar.split("/").pop();

			avatarA = this.chooseAvi(small_avatarA);
			avatarB = this.chooseAvi(small_avatarB);
		}

		if((brawl.book_a.followers || brawl.book_b.followers) && user){
			followingA = brawl.book_a.followers.includes(user._id)
			followingB = brawl.book_b.followers.includes(user._id)
		}

		return (
				<div className="container">
					<div className="flex-row">
							<div className="book-blocks book-blocks-feature">
								<ul>
									<li>
										{showAvatar &&
											<div className={"mascot" + (votedForA ? " your-pick" : "")}>
												{(brawlDeclared || isAdmin) &&
													<div className="vote-count">
															<div>
																<strong>{votePercentageA}</strong>
																<span>{voteUnit}</span>
															</div>
													</div>
												}
												<img src="/assets/images/dog.gif" alt="" />
											</div>
										}
										{brawl.book_a &&
											<div className="book">
												<div className="content-block content-block-book">
													<BookType type={brawl.book_a.type}/>
													<figure>
														<div className="cover" style={{backgroundImage: "url("+brawl.book_a.cover+")"}}>
															{title !== "Create Brawl" ? (
																	<div className="overlay">
																		<a className="button button-red" href={"/books/" + brawl.book_a._id}>Read</a>
																		{!isAdmin && user !== "" && !followingA &&
																			<button id={brawl.book_a._id} className="button button-white" onClick={(e)=> {onFollow(e)}}>Follow</button>
																		}
																		{!isAdmin && user !== "" && followingA &&
																			<button id={brawl.book_a._id} className="button button-white" onClick={(e)=> {unFollow(e)}}>Unfollow</button>
																		}
																	</div>
																) : (
																	<div className="overlay">
																		<button className="button button-red" onClick={ (e) => {showBrawlers(brawl, e, 0)} }>Add Brawler</button>
																	</div>
																)
															}
														</div>
														<figcaption>
															<h4>{brawl.book_a.title}</h4>
															<p>By {brawl.book_a.author.name}</p>
															<Rating stars={brawl.book_a.rating} />
														</figcaption>
													</figure>
												</div>
												<a href="javascript:void(0)" className={"button" + (hideVoteButton || !vote ? " button-hidden" : "")} onClick={(e) => { vote(e, brawl._id, brawl.book_a._id)} }>Vote</a>
											</div>
										}
									</li>
									<li>
										{brawl.book_b &&
											<div className="book">
												<div className="content-block content-block-book">
													<BookType type={brawl.book_b.type}/>
													<figure>
														<div className="cover" style={{backgroundImage: "url("+brawl.book_b.cover+")"}}>
															{title !== "Create Brawl" ? (
																	<div className="overlay">
																		<a className="button button-red" href={"/books/" + brawl.book_b._id}>Read</a>
																		{!isAdmin && user !== "" && !followingB &&
																			<button id={brawl.book_b._id} className="button button-white" onClick={(e)=> {onFollow(e)}}>Follow</button>
																		}
																		{!isAdmin && user !== "" && followingB &&
																			<button id={brawl.book_b._id} className="button button-white" onClick={(e)=> {unFollow(e)}}>Unfollow</button>
																		}
																	</div>
																) : (
																	<div className="overlay">
																		<button className="button button-red" onClick={ (e) => {showBrawlers(brawl, e, 1)} }>Add Brawler</button>
																	</div>
																)
															}
														</div>
														<figcaption>
															<h4>{brawl.book_b.title}</h4>
															<p>By {brawl.book_b.author.name}</p>
															<Rating stars={brawl.book_b.rating} />
														</figcaption>
													</figure>
												</div>
												<a href="javascript:void(0)" className={"button" + (hideVoteButton || !vote ? " button-hidden" : "")} onClick={(e) => { vote(e, brawl._id, brawl.book_b._id)} }>Vote</a>
											</div>
										}
										{showAvatar &&
											<div className={"mascot" + (votedForB ? " your-pick" : "")}>
												<div className="vote-count has-won">
													{(brawlDeclared || isAdmin) &&
														<div>
															<strong>{votePercentageB}</strong>
															<span>{voteUnit}</span>
														</div>
													}
												</div>
												<img src="/assets/images/cat.gif" alt="" />
											</div>
										}
									</li>
								</ul>
							</div>
					</div>
				</div>
		)
	}
}
