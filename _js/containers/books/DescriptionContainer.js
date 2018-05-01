import React from 'react';
import $ from 'jQuery';
import Description from '../../components/books/Description';

const apiUrl = `/api/v1`;

export default class DescriptionContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      description: ''
    };
  }

  componentDidMount() {
    this.loadDescription();
  }

  loadDescription = () => {
    $.get(`${apiUrl}/books/${this.props.bookId}`)
      .then(res => {
        const nextState = { ...this.state, description: res.data.description };
        this.setState(nextState);
      });
  }

  render() {
    return (
      <Description user={this.props.user} bookId={this.props.bookId} book={this.props.book} description={this.state.description} toggleStatus={this.props.toggleStatus} following={this.props.following} authorized={this.props.authorized} admin={this.props.admin} getBook={this.props.getBook} claim={this.props.claim}/>
    );
  }
}
