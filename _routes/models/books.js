const express = require('express'),
      mongo = require('../../mongo.js'),
      async = require('async'),
      mandrill = require('mandrill-api/mandrill'),
      mandrill_client = new mandrill.Mandrill('CdbvIytAJInbYckp3pj1Jg');

const mongoUser = mongo.schema.user,
      mongoBook = mongo.schema.book,
      mongoChapter = mongo.schema.chapter,
			mongoReview = mongo.schema.review;

const handle = require('../helpers/handle.js');
const xp = require('../helpers/achievements.js');

const saveImage = (bookId, img, cb) => {
	var url = '/uploads/covers/';

  var base64Data, mime;
  if(img.indexOf('png;base64') != -1){
    base64Data = img.replace(/^data:image\/png;base64,/, "");
    mime = '.png';
  }
  if(img.indexOf('jpeg;base64') != -1){
    base64Data = img.replace(/^data:image\/jpeg;base64,/, "");
    mime = '.jpg';
  }

  if(img.indexOf('tiff;base64') != -1){
    base64Data = img.replace(/^data:image\/tiff;base64,/, "");
    mime = '.tiff';
  }

  if(!mime){
    cb('Incorrect file type')
  }else{
    require("fs").writeFile('public' + url + bookId + mime, base64Data, 'base64', function(err) {
      if(!err){
        cb(null, url + bookId + mime)
      }else{
        cb(err)
      }
    });
  }


}

exports.getBooks = (req, res)=>{
	var limit  = parseInt(req.query.limit) || 0,
  		status = parseInt(req.query.status) || 2,
			page = parseInt(req.query.page) || 1,
			skip = (page - 1) * limit;

	var query = {status: status}
	if(req.query.genre) query.genre = req.query.genre;

	if(req.query.genres){
		var genres = req.query.genres.split(',');
		query.genre = {$in: genres}
	}

	if(req.query.tags){
		var tags = req.query.tags.split(',');
		query.tags = {$in: tags}
	}

	if(req.query.title){
		query.title={ "$regex": req.query.title, "$options": "i" }
	}

	if(req.query.rating){
		var rating = parseInt(req.query.rating);
		var ratingFloor = Math.floor(rating);
		var ratingCeil = ratingFloor + 1;
		query.rating = {$gte : ratingFloor}
	}

	if(req.query.brawlers){
		query.brawl_submit = true;
		// query.brawl = {$exists: false};
	}

	if(req.query.author){
		var authorList=[];
		mongoUser.find({name:{ "$regex": req.query.author, "$options": "i" }}).select('_id').then((authors)=>{
			async.each(authors, (author, cb)=>{
				authorList.push(author._id);
				cb();
			}, (err)=>{
				if(err){
					handle.err(res, err)
				}else{
					query.author = {$in: authorList};
					var mongoQuery = mongoBook.find(query).limit(limit).skip(skip).populate('author', 'avatar name');
					var countQuery = mongoBook.find(query).count();
					if(req.query.sort) mongoQuery = mongoQuery.sort(req.query.sort);

					mongoQuery.then((books)=>{
						countQuery.then((count)=>{
							handle.res(res, books, count)
						})
					}).catch(err=>{
						handle.err(res, err);
					})
				}
			})
		});
	}else{
		var mongoQuery = mongoBook.find(query).limit(limit).skip(skip).populate('author', 'avatar name');
		var countQuery = mongoBook.find(query).count();
		if(req.query.sort) mongoQuery = mongoQuery.sort(req.query.sort);

    if(req.query.trending){
      mongoBook.aggregate([
          {"$match": query},
          { "$project": {
            "title":1,
            "author":1,
            "cover":1,
            "viewed_by": 1,
            "type":1,
            "rating":1,
            "length": { "$size": "$viewed_by" }
          }},
          { "$sort": { "length": -1 } },
          { "$limit": limit || 40 }
        ],
        function(err,results) {
          if(err)console.log(err);
          mongoBook.populate(results, {"path":"author", "model": "Users", "select": "avatar name"}, (err, results)=>{
            handle.res(res, results)
          })
        }
      )
    }else{
  		mongoQuery.then((books)=>{
  			countQuery.then((count)=>{
  				handle.res(res, books, count)
  			})
  		}).catch((err)=>{
  			handle.err(res, err)
  		});
    }
	}

}

