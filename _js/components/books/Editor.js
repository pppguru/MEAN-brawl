import React, { Component } from 'react';
import TinyMCE from 'react-tinymce';

function sanitizeContent(content) {
  return content;
}

class Editor extends Component{

  render(){
    const { content } = this.props;
    return(
      <div>
        <TinyMCE
          content={sanitizeContent(this.props.content)}
          config={{
            // plugins: 'autolink link image table textcolor',
            plugins: [
              'advlist autolink lists link image charmap hr anchor pagebreak',
              'searchreplace wordcount visualblocks visualchars code fullscreen',
              'insertdatetime media nonbreaking save table contextmenu directionality',
              'emoticons template paste textcolor colorpicker textpattern imagetools toc'
            ],
            toolbar: 'undo redo | insert | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | outdent indent | bullist numlist | forecolor backcolor | table | emoticons | link image | styleselect | formatselect',
            menubar: false,
            height: this.props.settings.editorHeight,
            theme: 'modern'
          }}
          onChange={this.props.handleChange}
        />
        <div className="submit-row submit-row-editor">
          <div className="buttons">
            {
              this.props.isLastChapter()
                ? <button className="button button-red" onClick={this.props.deleteChapter}>Delete</button>
                : null
            }
            
            <button className="button" onClick={this.props.handleSubmit}>Save</button>
          </div>
        </div>
      </div>
    );
  }
}
export default Editor;
