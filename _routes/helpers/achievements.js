const mongo = require('../../mongo.js')
const mongoUser = mongo.schema.user,
			mongoBook = mongo.schema.book,
			mongoChapter = mongo.schema.chapter,
			mongoComment = mongo.schema.comment,
			mongoReview = mongo.schema.review;

const levelCheck = (points, cb)=>{
	var level = 0, title = 'Apprentice';
	if(points > 0){ level = 1; title = 'Bronze Acolyte' }
	if(points >= 2){ level = 1 }
	if(points >= 4){ level = 2 }
	if(points >= 7){ level = 3 }
	if(points >= 9){ level = 4 }
	if(points >= 12){ level = 5; title='Silver Acolyte'}
	if(points >= 15){ level = 6 }
	if(points >= 19){ level = 7 }
	if(points >= 23){ level = 8 }
	if(points >= 27){ level = 9; title='Gold Acolyte'}
	if(points >= 32){ level = 10 }
	if(points >= 37){ level = 11; title='Bronze Aspirant'}
	if(points >= 43){ level = 12 }
	if(points >= 49){ level = 13 }
	if(points >= 56){ level = 14 }
	if(points >= 54){ level = 15; title='Silver Aspirant'}
	if(points >= 72){ level = 16 }
	if(points >= 81){ level = 17 }
	if(points >= 91){ level = 18 }
	if(points >= 102){ level = 19; title='Gold Aspirant'}
	if(points >= 115){ level = 20 }
	if(points >= 128){ level = 21; title='Bronze Adventurer'}
	if(points >= 143){ level = 22 }
	if(points >= 159){ level = 23 }
	if(points >= 177){ level = 24 }
	if(points >= 193){ level = 25; title='Silver Adventurer'}
	if(points >= 211){ level = 26 }
	if(points >= 229){ level = 27 }
	if(points >= 250){ level = 28 }
	if(points >= 272){ level = 29; title='Gold Adventurer'}
	if(points >= 296){ level = 30 }
	if(points >= 312){ level = 31; title='Bronze Veteran'}
	if(points >= 330){ level = 32 }
	if(points >= 348){ level = 33 }
	if(points >= 368){ level = 34 }
	if(points >= 388){ level = 35; title='Silver Veteran'}
	if(points >= 410){ level = 36 }
	if(points >= 432){ level = 37 }
	if(points >= 456){ level = 38 }
	if(points >= 481){ level = 39; title='Gold Veteran'}
	if(points >= 507){ level = 40 }
	if(points >= 534){ level = 41; title='Bronze Master'}
	if(points >= 563){ level = 42 }
	if(points >= 593){ level = 43 }
	if(points >= 624){ level = 44 }
	if(points >= 658){ level = 45; title='Silver Master'}
	if(points >= 692){ level = 46 }
	if(points >= 729){ level = 47 }
	if(points >= 768){ level = 48 }
	if(points >= 808){ level = 49; title='Gold Master'}
	if(points > 850){ level = 50 }

	cb(level, title);
}

const levelAvatar = (level)=>{
	var avatar = {kitty: '', puppy:''}

	if(!level || level == 0){
		avatar.kitty = '/assets/images/avatars/Cat_1.png';
		avatar.puppy = '/assets/images/avatars/Dog_1.png';
	}
	if (level >= 1) {
		avatar.kitty = '/assets/images/avatars/Cat_2.png';
		avatar.puppy = '/assets/images/avatars/Dog_2.png';
	}
	if (level >= 11) {
		avatar.kitty = '/assets/images/avatars/Cat_3.png';
		avatar.puppy = '/assets/images/avatars/Dog_3.png';
	}
	if (level >= 21) {
		avatar.kitty = '/assets/images/avatars/Cat_4.png';
		avatar.puppy = '/assets/images/avatars/Dog_4.png';
	}
	if (level >= 31) {
		avatar.kitty = '/assets/images/avatars/Cat_5.png';
		avatar.puppy = '/assets/images/avatars/Dog_5.png';
	}
	if (level >= 41) {
		avatar.kitty = '/assets/images/avatars/Cat_6.png';
		avatar.puppy = '/assets/images/avatars/Dog_6.png';
	}

	return avatar;
}

const avatarCheck = (avatar)=>{
	if(avatar === '/assets/images/avatars/Cat_1.png' || avatar === '/assets/images/avatars/Cat_2.png' || avatar === '/assets/images/avatars/Cat_3.png' || avatar === '/assets/images/avatars/Cat_4.png' || avatar === '/assets/images/avatars/Cat_5.png' || avatar === '/assets/images/avatars/Cat_6.png' || avatar === '/assets/images/avatars/cat_1.png'){
		return 'cat';
	}else{
		return 'dog';
	}
}

const selectAvatar = (level, avatar)=>{
	var animal = avatarCheck(avatar);

	if(animal === 'dog'){
		var selected = levelAvatar(level).puppy;
	}else{
		var selected = levelAvatar(level).kitty;
	}

	return selected;
}

const addPoints = (userId, points, cb)=>{
	mongoUser.findOne({_id: userId}).then((user)=>{
		if(!user.points){
			user.points = 0;
		}
		user.points = user.points + points;
		levelCheck(user.points, (level, title)=>{
			user.level = level;
			user.level_title = title
			user.avatar = selectAvatar(user.level, user.avatar);
			user.save().then((user)=>{
				cb(null, user);
			}).catch(err=>{
				cb(err)
			});
		})
	})
}

module.exports = {
	finishFiction: (userId, cb)=>{
		// 1 for reading 2 last chapters
		var points = 1/2;
		addPoints(userId, points, (err, user)=>{
			cb(err, user)
		});
	},
	rateBook: (userId, cb)=>{
		// 1 for rating book
		var points = 1;
		addPoints(userId, points, (err, user)=>{
			cb(err, user)
		});
	},
	comment: (userId, cb)=>{
		// 1 for 4 comments left
		var points = 1/4;
		addPoints(userId, points, (err, user)=>{
			cb(err, user)
		});
	},
	vote: (userId, cb)=>{
		// 1 for voting
		var points = 1;
		addPoints(userId, points, (err, user)=>{
			cb(err, user)
		});
	},
	publish: (userId, cb)=>{
		// 2 for approved book
		var points = 2;
		addPoints(userId, points, (err, user)=>{
			cb(err, user)
		});
	},
	followers: (userId, cb)=>{
		// 1 per 100 followers
		var points = 1/100;
		addPoints(userId, points, (err, user)=>{
			cb(err, user)
		});
	},
	views: (userId, cb)=>{
		// 1 per 4000 views
		var points = 1/4000;
		addPoints(userId, points, (err, user)=>{
			cb(err, user)
		});
	},
	reviews: (userId, cb)=>{
		// 1 per 20 reviews
		var points = 1/20;
		addPoints(userId, points, (err, user)=>{
			cb(err, user)
		});
	},
	chapter: (userId, cb)=>{
		// 1 per chapter added
		var points = 1;
		addPoints(userId, points, (err, user)=>{
			cb(err, user)
		});
	},
	avatars: (userId, cb)=>{
		// return array of correct avatars
		var points = 0;
		addPoints(userId, points, (err, user)=>{
			cb(err, user)
		});
	}
}
