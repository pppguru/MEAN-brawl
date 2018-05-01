import React from 'react';

export default class BookType extends React.Component{
	constructor(props) {
	    super(props);
	}
	render(){
		const {type} = this.props;
		let typeOfBook;

		if(type === "Serial") {
			typeOfBook = "S"
		}
		else if(type === "Published"){
			typeOfBook = "P"
		}

		return(
			<div className="type-of-book">
				{typeOfBook}
			</div>
		)
	}
}