exports.getUserBooks = (req, res)=>{
  var limit  = parseInt(req.query.limit) || 0
			page = parseInt(req.query.page) || 1,
			skip = (page - 1) * limit;
			status = req.query.status || 2;

  mongoBook.find({author: req.params.id}).where('status').gte(status).sort( [['_id', -1]] ).limit(limit).skip(skip).populate('author', 'name avatar').then((books)=>{
    if(!books){
      handle.err(res, 'No books for current user');
    }else{
			mongoBook.find({author: req.params.id}).where('status').gt(0).count().then((count)=>{
				handle.res(res, books, count)
			})
    }
  })
}

exports.getUserLibrary = (req, res)=>{
	if(!req.session._id){
		handle.err(res, 'Not logged in');
		return;
	}

	var limit = parseInt(req.query.limit) || 0,
			page = parseInt(req.query.page) || 1,
			skip = (page - 1) * limit;

	var user_id = req.session._id;
	if(req.query.library_id){user_id = req.query.library_id}

	mongoUser.findOne({_id: user_id}).populate({
			path: 'following_books',
			model: 'Books',
			populate: {
	      path: 'author',
	      model: 'Users',
				select: 'name email'
     }}).lean().then((user)=>{
			var books = [];
			for (var i = 0; i < user.following_books.length; i++) {
			 if(user.following_books[i].status > 0){
				 books.push(user.following_books[i]);
			 }
			}
		 var count = books.length;
		 if(limit > 0){
			 var bookList = books.filter((user,index)=>{
				 return index > (skip - 1) && index < (skip + limit)
			 });
		 }else{
			 var bookList = books;
		 }
			handle.res(res, bookList, count)
	}).catch(err=>{
		handle.err(res, err);
	})
}

exports.getAuthorLibrary = (req, res)=>{

	var limit = parseInt(req.query.limit) || 0,
			page = parseInt(req.query.page) || 1,
			skip = (page - 1) * limit;


	mongoUser.findOne({_id: req.params.id}).populate({
			path: 'following_books',
			model: 'Books',
			populate: {
	      path: 'author',
	      model: 'Users',
				select: 'name email'
     }}).lean().then((user)=>{
			 var books = [];
			 for (var i = 0; i < user.following_books.length; i++) {
			 	if(user.following_books[i].status > 0){
					books.push(user.following_books[i]);
				}
			 }
			var count = books.length;
			if(limit > 0){
				var bookList = books.filter((user,index)=>{
					return index > (skip - 1) && index < (skip + limit)
				});
			}else{
				var bookList = books;
			}
			handle.res(res, bookList, count)
	}).catch(err=>{
		handle.err(res, err);
	})
}

exports.getRecommendedBooks = (req, res)=>{
	var user = req.session;
	var status = parseInt(req.query.status) || 2;
	var limit = parseInt(req.query.limit);
	if(user){
		mongoUser.findOne({_id: user._id}).then((user)=>{
			if(user){
				var query = {};
				query.status = status;
				if(user.themes.length) query.tags = {$in: user.themes};
				if(user.genres.length && !req.query.genre) query.genre = {$in: user.genres};
				if(req.query.genre) query.genre = req.query.genre;

				var mongoQuery = mongoBook.find(query).populate('author', 'avatar name').sort('-rating');
				var countQuery = mongoBook.find(query).count();
				if(limit) mongoQuery = mongoQuery.limit(limit);

				mongoQuery.then((books)=>{
					countQuery.then((count)=>{
						handle.res(res, books, count)
					})
				}).catch(err=>{
					handle.err(res, err)
				})
			}else{
				handle.err(res, 'User Not Found');
			}
		}).catch(err=>{
			handle.err(res, err)
		})
	}else{
		var query = {};
		var mongoQuery = mongoBook.find(query).populate('author', 'avatar name').sort('-rating');
		if(limit) mongoQuery = mongoQuery.limit(limit);

		mongoQuery.then((books)=>{
			handle.res(res, books)
		}).catch(err=>{
			handle.err(res, err)
		})
	}
}

exports.getBooksById = (req, res)=>{
  mongoBook.findOne({_id: req.params.id}).populate('author', 'avatar name').lean().then((book)=>{
    if(!book){
      res.json({status: 'error', message: 'Book does not exist.'});
    }else{
			mongoReview.find({book_id: book._id}).where('status').equals(1).populate('author', 'name').then((reviews)=>{
				if(!reviews.length){reviews=[]};
				var rating = 0;
				for (var i = 0; i < reviews.length; i++) {
					var rating = rating + reviews[i].rating;
				}
				book.rating = rating/reviews.length;
				book.reviews = reviews;
				res.json({status: 'ok', data: book})
			}).catch((err)=>{
				handle.err(res, err.message)
			})
    }
  })
}

