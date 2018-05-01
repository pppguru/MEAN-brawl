const mongoose = require('mongoose');
			mongoose.Promise = require('bluebird');

const	Schema = mongoose.Schema;

if(process.env.NODE_ENV == 'production'){
	var mongo =  mongoose.connect('mongodb://localhost/bookbrawl')
}else{
	var mongo = mongoose.connect('mongodb://adminuser:bookbrawl@ds155080.mlab.com:55080/bb-dev')
}

mongoose.connection.on('connected', ()=>{console.log('Connected to DB');});
mongoose.connection.on('error', ()=>{throw new Error('Cannot connect to DB');});

const userSchema = new Schema({
	email: String,
	password: String,
	name: String,
	bday: Date,
	gender: String,
	role: Number,
	genres: [],
	themes: [],
	level_title: String,
	level: Number,
	points: Number,
	avatar: String,
	social_media: {},
	followers: [{type:Schema.Types.ObjectId}],
	following_authors: [{type:Schema.Types.ObjectId}],
	following_books: [{type:Schema.Types.ObjectId, ref:'Books'}],
	last_active: { type: Date, default: Date.now },
	status: Number,
	token: String,
	reset_request: Date,
	newsletter: Boolean,
	searches: []
});

const bookSchema = new Schema({
	title: String,
	cover: String,
	author: { type: Schema.Types.ObjectId, ref: 'Users' },
	type: String,
	description: String,
	genre: String,
	tags: [],
	warnings: [],
	status: Number,
	followers: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
	viewed_by: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
	last_viewed:{},
	featured: Boolean,
	in_library: Boolean,
	social_media: {},
	rating: {type:Number, default: 0},
	brawl_submit: Boolean,
	brawls: [{ type: Schema.Types.ObjectId, ref: 'Brawls' }],
	updated_at: { type: Date, default: Date.now },
	visits : {type:Number, default: 0},
});

const chapterSchema = new Schema({
	book_id: { type: Schema.Types.ObjectId, ref: 'Books' },
	number: Number,
	name: String,
	content: String,
	status: Number,
	updated_at: { type: Date, default: Date.now },
	viewed_by: {}
});

const commentSchema = new Schema({
	book_id: { type: Schema.Types.ObjectId, ref: 'Books' },
	chapter_id: { type: Schema.Types.ObjectId, ref: 'Chapters' },
	content: String,
	author: { type: Schema.Types.ObjectId, ref: 'Users' },
	status: Number
})

const brawlSchema = new Schema({
	book_a: { type: Schema.Types.ObjectId, ref: 'Books' },
	book_b: { type: Schema.Types.ObjectId, ref: 'Books' },
	book_a_vote: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
	book_b_vote: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
	status: Number,
	updated_at: { type: Date, default: Date.now }
})

const reviewSchema = new Schema({
	book_id: { type: Schema.Types.ObjectId, ref: 'Books' },
	content: String,
	rating: Number,
	author: {type: Schema.Types.ObjectId, ref: 'Users' },
	status: Number
})

const claimSchema = new Schema({
	book: { type: Schema.Types.ObjectId, ref: 'Books' },
	reporter: {type: Schema.Types.ObjectId, ref: 'Users' },
	content: String,
	status: {type: Number, default: 1}
})

const adSchema = new Schema({
	page: String,
	ads: Boolean
})

const genreSchema = new Schema({
	name: String
})

const tagSchema = new Schema({
	name: String
})

const warningSchema = new Schema({
  name: String
})

const schema = {
	user: mongo.model('Users', userSchema),
	book: mongo.model('Books', bookSchema),
	chapter: mongo.model('Chapters', chapterSchema),
	comment: mongo.model('Comments', commentSchema),
	brawl: mongo.model('Brawls', brawlSchema),
	review: mongo.model('Reviews', reviewSchema),
	claim: mongo.model('Claims', claimSchema),
	ad: mongo.model('Ads', adSchema),
	genre: mongo.model('Genres', genreSchema),
  tag: mongo.model('Tags', tagSchema),
  warning: mongo.model('Warnings', warningSchema)
}

exports.mongo = mongo;
exports.schema = schema;
