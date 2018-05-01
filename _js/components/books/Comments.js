import React from 'react';
import $ from 'jQuery';
import { validate, isValid } from '../../plugins/validation.js';

export default class Comments extends React.Component{
	state={comment:'', open: false, commentClass: {position:'absolute', top:0, right:'-60%', bottom:0, zIndex:'100', width:'60%', boxShadow: '0 0.125em 0.3125em 0 rgba(0, 0, 0, 0.18)', padding:'1rem',transition: 'right 0.25s'}, comments:[], disabled: true}

	componentDidMount(){
		if(this.props.chapterId){
			this.getComments(this.props.chapterId)
		}
	}

	componentWillReceiveProps(nextProps){
		this.getComments(nextProps.chapterId)
	}

	_onChange = (e)=>{
		var state = {};
		state[e.target.name]=e.target.value;
		validate(e);
		this.toggleSubmit(e)
		this.setState(state);
	}

	toggleSubmit = (e)=>{
		this.setState({disabled: !isValid('required',e.target)})
	}

	toggleComments = ()=>{
		if(!this.state.open){
			this.setState({open: true, commentClass: {position:'absolute', top:0, right:0, bottom:0, zIndex:'100', width:'60%', boxShadow: '0 0.125em 0.3125em 0 rgba(0, 0, 0, 0.18)', padding:'1rem', transition: 'right 0.25s'}})
		}else{
			this.setState({open: false, commentClass: {position:'absolute', top:0, right:'-60%', bottom:0, zIndex:'100', width:'60%', boxShadow: '0 0.125em 0.3125em 0 rgba(0, 0, 0, 0.18)', padding:'1rem', transition: 'right 0.25s'}})
		}
	}

	getComments = (chapterId)=>{
		if(chapterId || this.props.chapterId){
			var chapter_id = chapterId || this.props.chapterId;
			$.get(`/api/v1/chapter/${chapter_id}/comments`)
			.then((resp)=>{
				var comments = resp.data;
				this.setState({comments: comments, comment:'', disabled: true});
			})
		}
	}

	handleSubmit = (e)=>{
		e.preventDefault();
		var postData = {
			book_id:this.props.bookId,
			content: this.state.comment
		};
		$.post(`/api/v1/chapter/${this.props.chapterId}/comments`, postData)
		.then((resp)=>{
			this.getComments();
		}).catch((err)=>{
			console.log(err);
		})
	}

	deleteComment = (commentId)=>{
		$.ajax({
				url: `/api/v1/comments/${commentId}`,
				type: 'DELETE',
		}).then((resp)=>{
			this.getComments();
		}).catch((err)=>{
			console.log(err);
		});
	}

	render(){

		var comments = this.state.comments.map((comment, key)=>{
			var canDelete;
			if(this.props.admin || comment.author._id === this.props.user._id){
				canDelete = true;
			}
			return(
				<li key={key} style={{padding:'0.5rem 0', borderBottom:'1px solid rgba(217, 220, 221, 0.5)', position:'relative'}}>
					{canDelete?<div className='comment_delete' style={{position:'absolute', bottom:0, right:0, textTransform: 'uppercase', fontSize:'0.5em', color:'red', cursor:'pointer'}} onClick={()=>this.deleteComment(comment._id)}>Delete Comment</div>:''}
					<div className="comment_image" style={{width:'25%', padding:'0.25rem', marginRight:'2%', display:'inline-block'}}><img src={comment.author.avatar}/></div>
					<div className="comment_text" style={{width:'68%', display:'inline-block', fontSize:'0.8125em', lineHeight:'1.25em'}}> {comment.content}
						<a className="comment_details" href={"/author/" + comment.author._id} style={{fontWeight:'bold'}}>{comment.author.name}</a>
					</div>
				</li>
			)
		})

		return(
			<div>
				<div style={{position:'absolute', top:'0.5rem', right:'1rem', zIndex:'1', cursor:'pointer'}} onClick={this.toggleComments}>
					<span className="comment-text" style={{fontSize:'0.8125em', float:'left', marginTop: '5px', lineHeight:'1em'}}>{this.state.comments.length?this.state.comments.length:''}</span>
					<img style={{width:'24px', float:'right'}} src='/assets/images/comment.png'/>
				</div>
				<div className="comments_block" style={this.state.commentClass}>
					<div className="comments_head" style={{ paddingBottom:'0.5rem', borderBottom: '1px solid rgba(217, 220, 221, 0.5)'}}>
						<h5 className="comments_count" style={{width:'50%', display:'inline-block'}}>{this.state.comments.length} Comments</h5>
						{/*<h4 className="comments_sort" style={{float:'right', fontSize:'0.8125em'}}>Sort ></h4>*/}
					</div>
					<ul className="comments_list" style={{height: 'calc(100% - 165px)', overflowY: 'scroll'}}>
						{comments}
					</ul>
					<div className="comments_add" style={{position:'absolute', bottom:0, left:0, right:0, padding:'0.5rem'}}>
						<textarea name="comment" onChange={(e) => {this._onChange(e); validate(e);}} onBlur={validate} data-validation="required" value={this.state.comment}></textarea>
						<button className='button-white' style={{display:'inline-block', marginTop:'0.5rem', marginRight:'0.5rem', width:'30%'}} onClick={this.toggleComments}>Close</button>
						<button onClick={this.handleSubmit} style={{display:'inline-block', marginTop:'0.5rem', width:'30%'}} disabled={!this.props.user._id || this.state.disabled}>Send</button>
					</div>
				</div>
			</div>
		)
	}
}
