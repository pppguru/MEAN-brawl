const express = require('express'),
			mongo = require('../../mongo.js'),
			async = require('async');

const mongoUser = mongo.schema.user,
			mongoAd = mongo.schema.ad;

const handle = require('../helpers/handle.js');

exports.getAds = (req, res)=>{
	if(!req.query.page){
		mongoAd.find().then((ads)=>{
			handle.res(res, ads);
		}).catch(err=>{
			handle.err(res, err)
		})
	}else{
		mongoAd.findOne({page: req.query.page.toLowerCase()}).then((ad)=>{
			handle.res(res, ad);
		}).catch(err=>{
			handle.err(res, err)
		})
	}
}

exports.getAdById = (req, res)=>{
	mongoAd.findOne({_id: req.params.id}).then((ad)=>{
		handle.res(res, ad);
	}).catch(err=>{
		handle.err(res, err)
	})
}

exports.createAd = (req, res)=>{
	var user = req.session;
	console.log(user);
	if(user && user.role){
		var page = req.body.page.toLowerCase();
		var ad = {page: page, ads: true};
		ad = new mongoAd(ad);

		ad.save().then((ad)=>{
			handle.res(res, ad);
		}).catch(err=>{
			handle.err(res, err);
		})
	}else{
		handle.err(res, 'Not Authorized');
	}
}

exports.editAd = (req, res)=>{
	var user = req.session;
	if(user && user.role){
		mongoAd.findOne({_id: req.params.id}).then((ad)=>{
			if(ad.ads){
				ad.ads = false;
			}else{
				ad.ads = true;
			}

			ad.save().then((ad)=>{
				handle.res(res, ad);
			}).catch(err=>{
				handle.err(res, err)
			})
		})
	}else{
		handle.err(res, 'Not Authorized');
	}
}
