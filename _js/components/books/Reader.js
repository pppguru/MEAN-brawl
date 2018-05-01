import React from 'react';
import Comments from './Comments';

export default class Reader extends React.Component{
	render(){
		return(
			<div>
					{this.props.content.length > 1 ? (
						<div>
							<Comments bookId={this.props.bookId} chapterId={this.props.chapterId} user={this.props.user} admin={this.props.admin} authorized={this.props.authorized}/>
							<div className="reader" dangerouslySetInnerHTML={{__html: this.props.content}}></div>
						</div>
					 ) : (
					 <div>
						 {this.props.authorized ? (
						 	<div>You haven't written anything yet</div>
						 ) : (
						 	<div>Nothing has been written yet</div>
						 )}
					 </div>
					)}
			</div>
		)
	}
}
