import React from 'react';
import Slider from 'react-slick';
import $ from 'jQuery';
import Rating from '../dashboard/Rating';

const apiUrl = '/api/v1';

function sanitizeLength(length) {
  if (length === 0) {
    return 'No Chapters';
  } else if (length === 1) {
    return `${length} Chapter`;
  } else if (length > 1) {
    return `${length} Chapters`;
  }
  return '';
}

export default class BookDetails extends React.Component {
	state = {following: this.props.following};

	componentWillReceiveProps(nextProps){
		this.setState({following: nextProps.following});
	}

	follow = ()=>{
		$.post(`${apiUrl}/books/${this.props.bookId}/follow`)
		.then(res => {
			this.setState({following: true})
		})
	}

	moveSlide = (slide,event) => {
		let slideOver;

		if(slide === "details"){
			slideOver = 0;
		}else if(slide === 'toc'){
			slideOver = 1;
		}else if(slide === 'chapter'){
			slideOver = (parseInt(event.target.value) * 2);
		}
		this.props.slider.slickGoTo(slideOver);
	}

	unfollow = ()=>{
		$.ajax({
			url: `${apiUrl}/books/${this.props.bookId}/follow`,
			type: 'DELETE',
		}).then(res => {
			this.setState({following: false})
		})
	}

	deleteBook = (e)=>{
		e.preventDefault();
		var check = confirm('Are you sure you want to delete this book?');

		if(check){
			$.ajax({
				url: `${apiUrl}/books/${this.props.bookId}`,
				type: 'DELETE',
			}).then(res => {
				window.location = "/dashboard";
			})
		}
	}

	render(){
		var followBtn, rating=0, visits = 0, chapters = [],
		self = this;
		if(!this.props.authorized){
			if(this.state.following){
				followBtn = <button onClick={this.unfollow} className="button-red" style={{width: 'auto', padding: '0.9375rem 2rem', margin: '1rem 0 0'}}>Unfollow</button>;
			}else{
				followBtn = <button onClick={this.follow}  style={{width: 'auto', padding: '0.9375rem 2rem', margin: '1rem 0 0'}}>Follow</button>;
			}
		}

		if(this.props.length) {
			for(var x = 0; x < this.props.length; x++){
				chapters.push(x)
			}
		}

		if(this.props.book && this.props.book.rating){
			rating = this.props.book.rating;
		}

		if(this.props.book){
			visits += this.props.book.viewed_by.length ? this.props.book.viewed_by.length : 0;
			visits += this.props.book.visits ? this.props.book.visits : 0;
		}

		return(
		  <div className="content-block content-block-standard-new">
		    <div className="title-row">
		      <h4>{this.props.book? this.props.book.type:''}</h4>
		      <span className="control">{sanitizeLength(this.props.length)}</span>
		    </div>
		    <div className="profile-info">
		      <img src="/assets/images/day-read.gif" className="day" alt="cat-avatar" style={{ float: 'right' }} height={175} width={175} />
		      <img src="/assets/images/night-read.gif" className="night" alt="cat-avatar" style={{ float: 'right' }} height={175} width={175} />
		      <h4 className="book-title">{this.props.title}</h4>
			  <span className="author-area">By <a className="author-name" href={"/author/" + (this.props.book ? this.props.book.author._id : "")}>{this.props.book ? this.props.book.author.name : ""}</a></span>
		      <Rating stars={rating} />
					<p><strong>{visits}</strong> Views | <strong>{this.props.book && this.props.book.followers.length ? this.props.book.followers.length : '0'}</strong> Followers</p>
		      <p><strong>Content Warnings</strong>: {this.props.book && this.props.book.warnings.length ? this.props.book.warnings.join(", ") : 'N/A'}</p>
		      <p><strong>Genre</strong>: {this.props.book && this.props.book.genre? this.props.book.genre : 'N/A'}</p>
		      <p><strong>Tags</strong>: {this.props.tags.length ? this.props.tags.join(", ") : 'N/A'}</p>
		    </div>
		    <button onClick={()=>{ this.props.toggleScreen(); setTimeout(()=>{this.props.toggleSettings()},0) }} className="button toggleScreen status" value="true">{this.props.toggleStatus}</button>
		    {this.props.authorized? (<a href={'/dashboard/edit/books/' + this.props.bookId} className="button toggleScreen">Edit Book</a>):''}
				{this.props.authorized? (<button onClick={this.deleteBook} className="button button-red delete-book toggleScreen">Delete Book</button>):''}
		    <div className="table-of-contents">
		    	<p className="buttons">
		    		<span onClick={(e) => this.moveSlide('details',e)}>Details</span> |
		    		<span onClick={(e) => this.moveSlide('toc',e)}> Table of Contents</span>
		    	</p>
		    </div>
		    {chapters.length > 0 &&
		    <div className="go-to-chapter">
		    	Go to:
				<select onChange={(e) => this.moveSlide('chapter',e)} className="slide-to-chapter">
					<option value="0">Select Chapter</option>
				{
				  chapters.map(function(chapter,i){
				  	return (
						<option key={i} value={i + 1}>Chapter {i + 1}</option>
				  	)
				  })
				}
				</select>
			</div>
			}
		  </div>
		);
	}
}