exports.createBook = (req, res)=>{
	var user = req.session;
	if(!user){
	  res.json({status:'error', message: 'Not logged in'})
	  return;
	}

	var book = req.body;
	book.author = req.session._id;
	book.status = 1;

	var coverUrl = req.session._id + (Math.floor(Math.random() * (1 - 200000000000000)) + 200000000000000);

  console.log('= DEBUG =', book);

	if(book.cover){
		saveImage(coverUrl, book.cover, function(err, url){
			if(err){
				console.log('=== IMAGE SAVE ERROR ===', err);
				handle.err(res, err.message);
			}else{
				var newBook = new mongoBook(book);
				newBook.cover = url;
				newBook.save().then((book)=>{
					res.json({status: 'ok', data: book});
				}).catch((err)=>{
					console.log(err);
					res.json({status: 'error', message: err.message});
				})
			}
		})
	}else{
		var newBook = new mongoBook(book);
		newBook.cover = '/assets/images/default-cover-art.jpg';
		newBook.save().then((book)=>{
			res.json({status: 'ok', data: book});
		}).catch((err)=>{
			res.json({status: 'error', message: err});
		})
	}
}

exports.removeBook = (req, res)=>{
  var user = req.session;
  if(!user){
    res.json({status:'error', message: 'Not logged in'})
    return;
  }

  mongoBook.findOne({_id: req.params.id}).update({status: 0}).then((update)=>{
    res.json({status: 'ok', data: req.params.id})
  }).catch((err)=>{
    res.json({status: 'error', message: err});
  })
}

exports.editBook = (req, res)=>{
	var user = req.session;
  if(!user){
    res.json({status:'error', message: 'Not logged in'})
    return;
	}

	if(req.body.cover && !req.body.cover.startsWith('/')){
		saveImage(req.params.id, req.body.cover, function(err, url){
			if(err){
				console.log('=== IMAGE SAVE ERROR ===', err);
				handle.err(res, err.message);
			}else{
				req.body.cover = url;
				mongoBook.findOne({_id: req.params.id}).update(req.body).then((update)=>{
			    res.json({status: 'ok', data: req.params.id})
			  }).catch((err)=>{
			    res.json({status: 'error', message: err});
			  })
			}
		});
	}else{
		mongoBook.findOne({_id: req.params.id}).then((book)=>{
			book.update(req.body).then((update)=>{
				if(req.body.status && req.body.status == 2){
					xp.publish(book.author, (err, user)=>{
						res.json({status: 'ok', data: req.params.id})
					})
				}else{
					res.json({status: 'ok', data: req.params.id})
				}
			})
	  }).catch((err)=>{
	    res.json({status: 'error', message: err});
	  })
	}
}

exports.followBook = (req, res)=>{
	var bookId = req.params.id;
	var user = req.session;
	if(!user){
		handle.err(res, 'Not logged in');
		return;
	}

	mongoUser.findOne({_id: user._id}).then((user)=>{
		if(user.following_books.indexOf(bookId) == -1){
			user.following_books.push(bookId);
			user.save().then((saved)=>{
				mongoBook.findOne({_id: bookId}).then((book)=>{
					if(book.followers.indexOf(user._id) == -1){
						book.followers.push(user._id);
						book.save().then((savedBook)=>{
							handle.res(res, bookId);
						}).catch((err)=>{
							handle.err(res, err.message)
						})
					}else{
						handle.err(res, 'Already following')
					}
				}).catch((err)=>{
					handle.err(res, err.message)
				})
			}).catch((err)=>{
				handle.err(res, err.message)
			})
		}else{
			handle.err(res, 'Already following')
		}
	}).catch((err)=>{
		handle.err(res, err.message)
	})
}

exports.unfollowBook = (req, res)=>{
	var bookId = req.params.id;
	var user = req.session;
	if(!user){
		handle.err(res, 'Not logged in');
		return;
	}
	mongoUser.findOne({_id: user._id}).then((user)=>{
		user.following_books.remove(bookId);
		user.save().then((saved)=>{
			mongoBook.findOne({_id: bookId}).then((book)=>{
				book.followers.remove(user._id)
				book.save().then((bookSaved)=>{
					handle.res(res, bookId)
				}).catch((err) => {
					handle.err(res, err)
				})
			}).catch((err) => {
				handle.err(res, err)
			})
		}).catch((err) => {
			handle.err(res, err)
		})
	}).catch((err) => {
		handle.err(res, err)
	})
}

