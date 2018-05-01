import React from 'react';
import ReactDOM from 'react-dom';

const ClaimDetailsModal = props => (
	<div className="modal claim" style={{visibility:'visible', opacity:1}}>
		<div className="overlay" onClick={props.cancelClaim}>
			<div className="content-block content-block-standard">
				<form>
					<div className="title-row" style={{ marginBottom: 0 }}>
						<h4>Report Details</h4>
					</div>
					<div className="flex-row">
						<p><strong>Reporter's Name: </strong> {props.user ? props.user.name : ""}</p>
						<p><strong>Book Reference: </strong>{props.book? props.book.author.name:''} of {props.book? props.book.title : ''}</p>
						<p><strong>Posted in: </strong> {props.book? props.book.genre : ''}</p>
					</div>
					<hr />
					{props.view?(<p>{props.content}</p>):
					(<textarea
						id="claim"
						rows="5"
						placeholder="Description of report..."
						name="claimContent"
						value={props.claimContent}
						onChange={props._onChange}
						/>)}

						{props.view?
							(<div className="submit-row submit-row-claim">
								{props.user && props.book &&
								<div className="claim-details">
									<p>Email : {props.user ? props.user.email : ""}</p>
									<a onClick={props.deleteBook}><p>Delete Book Immediately</p></a>
									<a onClick={props.resolveClaim}><p>Mark as Resolved</p></a>
								</div>
								}
							</div>)
						:''}
					<div className="submit-row submit-row-claim">
							{props.view?(<div className="buttons"><button className="button button-red close" onClick={props.cancelClaim}>Close</button></div>):(<div className="buttons"><button className="button button-white close" onClick={(e)=>{props.cancelClaim(e)}}>Cancel</button>
						<button className="button button-red" onClick={props.submitClaim}>Submit</button></div>)}
					</div>
				</form>
			</div>
		</div>
	</div>
);

if (document.getElementById('claim-details')) {
  ReactDOM.render(<ClaimDetailsModal />, document.getElementById('claim-details'));
}

export default ClaimDetailsModal;
