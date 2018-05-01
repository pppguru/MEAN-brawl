const express = require('express'),
			mongo = require('../../mongo.js'),
			async = require('async'),
			bcrypt = require('bcrypt'),
			salt = bcrypt.genSaltSync(11),
			mandrill = require('mandrill-api/mandrill'),
			mandrill_client = new mandrill.Mandrill('CdbvIytAJInbYckp3pj1Jg');

const mongoUser = mongo.schema.user,
			mongoBook = mongo.schema.book,
			mongoChapter = mongo.schema.chapter,
			mongoComment = mongo.schema.comment,
			mongoReview = mongo.schema.review;

const handle = require('../helpers/handle.js');
const mailchimp = require('../helpers/mailchimp.js');
const xp = require('../helpers/achievements.js');
const forum = require('../helpers/forumSign.js');

const makeToken = ()=>{
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for( var i=0; i < 12; i++ )
				text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
}

const sendEmail = (template, subject, options, email, cb)=>{
	var template_content = [];
	var replyTo = options.replyTo || "info@bookbrawl.com";
	var render = options.render || 'mailchimp';
	var message = {
	    "subject": subject,
	    "from_email": "info@bookbrawl.com",
	    "from_name": "Book Brawl",
			"merge_language": render,
	    "to": [{
	            "email": email,
	            "type": "to"
	        }],
	    "headers": {
	        "Reply-To": replyTo,
					"X-MC-MergeLanguage": render
	    },
	    "merge_vars": [{
	            "rcpt": email,
							"vars": options.vars
	        }],
	};
		mandrill_client.messages.sendTemplate({"template_name": template, "template_content": template_content, "message": message}, function(result) {
			cb(null, result);
		}, function(e) {
			cb('A mandrill error occurred: ' + e.name + ' - ' + e.message);
		});
}



//// GET USERS LIST
exports.getUsers = (req, res) => {
	var limit = parseInt(req.query.limit) || 0,
			page = parseInt(req.query.page) || 1,
			skip = (page - 1)*limit,
			query = {},
			sort = {};

	if(req.query.author){
		query.name = { "$regex": req.query.author, "$options": "i" };
	}

	if(req.query.status){
		query.status = req.query.status;
	}else{
		query.status = {"$gt": 0};
	}

	mongoUser.find(query, 'email name bday gender role genres themes level points avatar social_media followers following_authors following_books status newsletter searches level_title').limit(limit).skip(skip).sort(sort)
	.populate({
		path:'following_authors',
		select:'name avatar',
		match: {'status':1}
	})
	.populate({
		path:'followers',
		select: 'name avatar',
		match: {'status':1}
	}).then((users)=>{
		mongoUser.find(query).count().then((count)=>{
			handle.res(res, users, count);
		})
	})
	.catch(function(err){
	 handle.err(res, err);
	});
};

//// CREATE NEW USER
exports.createUser = (req, res)=>{
	mongoUser.findOne({email: req.body.email}).then((user)=>{
			if(!user){
				const rawPass = req.body.password;
				var token = makeToken();
				var userData = req.body
				userData.password =  bcrypt.hashSync(req.body.password, salt);
				userData.role = 0;
				userData.level = 0;
				userData.status = 1;
				userData.token = token;

				if(userData.name.startsWith(' ')){
					userData.name = userData.name.slice(0, 0);
				}

				if(userData.name.endsWith(' ')){
					userData.name = userData.name.slice(0, -1);
				}

				var user = new mongoUser(userData);
				user.save((err, userInfo)=>{
					if(err){console.error(err);}
					var link = req.protocol + '://' + req.get('host')+'/verify?token='+ token;
					var vars = [{name:'verify_link', content: link}]
					sendEmail('Verify Email', 'Verify Book Brawl Email', {vars: vars}, userInfo.email, (err, resp)=>{
						mailchimp.signup(userData.email, userData.newsletter, (err, resp)=>{
							forum.signup(userInfo.email, userInfo.name, rawPass, ()=>{
								handle.res(res, userInfo)
							});
						})
					})
				})
			}else{
				if(user.status == 1) {
					handle.err(res, 'Email is already in use.');
				}
				else {
					handle.err(res, 'Please contact Book Brawl Support. Support@bookbrawl.com');
				}
				
			}
		})
		.catch((err)=>{
			handle.err(res, err);
		})
}

