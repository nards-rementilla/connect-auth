

var config = module.exports = {
		
  AUTH_URL : "dev-api.accounts.smartnet.ph",
  AUTHWEB_URL : "dev-accounts.smartnet.ph",
  PROFILE_URL : "dev-api.profiles.smartnet.ph",
  PROFILEWEB_URL : "dev-profiles.smartnet.ph",
  PRIVATE_KEY : '/opt/local/share/keys/pri0001.pem',
  SMS_SERVER : 'http://203.172.31.225:8080',
  PORT : 8080,
  PK_ID : '1',
  getPublicKey : function(pk_id){
	  return "/opt/local/share/keys/"+pk_id+".pem";
  },
  STATIC_URL : 'http://dev-static.profiles.smartnet.ph'
};


module.exports.global = function(req,res,next){

	req.global = config;
	return next();
};
