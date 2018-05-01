const express = require('express'),
			mongo = require('../../mongo.js'),
			async = require('async'),
			mandrill = require('mandrill-api/mandrill'),
			mandrill_client = new mandrill.Mandrill('CdbvIytAJInbYckp3pj1Jg'),
			moment = require('moment');

const mongoUser = mongo.schema.user,
			mongoBook = mongo.schema.book,
			mongoChapter = mongo.schema.chapter,
			mongoComment = mongo.schema.comment,
			mongoReview = mongo.schema.review,
			mongoClaim = mongo.schema.claim;

const handle = require('../helpers/handle.js');


exports.getClaims = (req, res)=>{
	var status = req.query.status || 1;
	mongoClaim.find().where('status').equals(status).populate({path: 'book',
     populate: {
       path: 'author',
       model: 'Users',
			 select: 'name email'
     }}).populate('reporter', 'name email').lean().then((claims)=>{
				handle.res(res, claims);
	}).catch((err)=>{
		handle.err(res, err)
	})
}

exports.getBookClaims = (req,res)=>{
	mongoClaim.find({book: req.params.id}).where('status').equals(1).populate({path: 'book',
     populate: {
       path: 'author',
       model: 'Users',
			 select: 'name email'
     }}).populate('reporter', 'name email').then((comments)=>{
		handle.res(res, comments)
	}).catch((err)=>{
		handle.err(res, err)
	})
}

exports.addClaim = (req,res)=>{
	var user = req.session;
	var claim = {
			book: req.params.id,
			reporter: user._id,
			content: req.body.content,
		}

	var newClaim = new mongoClaim(claim);
	newClaim.save().then((claim)=>{
		handle.res(res, claim);
	}).catch((err)=>{
		handle.err(res, err.message);
	})
}

exports.acceptClaim = (req,res)=>{
	mongoClaim.findOne({_id: req.params.id}).then((claim)=>{
		mongoBook.findOne({_id: claim.book._id}).then((book)=>{
			book.autor = claim.reporter
			book.save().then((book)=>{
				handle.res(res, book);
			}).catch(err=>{
				handle.err(res, err.message)
			})
		}).catch(err=>{
			handle.err(res, err.message)
		})
	}).catch(err=>{
		handle.err(res, err.message)
	})
}

exports.editClaim = (req,res)=>{
	mongoClaim.findOne({_id: req.params.id}).then((claim)=>{
		claim.status = 0;
		claim.save().then((claim)=>{
			handle.res(res, claim);
		}).catch(err=>{
			handle.err(res, err.message)
		})
	}).catch(err=>{
		handle.err(res, err.message)
	})
}