exports.addChapter = (req, res)=>{
  var book_id = req.params.id;

  if(!book_id || !req.body.number || !req.body.content || !req.body.name){
    res.json({status: 'error', message: 'Missing parameters'})
  }else{
    mongoChapter.findOne({book_id: book_id}).where('status').gt(0).where('number').equals(parseInt(req.body.number)).then((chapter)=>{
      if(chapter){
        res.json({status:'error', message: 'Chapter number already exists'});
      }else{
        var chapterInfo = {
          book_id: book_id,
          number: parseInt(req.body.number),
          name: req.body.name,
          content: req.body.content,
          status: 1
        }
        var chapter = new mongoChapter(chapterInfo);
        chapter.save().then((chapter)=>{
						mongoBook.findOne({_id: book_id}).then((book)=>{
              if(book.status > 1){
                xp.chapter(book.author, (err, user)=>{
                  res.json({status: 'ok', data: chapter});
                });
              }else{
                res.json({status: 'ok', data: chapter});
              }
						})
        })
      }
    }).catch(function(err){
      res.json({status:'error', message: err});
    });
  }
}

exports.getChapters = (req, res)=>{
  var book_id = req.params.id;
  mongoChapter.find({book_id: book_id}).where('status').gt(0).sort('number').then((chapters)=>{
		if(req.session && req.session._id){
			mongoBook.findOne({_id: book_id}).then((book)=>{
				if(book.last_viewed){
					book.last_viewed[req.session._id] = new Date();
				}else{
					var last_viewed = {};
					last_viewed[req.session._id] = new Date();
					book.last_viewed = last_viewed;
				}
				var last = book.last_viewed;
				book.update({last_viewed: last}).then((book)=>{
					res.json({status: 'ok', data: chapters})
				});
			})
		}else{
			res.json({status: 'ok', data: chapters})
		}
  }).catch(function(err){
    res.json({status: 'ok', message: err})
  })
}

exports.getChapterByNumber = (req, res)=>{
  var book_id = req.params.id,
      number = parseInt(req.params.number);

			console.log(book_id);
			console.log(number);

  mongoChapter.findOne({book_id: book_id}).where('status').gt(0).where('number').equals(number).then((chapter)=>{
		if(req.session && req.session._id){
			if(chapter.viewed_by){
				chapter.viewed_by[req.session._id] = new Date();
			}else{
				var viewed_by = {};
				viewed_by[req.session._id] = new Date();
				chapter.viewed_by = viewed_by;
			}
			chapter.save().then((chapter)=>{
				handle.res(res, chapter)
			})
		}else{
			handle.res(res, chapter)
		}
  }).catch(function(err){
    handle.err(res, err)
  })
}

exports.editChapter = (req, res)=>{
  var book_id = req.params.id,
      number = parseInt(req.params.number);

  mongoChapter.findOne({book_id: book_id}).where('number').equals(number).then((chapter)=>{
    if(!chapter){
      res.json({status:'error', message: 'Chapter does not exist'});
    }else{

      if(req.body.name) chapter.name = req.body.name;
      if(req.body.content) chapter.content = req.body.content;
      if(req.body.status) chapter.status = req.body.status;

			chapter.updated_at = new Date();

      chapter.save().then(function(chapter){
				if(chapter.status > 0){
					mongoBook.findOne({_id: book_id}).then((book)=>{
						book.updated_at = new Date();
						book.save().then((book)=>{
							res.json({status: 'ok', data: chapter})
						});
					})
				}else{
					res.json({status: 'ok', data: chapter})
				}
      }).catch(function(err){
        res.json({status: 'ok', message: err})
      })
    }
  }).catch(function(err){
    res.json({status: 'ok', message: err})
  })
}

exports.deleteChapter = (req, res)=>{
  var book_id = req.params.id,
      number = parseInt(req.params.number);
  mongoChapter.findOne({book_id: book_id}).where('status').gt(0).where('number').equals(number).then((chapter)=>{
    if(!chapter){
      res.json({status:'error', message: 'Chapter does not exist'});
    }else{
      chapter.status = 0;
      chapter.save().then(function(chapter){
        res.json({status: 'ok', data: chapter})
      }).catch(function(err){
        res.json({status: 'ok', message: err})
      })
    }
  }).catch(function(err){
    res.json({status: 'ok', message: err})
  })
}
