var Mailchimp = require('mailchimp-api-v3')
var mailchimp = new Mailchimp('06b080d3295a7c3c54babbe9e2ec215c-us15');

module.exports = {
	signup: (email, subscribe, cb)=>{
		if(subscribe){
			mailchimp.post('/lists/55a86f7822/members',
			{
				email_address: email,
				status: "subscribed",
			}).then((resp)=>{
				cb(null, resp)
			}).catch(err=>{
				cb(err.title)
			})
		}else{
			cb();
		}
	}
}
