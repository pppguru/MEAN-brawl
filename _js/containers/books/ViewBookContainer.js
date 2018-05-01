import React from 'react';

import Reader from '../../components/books/Reader';

const apiUrl = '/api/v1';

export default class ViewBookContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      content: '',
    }
  }

  componentDidMount() {
    this.loadChapterInfo();
  }

  componentDidUpdate(nextProps) {
    if (this.props.chapterId !== nextProps.chapterId) {
      this.loadChapterInfo();
    }
    return false;
  }

  loadChapterInfo = () => {
    const { bookId, chapterId } = this.props;
		if(chapterId){
			fetch(`${apiUrl}/books/${bookId}/chapters/${chapterId}`)
			.then(res => res.json())
			.then(res => {
				const nextState = {
					...this.state,
					name: res.data.name,
					content: res.data.content,
				};
				this.setState(nextState);
			});
		}
  }


  render() {
    return (
      <Reader name={this.state.name} content={this.state.content} />
    );
  }
}
