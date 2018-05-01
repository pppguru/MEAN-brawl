import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

class Forum extends React.Component{

	constructor(props) {
    	super(props);
    	this.state = {};
  	}

    componentWillMount(){}


	render(){
        let self = this;
        return(
            <div>Forum</div>
        )
	}
}

if(document.getElementById('forum'))
    ReactDOM.render(<Forum />, document.getElementById('forum'))
