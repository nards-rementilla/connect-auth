var async = require('async');
var crypto = require('crypto');
var email = require('../../../../library/email.js');
var hash = require('../../../../library/passwordHash.js');
module.exports = function(req,res){
	
	var ERROR = {
			email_invalid : {
				code : "INV_EMAI",
				message : "Invalid or Missing Email Address",
				param : "email",
				value : req.body.email
			},
			password_invalid : {
				code : "INV_PASS",
				message : "Invalid or Missing password",
				param : "password",
				value : req.body.password
			},
			internal_dberror : {
				code : "DBFAILURE",
				message: "Unable to save record",
			},
			duplicate_email : {
				code : "DUP_MIN",
				message : "Duplicate email address",
				param : "email",
				value : req.body.email
			},
			duplicate_mobile : {
				code : "DUP_MIN",
				message : "Duplicate Mobile Number",
				param : "mobile",
				value : req.body.mobile
			},
			token_invalid : {
				code : "INV_TOKE",
				message : "Invalid or Missing token",
				param : "token",
				value : req.body.token
			},
			token_unauth : {
				code : "UNA_TOKE",
				message : "Unauthorize token",
				param : "token",
				value : req.body.token
			}
	};
	console.log(req.body);
	if(typeof req.body.email == 'undefined' || !validateEmail(req.body.email)){
		res.json(400,ERROR.email_invalid);
	}
	else if(typeof req.body.password == 'undefined' || !req.body.password.length >=6){
		res.json(400,ERROR.password_invalid);
	}
	else if(typeof req.body.mobile == 'undefined' || !req.body.mobile.length >=10){
		res.json(400,ERROR.min_invalid);
	}
	else if(typeof req.body.puk1 == 'undefined' || !req.body.puk1.length >=5){
		res.json(400,ERROR.puk1_invalid);
	}
	else{
		
		async.auto({
			 validate_puk: function(callback){
				 var content = {},condition = {};
				 condition.mobile = req.body.mobile;
				 condition.puk1 = req.body.puk1;
				 content.collection = 'puklist';
			     content.query = condition;
			     content.columns = {};
			     content.sorting = {};
			     
			     req.model.read(content,function(err,data){
			        	if(err){
			        		callback(ERROR.internal_dberror);
			        	}
			        	else if(data.length == 0){
			        		callback(ERROR.puk1_unreg);
			        	}
			        	else{
			        		callback(null,data);
			        	}
			     });
			 },
			 validate_duplicate: ['validate_puk', function(callback,result){
				 var content = {};
				 var condition = {"$or" : new Array({email:req.body.email},{mobile:req.body.mobile})};
				 content.collection = 'users';
			     content.query = condition;
			     content.columns = {};
			     content.sorting = {};
			     
			     req.model.read(content,function(err,data){
			        	if(err){
			        		callback(ERROR.puk1_unreg);
			        	}
			        	else if(data.length > 0){
			        		if(data[0].mobile == req.body.mobile){
			        			callback(ERROR.duplicate_mobile);
			        		}
			        		if(data[0].email == req.body.email){
			        			callback(ERROR.duplicate_email);
			        		}
			        	}
			        	else{
			        		callback(null,data);
			        	}
			     });
			 }],
			 creation: ['validate_duplicate', function(callback,result){
				 
				 var content = {}, record = {};
				 record.email = req.body.email;
				 record.salt = crypto.randomBytes(256).toString('base64',0,30);
				 record.password = hash.generatePassword(record.salt,req.body.password);
				 record.mobile = req.body.mobile;
				 record.puk1 = req.body.puk1;
				 record.created_at = new Date();
			     content.collection = 'users';
			     content.record = record;
			     req.model.create(content,function(err,data){
			    	 if(err){
			    		 callback(ERROR.internal_dberror);
			    	 }
			    	 else{
			    		 callback(null,data);
			    	 }
			     });
			 }],
			 email: ['creation', function(callback,result){
				 var subject = "Welcome to Connect "+ req.body.first_name;
		         var message = "<b>Hi</b>";
		         email.Send(req.body.email,subject,message,function(error,callback){
		         });
		         callback(null,true);
			 }]
			
		},function(error, response){
			if(error){
				res.json(400,error);
			}
			else{
				res.json(200,{"success" : "ok"});
			}
		});
	}
	
};

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 