import React from 'react';
// import { validate, formValid } from '../../plugins/validation';

const UploadCover = props => {
  const { author, title, coverFile, handleChange, coverAdd, validate } = props;

  return (
    <div>
      <h4><span>Step 1.</span> Upload Cover Art</h4>
      <ul className="field-list field-list-split">
        <li>
          <div className="book-blocks book-blocks-single book-blocks-preview">
            <ul>
              <li>
                <div className="content-block content-block-book">
                  <figure>
                    <Cover title={title} coverFile={coverFile} />
                    <Caption title={title} author={author} />
                  </figure>
                </div>
              </li>
            </ul>
          </div>
        </li>
        <li>
          <Information
            title={title}
            handleChange={handleChange}
            coverAdd={coverAdd}
            validate={validate}
          />
        </li>
      </ul>
    </div>
  );
};

const Caption = ({ title, author, stars = 5 }) => (
  <figcaption>
    <BookTitle title={title} />
    <AuthorName author={author} />
    <Rating stars={stars} />
  </figcaption>
);

export const Cover = ({ coverFile }) => (
  <div className="cover">
    <div className="flex">
      <img src={coverFile? coverFile : '/assets/images/default-cover-art.jpg'} alt="Cover Image" />
    </div>
  </div>
);

const BookTitle = ({ title }) => <h4>{title || 'Title Area'}</h4>;
const AuthorName = ({ author }) => <p>by {author || '[Author Name]'}</p>;

const Rating = ({ stars = 5 }) => {
  const starsRated = [];
  for (let i = 0; i < stars; i += 1) {
    starsRated.push(<li key={i} />);
  }
  return (
    <ul className="rating-display">
      {starsRated}
    </ul>
  );
};

const Information = ({ title, handleChange, coverAdd, validate }) => (
  <div className="copy">
    <p>Add Basic Information</p>
    <div id="coverForm">
      <ul className="inner-fields">
        <li>
          <div className="title password">
              <label htmlFor="title"><span>*</span>Book Title</label>
              <span className="help-text">Title is required and must be under 30 characters</span>
          </div>
          <input
            id="title" name="title" type="text" onBlur={validate}
            onChange={handleChange} value={title} data-maxlength="30" data-validation="maxlength,required"
          />
        </li>
        <li>
          <label htmlFor="cover">Upload Cover Art</label>
          <input id="cover" type="file" onChange={coverAdd} data-validation="" />
          <small>
            Max size of 5 MB<br />
            Dimensions are X by X<br />
            Needs to be jpg, png, or gif
            </small>
          <button id="coverSubmit" type="submit" style={{ display: 'none' }} />
        </li>
      </ul>
    </div>
  </div>
);

export default UploadCover;
