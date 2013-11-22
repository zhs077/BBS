/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-30
 * Time: 下午8:19
 * To change this template use File | Settings | File Templates.
 */
var pool = require('./db_m');


function Active_Account(active_count){
    this.name = active_count.name;
    this.keys = active_count.keys;
   // this.timeout = active_count.timeout;

}
module.exports = Active_Account;

Active_Account.prototype.save=function(callback){

    var account = {
        name:this.name,
        keys : this.keys,
        timeout: this.timeout
    }
    console.log("account"+ account);
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
            }
            db.collection('active_account').save(account,function(err){
                pool.release(db);
                callback(err);
            });
    });

}
/**
 *
 * @param account
 * @param callback
 */
Active_Account.get=function(account,callback){

    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('active_account').findOne({"name":account.name,"keys":account.keys},function(err,account){
            pool.release(db);
            callback(err,account);
        });
    });
}
//更新激活状态
Active_Account.update_active=function(account,callback){
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('active_account').update({"name":account.name,"keys":account.keys},{$set:{"active":1}},function(err){
            pool.release(db);
            callback(err);
        });
    });
};


