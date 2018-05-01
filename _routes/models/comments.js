const express = require('express'),
			mongo = require('../../mongo.js'),
			async = require('async'),
			mandrill = require('mandrill-api/mandrill'),
			mandrill_client = new mandrill.Mandrill('CdbvIytAJInbYckp3pj1Jg');

const mongoUser = mongo.schema.user,
			mongoBook = mongo.schema.book,
			mongoChapter = mongo.schema.chapter,
			mongoComment = mongo.schema.comment,
			mongoReview = mongo.schema.review;

const handle = require('../helpers/handle.js');
const xp = require('../helpers/achievements.js');

exports.getComments = (req,res)=>{
	mongoComment.find({chapter_id: req.params.id}).where('status').equals(1).populate('author', 'name avatar').then((comments)=>{
		handle.res(res, comments)
	}).catch((err)=>{
		handle.err(res, err)
	})
}

exports.getCommentById = (req,res)=>{
	handle.res(res)
}

exports.addComment = (req,res)=>{
	var user = req.session;
	var comment = {
			chapter_id: req.params.id,
			book_id: req.body.book_id,
			content: req.body.content,
			author: user._id,
			status: 1
		}

	var newComment = new mongoComment(comment);
	newComment.save().then((comment)=>{
		xp.comment(user._id, (err, comment_user)=>{
			mongoBook.findOne({_id: comment.book_id}).then((book)=>{
				if(user._id != book.author){
					xp.comment(book.author, (err, book_user)=>{
						handle.res(res, comment)
					})
				}else{
					handle.res(res, comment)
				}
			})
		})
	}).catch((err)=>{
		handle.err(res, err.message);
	})
}

exports.editComment = (req,res)=>{
	mongoComment.findOne({_id: req.params.id}).then((comment)=>{
		if(!comment){
			handle.err(res, 'Comment does not exist');
		}else{
			if(req.body.content) comment.content = req.body.content;
			comment.save().then((comment)=>{
				handle.res(res, comment)
			})
		}
	}).catch((err)=>{
		handle.err(res, err.message);
	})
}

exports.removeComment = (req,res)=>{
	mongoComment.findOne({_id: req.params.id}).then((comment)=>{
		if(!comment){
			handle.err(res, 'Comment does not exist');
		}else{
			comment.status = 0;
			comment.save().then((comment)=>{
				handle.res(res, comment)
			})
		}
	}).catch((err)=>{
		handle.err(res, err.message);
	})
}
