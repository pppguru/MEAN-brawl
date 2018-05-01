import React from 'react';
import Rating from '../dashboard/Rating';
import BookType from '../BookType.js';

const Book = props => {
	let isMyLibrary = document.location.href.indexOf('all?view=user-library') >= 0;
	let book = props.book;
	let newChapter = '';
	if(props.user && isMyLibrary){
		if(book.last_viewed && book.last_viewed[props.user._id]){
			if(book.last_viewed[props.user._id] < book.updated_at){
				newChapter = <span className="new-chapter-badge" title='New Chapters' style={{display:'block', position:'absolute', top:'0.25rem', left:'0.25rem', backgroundColor: 'red', height: '1.25rem', width: '1.25rem', padding: '0.15rem 0', borderRadius: '1rem', color: 'white', lineHeight: '1em', textAlign: 'center', fontSize:'1em', cursor: 'pointer'}}>!</span>
			}
		}else{
			if(!book.last_viewed || !book.last_viewed[props.user._id]){
				newChapter = <span className="new-chapter-badge" title='New Chapters' style={{display:'block', position:'absolute', top:'0.25rem', left:'0.25rem', backgroundColor: 'red', height: '1.25rem', width: '1.25rem', padding: '0.15rem 0', borderRadius: '1rem', color: 'white', lineHeight: '1em', textAlign: 'center', fontSize:'1em', cursor: 'pointer'}}>!</span>
			}
		}
	}

	return 	<li>
					<div className="content-block content-block-book">
							<BookType type={props.book.type}/>
							<figure>
									<div className="cover" style={{backgroundImage: 'url('+props.book.cover+')'}}>
											<div className="overlay">
													<a className="button button-red" href={'/books/'+props.book._id}>Read</a>
													{props.user && !props.userBooks && props.user.following_books && props.user.following_books.indexOf(props.book._id) < 0?(
														<button className="button button-white" id={props.book._id} onClick={props.followBook}>Follow</button>
														):''}
													{props.user && !props.userBooks && props.user.following_books && props.user.following_books.indexOf(props.book._id) > -1?(
														<button className="button button-white" id={props.book._id} onClick={props.unfollowBook}>Unfollow</button>
														):''}
													{props.userBooks &&
														<button className="button button-red" onClick={()=>{props.showBrawl(props.book)}} disabled={props.book.brawl_submit ? props.book.brawl_submit : false}>Brawl</button>
													}

											</div>
									</div>
									<figcaption>
											<h4>{props.book.title}</h4>
											<p>By {props.book.author.name}</p>
											<Rating stars={props.book.rating? Math.floor(props.book.rating):0} />
									</figcaption>
									{newChapter}
							</figure>
					</div>
			</li>
}

export default Book;