/// GET SINGLE USER BY ID
exports.getUserById = (req, res)=>{
	var query = mongoUser.findOne({_id: req.params.id}, 'email name bday gender role genres themes level points avatar social_media followers following_authors following_books status newsletter searches level_title');
	if(!req.query.following_list){
		query = query.populate({
			path:'following_authors',
			select:'name avatar',
			match: {'status':1}
		})
		.populate({
			path:'followers',
			select: 'name avatar',
			match: {'status':1}
		})
	}
	if(!req.query.book_list){
		query = query.populate({
			path: 'following_books',
			match: {'status':2},
			populate: {
				path: 'author',
				model: 'Users',
				select: 'name',
			}})
	}
		query.lean()
		.then((user)=>{
			if(user.status > 0){
				xp.avatars(user._id, (err, resp)=>{
					delete user.password;
					handle.res(res, user)
				})
			}else{
				handle.err(res, 'User has been removed');
			}
		})
		.catch((err)=>{
			handle.err(res, err.message);
		})
}
/// GET SINGLE USER BY EMAIL
exports.getUserByEmail = (req, res)=>{
	mongoUser.findOne({email: req.query.email}, 'email name bday gender role genres themes level points avatar social_media followers following_authors following_books status newsletter searches level_title', (err, user)=>{
		if(err){
			handle.err(res, err);
		}else{
			if(user.status > 0){
				handle.res(res, user)
			}else{
				handle.err(res, 'User has been removed');
			}
		}
	})
}

/// UPDATE SINGLE USER
exports.updateUser = (req, res)=>{
	if(!req.session){
		handle.err(res, 'Not logged in')
		return;
	}
	mongoUser.findOne({_id: req.params.id})
		.then((user)=>{
			if(req.body.password) delete req.body['password'];
			user.update(req.body)
				.then((userUpdate)=>{
					mongoUser.findOne({_id: req.params.id}).then((user)=>{
						delete user.password;
						handle.res(res, user);
					})
				})
				.catch((err)=>{
					handle.err(res, err.message)
				})
		})
		.catch((err)=>{
			handle.err(res, err.message)
		})
}

/// SOFT REMOVE SINGLE USER
exports.removeUser = (req, res)=>{
	if(!req.session){
		handle.err(res, 'Not logged in')
		return;
	}
	mongoUser.findOne({_id: req.params.id})
		.then((user)=>{
			if(user.role > 0){
				handle.err(res, 'Admins can not be removed')
			}else{
				var isAdminAction = req.query.admin;
				if (isAdminAction == 1){   // Just disable it, if admin deletes the account
					user.update({status: 0})
					.then((userUpdate)=>{
						mongoBook.update({author: req.params.id},{status: 0},{multi: true}).then((update)=>{
							mongoComment.update({author: req.params.id},{status: 0},{multi: true}).then((update)=>{
								mongoReview.update({author: req.params.id},{status: 0},{multi: true}).then((update)=>{
									handle.res(res)
								})
							})
						}).catch((err)=>{
							handle.err(res, err.message)
						});
					})
					.catch((err)=>{
						handle.err(res, err.message)
					})
				}
				else{ // Completely remove for re-signup, if user deletes his account himself
					user.remove()
					.then((userUpdate)=>{
						mongoBook.update({author: req.params.id},{status: 0},{multi: true}).then((update)=>{
							mongoComment.update({author: req.params.id},{status: 0},{multi: true}).then((update)=>{
								mongoReview.update({author: req.params.id},{status: 0},{multi: true}).then((update)=>{
									handle.res(res)
								})
							})
						}).catch((err)=>{
							handle.err(res, err.message)
						});
					})
					.catch((err)=>{
						handle.err(res, err.message)
					})
				}
			}
		})
		.catch((err)=>{
			handle.err(res, err.message)
		})
}

/// NEWS LETTER SIGNUP ///
exports.newsletter = (req, res)=>{
	var email = req.body.email;

	mailchimp.signup(email, true, (err, resp)=>{
		if(!err){
			handle.res(res);
		}else{
			handle.err(res, err);
		}
	})

}

/// USER LOGIN
exports.login = (req, res)=>{
	mongoUser.findOne({email: req.body.email}, (err, user)=>{
		if(err || !user){
			req.session = null;
			handle.err(res, 'Invalid Username or Password');
		}else{
			if(user.status == 0){
				handle.err(res, 'This user has been removed');
			}else{
				bcrypt.compare(req.body.password, user.password, function(err, auth) {
					if(auth){
						var userData = {
							_id: user._id.toString(),
							email: user.email,
							name: user.name,
							avatar: user.avatar,
							level: user.level,
							role: user.role,
							status: user.status
						}
						req.session = userData;
						handle.res(res, user._id.toString());
					}else{
						req.session = null;
						handle.err(res, 'Invalid Username or Password');
					}
				});
			}
		}
	}).catch((err)=>{
		console.log(err);
	});
}

