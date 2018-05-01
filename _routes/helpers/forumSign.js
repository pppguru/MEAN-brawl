module.exports = {
	signup: (email, name, password, cb)=>{
		var request = require("request");
			var options = { method: 'POST',
		  url: 'http://forum.bookbrawl.com/users.json',
		  headers:
		   { 'postman-token': '300a6e2c-a367-76e7-cb3e-0b3f1f93b043',
		     'cache-control': 'no-cache',
		     'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
		  formData:
		   { api_key: 'c620172823a63eb77afd8a060545e4ef122c43c03db350bacdbe50a12487a45b',
		     api_username: 'michael',
		     name: name,
		     email: email,
		     username: name.split(' ').join('_'),
		     password: password,
		     active: 'true',
		     approved: 'true' } };

		request(options, function (error, response, body) {
		  if (error) throw new Error(error);
		  console.log(body);
				cb()
		});
	}
}
