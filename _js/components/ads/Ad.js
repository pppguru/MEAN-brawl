import React from 'react';
import $ from 'jQuery';


let adModel = {};


export class Ads extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {
	    	ads: []
	    };
	}

  	componentDidMount() {
  		this.getAds()
  	}

	getAds = () => {
		$.get('/api/v1/ads').then((ads)=>{
			adModel = ads.data;
			this.setState({ads: ads.data})
		})
	}

	handleChange = (e) => {
		e.preventDefault();
		var checked = false;
		if(!e.target.value){
			checked = true;
		}
		$.ajax({
			url: '/api/v1/ads/'+e.target.id,
			method: 'PUT',
			data:{ads: checked}
		}).then((resp)=>{
			this.getAds();
		})
	}

	render() {
		let {ads} = this.state;
		return (
			<div className="divTable">
				<div className="divTableBody">
					<div className="divTableRow divTableHeading">
						<div className="divTableHead">Ad</div>
						<div className="divTableHead">Location</div>
						<div className="divTableHead isVisible">Is Visible</div>
					</div>
					{
						ads.map((ad, i)=>{
							return (
								<div className="divTableRow" key={i}>
									<div className="divTableCell">{ad.page + " Ads"}</div>
									<div className="divTableCell">{ad.page + " page"}</div>
									<div className="divTableCell"><input type="checkbox" id={ad._id} onChange={this.handleChange} value={ad.ads} checked={ad.ads}/></div>
								</div>
							)
						})
					}
				</div>
			</div>
		)
	}
}

export class AdElement extends React.Component{
	state = {ads:false};
	componentDidMount(){
		$.get('/api/v1/ads').then((ads)=>{
			ads.data.map((ad, key)=>{
				if(ad.page == this.props.page.toLowerCase() && ad.ads){
					this.setState({ads:true})
				}
			});
		})
	}

	render(){
		return(
			<div>
				{this.state.ads?
					<div className="content-block">
						<div className="placeholder">
							<h4>Ad Space</h4>
						</div>
					</div>
				:''}
			</div>
		)
	}
}