/// USER LOGOUT
exports.logout = (req, res)=>{
	req.session = null;
	handle.res(res);
}

/// PASSWORD RESET

exports.resetRequest = (req, res)=>{
	mongoUser.findOne({email: req.body.email}).then((user)=>{
		if(!user){
			handle.err(res, 'Email not on file.');
		}else{
			var date = new Date(),
					token = makeToken();
					var link = req.protocol + '://' + req.get('host')+'/reset_password?token='+token;
			user.update({token: token, reset_request: date}, (err, update)=>{
				if(err){
					handle.err(res, err);
				}else{
					var vars =[{name: 'verify_link', content: link}]
					sendEmail('Reset Password', 'Book Brawl Reset Password Request', {vars: vars}, user.email, (err, resp)=>{
						handle.res(res, user._id)
					})
				}
			})
		}
	}).catch((err)=>{
		handle.err(res, err);
	});
}

exports.resetTokenAuth = (req, res)=>{
	mongoUser.findOne({token: token}).then((user)=>{
		var userData = {_id: user._id.toString(), email: user.email};
		handle.res(res, userData);
	}).catch((err)=>{
		handle.err(res, err);
	})
}

exports.resetPassword = (req, res)=>{
	mongoUser.findOne({_id: req.body.userId}, (err, user)=>{
		if(err){
			handle.err(res, err);
			return;
		}

		var password = bcrypt.hashSync(req.body.password, salt);

		user.update({password: password}).then((update)=>{
			handle.res(res, req.body.userId);
		}).catch((err)=>{
			handle.err(res, err.message);
		})

	});

}


/// USER SESSION INFO
exports.userSession = (req, res)=>{
	if(!req.session){
		handle.err(res, 'Not logged in')
		return;
	}
	var session = req.session;
	handle.res(res, session)
}

/// USER FOLLOW AUTHOR
exports.followAuthor = (req, res)=>{
	var user = req.session
	if(user && user._id){
		mongoUser.findOne({_id: user._id}).then((userInfo)=>{
			var following = userInfo.following_authors;
			if(following.indexOf(req.body.authorId) == -1){
				following.push(req.body.authorId)
				userInfo.update({following_authors: following}).then((update)=>{
					mongoUser.findOne({_id: req.body.authorId}).then((autherInfo)=>{
						var followed = autherInfo.followers;
						if(followed.indexOf(userInfo._id.toString()) == -1){
							followed.push(userInfo._id.toString());
							autherInfo.update({followers: followed}).then((update)=>{
								handle.res(res, req.body.authorId);
							}).catch((err)=>{
								handle.err(res, err.message)
							})
						}else{
							handle.err(res, 'Already following');
						}
					})
				})
			}else{
				handle.err(res, 'Already following');
			}
		})
		.catch((err)=>{
			handle.err(res, err.message)
		})
		;
	}else{
		handle.err(res, 'Not logged in');
	}
}

// USER UNFOLLOW AUTHOR
exports.unfollowAuthor = (req, res)=>{
	var user = req.session;
	if(user && user._id){
		mongoUser.findOne({_id: user._id}).then((user)=>{
			user.following_authors.remove(req.body.authorId);
			user.save().then(()=>{
				mongoUser.findOne({_id: req.body.authorId}).then((author)=>{
					author.followers.remove(user._id)
					author.save().then(()=>{
						handle.res(res)
					}).catch((err)=>{
						handle.err(res, err.message)
					})
				});
			}).catch((err)=>{
				handle.err(res, err.message)
			});
		}).catch((err)=>{
			handle.err(res, err.message)
		})
	}else{
		handle.err(res, 'Not logged in');
	}
}

exports.reports = (req, res)=>{
	var user = req.session;
	if(!user){
		handle.err(res, 'Not logged in')
		return;
	}else{
		var vars = [{name: 'content', content: req.body.message}, {name:'email', content: user.email}];
		sendEmail('Report', 'Book Brawl Report Submitted', {vars: vars}, 'support@bookbrawl.com', (err, resp)=>{
			if(!err){
				handle.res(res)
			}else{
				handle.err(res, err);
			}
		});
	}
}
