import React from 'react';

import BookDetails from '../../components/books/BookDetails';

const apiUrl = '/api/v1';

export default class DetailsContainer extends React.Component {
		state = {
			type: '',
			length: 0,
			title: '',
			author: '',
			role: '',
			genre: '',
			tags: [],
			warnings: [],
		};

	render() {
		// const { length, rating, selectedChapter } = this.props;
		const { type, title, author, genre, tags, warnings } = this.state;
		let bookTitle = this.props.book ? this.props.book.title : '';
		let bookWarnings = this.props.book ? this.props.book.warnings : '';
		let bookTags = this.props.book ? this.props.book.tags : '';

		return (
			<BookDetails
				type={this.state.type}
				bookId={this.props.bookId}
				book={this.props.book}
        		length={this.props.length}
        		slider={this.props.slider}
        		title={bookTitle}
        		author={this.state.author}
        		rating={this.props.rating}
        		toggleSettings={this.props.toggleSettings}
				following={this.props.following}
				authorized={this.props.authorized}
				toggleScreen={this.props.toggleScreen}
				toggleStatus={this.props.toggleStatus}
				genre={genre}
				tags={bookTags}
				warnings={bookWarnings}
			/>
		);
	}
}
