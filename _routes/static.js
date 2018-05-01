const express = require('express'),
		mongo = require('../mongo.js'),
		rp = require('request-promise'),
		router = express.Router();

const handle = require('./helpers/handle.js');
const mongoUser = mongo.schema.user,
			mongoBook = mongo.schema.book;

router.get('/', (req, res)=>{
	res.render('home', {title: 'Browse'})
});

router.get('/login', (req, res)=>{
	res.render('login', {title: 'Login'})
});

router.get('/signup', (req, res)=>{
	res.render('signup', {title: 'Sign Up'})
});

router.get('/email', (req, res)=>{
	res.render('email', {title: 'Check Email'})
});

router.get('/recover-password', (req, res)=>{
	res.render('email', {title: 'Recover Password'})
});

router.get('/password-reset', (req, res)=>{
	res.render('email', {title: 'Password Reset'})
});

router.get('/terms', (req, res)=>{
	res.render('legal', {title: 'Terms'})
});

router.get('/privacy', (req, res)=>{
	res.render('legal', {title: 'Privacy'})
});

router.get('/conduct', (req, res)=>{
	res.render('legal', {title: 'Conduct'})
});

router.get('/contactus', (req, res)=>{
	res.render('contactus', {title: 'Contact Us'})
});

router.get('/report-sent', (req, res)=>{
	res.render('email', {title: 'Report Sent'})
});

router.get('/author/:id', (req, res)=>{
	res.render('author', {title: 'Author Page',id: req.params.id})
});

router.get('/author/:id/edit', (req, res)=>{
	res.render('edit', {title: 'Author Page',id: req.params.id})
});

router.get('/author/:id/reset-password', (req, res)=>{
	res.render('reset-password', {title: 'Reset Password',id: req.params.id})
});

router.get('/books/all', (req, res)=>{
	res.render('view_all', {title:'Browse', query: req.query, author: false})
});

router.get('/books/:id', (req, res) => {
	var user = req.session
	if(user && user._id){
		mongoBook.findOne({_id: req.params.id}).then((book)=>{
			if(book.author && book.author != user._id){
				if(book.viewed_by.indexOf(user._id) == -1){
					book.viewed_by.push(user._id);
				}
				else{
					book.visits += 1;
				}

				book.save().then((book)=>{
					res.render('book-edit', {title: 'Edit Book', id: req.params.id})
				})
			}else{
				res.render('book-edit', {title: 'Edit Book', id: req.params.id})
			}
		});
	}else{
		res.render('book-edit', {title: 'Edit Book', id: req.params.id})
	}
});

// router.get('/books/:id/chapters/:number', (req, res) => {
// 	mongo.schema.chapter.findOne({book_id: req.params.id}).where('number').equals(req.params.number).then(function(chapter){
// 		res.send(chapter.content)
// 	})
// });

router.get('/authors/all', (req, res)=>{
	res.render('view_all', {title:'Browse', query: req.query, author: true})
});

router.get('/dashboard', (req, res)=>{
	if(req.session && req.session._id){
		res.render('dashboard', {title: 'Dashboard'});
	}else{
		res.redirect('/login');
	}
});

router.get('/dashboard/edit', (req, res)=>{
	res.render('edit', {title: 'Edit', id: 0});
});

router.get('/dashboard/edit/books/:bookId', (req, res) => {
	if(req.session && req.session._id){
		res.render('dashboard-create', {title: 'Create', bookId: req.params.bookId})
	}else{
		res.redirect('/login');
	}
});

router.get('/dashboard/create', (req, res) => {
	if(req.session && req.session._id){
		res.render('dashboard-create', {title: 'Create', bookId: false})
	}else{
		res.redirect('/login');
	}
});

router.get('/dashboard/following/:page', (req, res)=>{
	res.render('friends', {title: 'Following', page: req.params.page});
});

router.get('/dashboard/all-users/:page', (req, res)=>{
	res.render('friends', {title: 'All Users', page: req.params.page});
});

router.get('/forum', (req, res)=>{
	res.render('forum', {title: 'Forum'})
});

router.get('/search', (req, res)=>{
	res.render('search', {title: 'Search'})
});

router.get('/verify', (req, res)=>{
	var token = req.query.token;
	mongoUser.findOne({token: token}, (err, user)=>{
		if(err || !user){
			req.session = null;
			handle.err(res, 'Invalid Token');
		}else{
			if(user.status == 0){
				handle.err(res, 'This user has been removed');
			}else{
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
						res.redirect('/dashboard');
				};
			}
		})
});

router.get('/reset_password', (req, res)=>{
	var token = req.query.token;
	mongoUser.findOne({token: token}, (err, user)=>{
		if(err || !user){
			req.session = null;
			handle.err(res, 'Invalid Token');
		}else{
			if(user.status == 0){
				handle.err(res, 'This user has been removed');
			}else{
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
						res.redirect('/author/'+userData._id+'/reset-password');
				};
			}
		})
});

router.get('/admin', (req, res)=>{
	if(req.session && req.session.role > 0){
		res.render('search', {title: 'Search'})
	}
});

router.get('/testing', (req, res)=>{

});

module.exports = router;
