import React from 'react';
import $ from 'jQuery';
import TableOfContents from '../../components/books/TableOfContents';

const apiUrl = `/api/v1`;

export default class TocContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      chapters: [],
      buttonVisible: true,
    };
  }

  componentDidMount() {
    this.loadBookInfo();
  }

  handleChange = e => {
    const nextState = { ...this.state, [e.target.name]: e.target.value };
    this.setState(nextState);
  }

  handleSubmit = e => {
    e.preventDefault();
    if (this.state.newChapterName) {
    $.post(`${apiUrl}/books/${this.props.bookId}/chapters`,{
      name: this.state.newChapterName,
      number: this.props.chapters.length + 1,
      content: ' ',
    })
    .then((data) => {
      this.props.loadChapters()
      this.toggleVisibility();
      setTimeout(() => {
        this.props.selectChapter(this.props.chapters.length + 1)
      },500)
    })
    .catch(err => console.log(err));
    } else {
      //console.log('NO ACTION');
    }
 }

  loadBookInfo = () => {
    $.get(`${apiUrl}/books/${bookId}`)
      .then(res => {
        const nextState = { ...this.state, title: res.data.title };
        this.setState(nextState);
      });
  }

  toggleVisibility = e => {
    const nextState = { ...this.state, buttonVisible: !this.state.buttonVisible, newChapterName: '' };
    this.setState(nextState);
  }

  render() {
    const { chapters, selectChapter, book } = this.props;
    const { buttonVisible, title } = this.state;
    return (
      <TableOfContents
        buttonVisible={buttonVisible}
        book={book}
        chapters={chapters}
        title={title}
        handleChange={this.handleChange}
        handleSubmit={this.handleSubmit}
        selectChapter={selectChapter}
        toggleVisibility={this.toggleVisibility}
				authorized={this.props.authorized}
      />
 );
  }
}
