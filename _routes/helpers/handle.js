module.exports = {
	res: function(res, data,  count){
		var resp = {status: 'ok'};
		if(data) resp.data = data;
		if(count) resp.count = count;
		res.status(200)
		res.json(resp);
	},
	err: function(res, error){
		var resp = {status: 'error'};
		if(error){
			if(error.message){
				resp.message = error.message;
			}else{
				resp.message = error;
			}
		}
		console.log('======ERROR======', error);
		res.status(200)
		res.json(resp);
	}
}
