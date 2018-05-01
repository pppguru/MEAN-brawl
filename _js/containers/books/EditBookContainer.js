import React from 'react';
import Slider from 'react-slick';
import $ from 'jQuery';

import DetailsContainer from './DetailsContainer';
import EditorContainer from './EditorContainer';
import TOCContainer from './TOCContainer';
import DescriptionContainer from './DescriptionContainer';
import ViewBookContainer from './ViewBookContainer';
import Claims from '../../components/claims/ClaimDetailsModal';

import {AdElement} from '../../components/ads/Ad';

const apiUrl = '/api/v1';

export default class EditBookContainer extends React.Component {
  state = {
    selectedChapter: null,
    chapters: [],
    reviews: [],
    claim:false,
    claimContent:'',
    settings: {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 2,
      slidesToScroll: 1,
      dotsClass: 'slick-dots pagination',
      editorHeight: 'auto'
    },
    mobile: false
  };

  componentDidMount() {
    this.loadChapters();
    this.updateSlidesToShow();
    window.addEventListener("resize", this.updateSlidesToShow);

    $.get('/api/v1/ads').then((ads)=>{
			ads.data.map((ad, key)=>{
				if(ad.page == 'book-detail' && ad.ads){
					this.setState({ads:true})
				}
			});
		})
  }

  updateSlidesToShow = () => {
    let {settings, mobile} = this.state;
    let {toggleStatus} = this.props;
    let oldNumOfSlides = settings.slidesToShow;
    let isMobile = window.innerWidth < 1024
    settings.slidesToShow = !isMobile && toggleStatus === "Full Screen" ? 2 : 1;

    settings.editorHeight = (toggleStatus === "Full Screen") ? 'auto' : '60vh';

    if(oldNumOfSlides !== settings.slidesToShow || mobile !== isMobile){
      this.setState({settings: settings, mobile: isMobile})
    }
  }

  loadChapters = () => {
    $.get(`${apiUrl}/books/${bookId}/chapters`)
      .then(res => {
        const nextState= {chapters: res.data };
        this.setState(nextState);
      });
  }

  loadReviews = () => {
    $.get(`${apiUrl}/books/${bookId}/reviews`)
      .then(res => {
        this.setState({reviews: res.data});
      }).catch((err)=>{
        console.log(err);
      })
  }

  selectChapter = id => {
    const slidesToSkip = parseInt(id) * 2
    const nextState = {selectedChapter: slidesToSkip.toString() };
    this.setState(nextState, (id) => {
      this.refs.slider.slickGoTo(slidesToSkip); // manual, can change later
    });
  }

  loadSlides = slides => {
    const { bookId } = this.props;
    const { selectedChapter } = this.state;
    let chapterCount = this.state.chapters.length;
    let pages = [];

    this.state.chapters.map((chapter,index)=>{
      pages.push(
        <div className="content-block content-block-standard-slide chapter-begin"><div><h4>Chapter {chapter.number}</h4><span className="chapter-name">{chapter.name}</span></div></div>,
        <EditorContainer bookId={bookId} chapterCount={chapterCount} chapterNumber={chapter.number} chapterId={chapter._id} user={this.props.user} admin={this.props.admin} authorized={this.props.authorized} settings={this.state.settings}/>,
        //<ViewBookContainer bookId={bookId} chapterId={chapter.number} />
      )
    })

    if(this.state.chapters.length){
      slides.push(...pages);
    }

    return slides.map(function(slide, index) {
      return (
        <div key={index}>{slide}</div>
      )
    })
  }

  _onChange = (e)=>{
    var state = {};
    state[e.target.name]=e.target.value;
    this.setState(state)
  }

  claim = ()=>{
    this.setState({claim:true});
  }

  submitClaim = (e)=>{
    e.preventDefault();
    var postData = {
      bookId: this.props.bookId,
      content: this.state.claimContent
    }
    $.post(`${apiUrl}/books/${bookId}/claims`, postData).then((claim)=>{
      this.setState({claim:false, claimContent:''});
    }).catch((err)=>{
      console.log(err);
    })
  }

  cancelClaim = (e)=>{
    if(e.target.classList.contains('overlay') || e.target.classList.contains('close')){
      this.setState({claim:false, claimContent:''});
    }

    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const { bookId } = this.props;
    const { chapters, selectedChapter, settings, mobile } = this.state;
    const slides = [
      <DescriptionContainer user={this.props.user} claim={this.claim} bookId={this.props.bookId} book={this.props.book} authorized={this.props.authorized} following={this.props.following} admin={this.props.admin} getBook={this.props.getBook}/>,
      <TOCContainer book={this.props.book} bookId={this.props.bookId} loadChapters={this.loadChapters} selectChapter={this.selectChapter} chapters={this.state.chapters} authorized={this.props.authorized}/>,
    ];
    return (
      <div>
        {this.state.claim?(<Claims book={this.props.book} user={this.props.user} claimContent={this.state.claimContent} submitClaim={this.submitClaim} cancelClaim={this.cancelClaim} _onChange={this._onChange}/>):''}
        <div className="book-top-half">
          <DetailsContainer toggleSettings={this.updateSlidesToShow} slider={this.refs.slider} bookId={this.props.bookId} toggleStatus={this.props.toggleStatus} toggleScreen={this.props.toggleScreen} book={this.props.book} length={this.state.chapters.length} following={this.props.following} authorized={this.props.authorized}/>
          {(settings.slidesToShow === 2 || mobile) &&
            <div className="content-block content-block-standard-new ads book-details-ads" 
                 style={(!this.state.ads) ? { 'display' : 'none' } : {}}>
              <AdElement page='book-detail'/>
              <AdElement page='book-detail'/>
            </div>
          }
        </div>
        {(settings.slidesToShow === 1 && !mobile) &&
          <div className="content-block content-block-standard-new full left"
            style={(!this.state.ads) ? { 'display' : 'none' } : {}}>
            <AdElement page='book-detail'/>
          </div>
        }
        <Slider ref='slider' {...settings}>
          {this.loadSlides(slides)}
        </Slider>
        {(settings.slidesToShow === 1 && !mobile) &&
          <div className="content-block content-block-standard-new full right"
               style={(!this.state.ads) ? { 'display' : 'none' } : {}}>
            <AdElement page='book-detail'/>
          </div>
        }
      </div>
    );
  }
}
