import React from 'react';
import $ from 'jQuery';

import StarRatingComponent from 'react-star-rating-component';
import Rating from '../dashboard/Rating';
import { validate, isValid } from '../../plugins/validation.js';

const apiUrl = '/api/v1';

export default class Reviews extends React.Component{
	state = {reviews:[], addReview: false, content: '', rating: 1, authorized: false, disabled: true}
	componentDidMount(){
		this.getReviews();
	}

	getReviews = ()=>{
		var bookId = this.props.bookId;
		$.get(`${apiUrl}/books/${bookId}/reviews`).then((reviews)=>{
			this.setState({reviews: reviews.data})
		}).catch((err)=>{
			console.log(err);
		})
	}

	addReview = ()=>{
		this.setState({addReview: true});
	}
	cancelReview = ()=>{
		this.setState({addReview: false});
	}

	submitReview = (e)=>{
		e.preventDefault();
		if(!this.state.disabled){
			var bookId = this.props.bookId;
			var postData = {content: this.state.content, rating: this.state.rating}
			$.post(`${apiUrl}/books/${bookId}/reviews`, postData).then((resp)=>{
				if(resp.status === "error"){
					alert(resp.message);
				}
				this.getReviews();
				this.props.getBook();
				this.setState({content:'', rating:0, addReview: false, disabled: true})
			}).catch((err)=>{
				console.log(err);
			})
		}
	}

	deleteReview = (e)=>{
		e.preventDefault();
		$.ajax({
			url: `${apiUrl}/reviews/${e.target.id}`,
			method: 'DELETE',
		}).then(()=>{
			this.getReviews();
			this.props.getBook();
		}).catch((err)=>{
			console.log(err);
		})
	}

	_onChange = (e)=>{
		var state = {};
		state[e.target.name]=e.target.value;
		validate(e);
		this.toggleSubmit(e)
		this.setState(state)
	}

	toggleSubmit = (e)=>{
		this.setState({disabled: !isValid('minlength',e.target)})
	}

	handleRating = (rating)=>{
		this.setState({rating: rating});
	}

	render(){
		var reviews;
		if(this.state.reviews.length){
			reviews = this.state.reviews.map((review, key)=>{
				if(review.status > 0){
					return(
						<li key={key} style={{marginBottom: '0.5rem'}}>
							<Rating stars={review.rating} />
							<p>
							By {review.author ?
									(<a className="author-name" href={"/author/" + review.author._id}>{review.author.name}</a>)
								: ""}
							</p>
							<p>
								{review.content}
							</p>
							{this.props.admin? <a style={{fontSize: '0.75em', textTramsform:'uppercase', color:'red'}} id={review._id} onClick={this.deleteReview}>Delete Review</a>:''}
						</li>
					)
				}
			})
		}

		return(
			<div id="reviews">
				<h4 style={{marginBottom: '0.25em', marginTop:'0.5rem'}}>Reviews</h4>
				<ul style={{paddingBottom: '2rem'}}>
					{reviews}
				</ul>
				{this.props.user && this.props.user._id?(<button className="add_review_btn" onClick={this.addReview}><h4 style={{margin:0}}>Create Review</h4></button>):(<button className="add_review_btn" onClick={this.props.signUp}><h4 style={{margin:0}}>Create Review</h4></button>)}
				{this.state.addReview?
				<div className="add_review">
					<div>
						<h4>Create Review</h4>
							<StarRatingComponent
				        name="rating"
				        emptyStarColor="#D9DCDD"
				        value={this.state.rating}
				        onStarClick={this.handleRating}
				      />
						<li className="review-area">
							<hr className="dividers"/>
							<div className="help-text">Reviews should be more than 30 characters</div>
							<textarea rows='4' name="content" id="text-box" onChange={(e) => {this._onChange(e); validate(e);}} onBlur={validate} data-minlength="30" data-validation="minlength" value={this.state.content}></textarea>
						</li>
						<div style={{float:'right'}}>
							<button className="button-white" onClick={this.cancelReview} style={{width:'auto', paddingRight: '2rem', paddingLeft:'2rem', marginRight: '1rem', marginTop: '1rem', display:'inline-block'}}>Cancel</button>
							<button className="button-red" onClick={this.submitReview} style={{width:'auto', paddingRight: '2rem', paddingLeft:'2rem', marginTop: '1rem', display:'inline-block'}} disabled={this.state.disabled}>Submit</button>
						</div>
					</div>
				</div>:''}
			</div>
		)
	}
}
