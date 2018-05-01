import React from 'React';

const SocialMedia = props => {
  const handleChange = e => {
    props.onUrlChange(e);
  };

  const sanitize = source => {
    switch (source) {
      case 'itunes':
        return 'iTunes';
      case 'barnesandnoble':
        return 'Barnes and Noble';
      case 'smashword':
        return 'Smashwords';
      default:
        return source.charAt(0).toUpperCase() + source.slice(1);
    }
  };

  const { sources } = props;

  return (
    <div>
      <h4><span>Step 4.</span> Where is your book published?</h4>
      <ul className="field-list">
        {Object.keys(sources).map((source, index) => (
          <li key={index}>
            <div className="title">
              <label htmlFor={source}>{sanitize(source)} URL</label>
              <span className="help-text">Invalid Url</span>
            </div>
            <input
              id={source}
              name={`social_media.${source}`}
              data-validation="url"
              onChange={(e) => handleChange(e)}
              type="text"
              value={sources[source]}
            />
          </li>
        ))}
      </ul>
      <hr />
    </div>
  );
};

export default SocialMedia;
