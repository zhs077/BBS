/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-31
 * Time: 上午11:53
 * To change this template use File | Settings | File Templates.
 */

var pool = require('./db_m');

function Reset_Pass(reset_pass){
    this.name = reset_pass.name;
    this.keys = reset_pass.keys;
    this.timeout = reset_pass.timeout;
}
module.exports=Reset_Pass;


Reset_Pass.prototype.save=function(callback){
    var reset = {
        name:this.name,
        keys:this.keys,
        timeout:this.timeout
    }
    pool.acquire(function(err,db){
        if (err) {
            return callback(err);
        }
        db.collection('reset_pass').save(reset,function(err,result){
            pool.release(db);
            callback(err,result);
        });

    });
}

Reset_Pass.delete=function(name,callback){

    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('reset_pass').remove({name:name},function(err){
            pool.release(db);
            callback(err);
        })
    });
}
Reset_Pass.get=function(name,callback){

    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('reset_pass').findOne({name:name},function(err,reset){
            pool.release(db);
            callback(err,reset);
        })
    });
};





