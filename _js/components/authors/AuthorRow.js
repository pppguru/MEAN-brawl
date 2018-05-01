import React from 'react';

export default class AuthorRow extends React.Component{
	render(){
		var button = "Unfollow";
		return(
			<ul className='user-list'>
				{this.props.authors.map((author, key)=>(
					<li key={key}>
						<a href={'/author/'+author._id}>
							<figure className="avatar">
								<img src={author.avatar} alt="" />
								</figure>
								<h5>{author.name}</h5>
						</a>
						{this.props.dashboard?<div className="control unfollow">
							{button}
						</div>:''}
					</li>
				))}
			</ul>
		)
	}
}
