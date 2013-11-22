/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-5-21
 * Time: 上午9:50
 * To change this template use File | Settings | File Templates.
 */
var settings = require('../setting')
    ,mongodb = require('mongodb')
    ,poolModule = require('generic-pool')
    ,GridStore = mongodb.GridStore;



//var pool = poolModule.Pool({
//    name : 'mongodb',
//    create : function(callback){
//        var server_options = {'auto_reconnect':false,poolSize:1};
//        var db_options = {w:-1};
//        var mongoserver = new mongodb.Server('localhost',27017,server_options);
//        var db = new mongodb.Db('test',mongoserver,db_options);
//        db.open(function(err,db){
//            if(err){
//                return callback(err);
//            }
//            callback(null,db);
//        });
//    },
//    destroy:function(db){db.close()},
//    max : 10,
//    idleTimeoutMillis:30000,
//    log:false
//});

//var pool = poolModule.Pool({
//    name : 'mongodb',
//    create : function(callback){
//
//        mongodb.MongoClient.connect('mongodb://localhost/test',{
//            server:{poolSize:1}
//        },function(err,db){
//
//            callback(err,db);
//        });
//    },
//    destroy:function(db){db.close()},
//    max : 10,
//    idleTimeoutMillis:3000,
//    log:true
//});

var pool = poolModule.Pool({
    name : 'mongodb',
    create : function(callback){
        var server_options = {'auto_reconnect':false,poolSize:1};
        var db_options = {w:-1};
        var mongoserver = new mongodb.Server(settings.mongodb_host,settings.mongodb_port,server_options);
        var db = new mongodb.Db('BBS',mongoserver,db_options);
        db.open(function(err,db){
            if(err){
                return callback(err);
            }
            db.authenticate('sa','sa',function(err,result){
                if( err|| result == false){
                    console.log("authenticate fails");
                    return callback(err);

                }else{
                    callback(null,db);
                }

            })

        });
    },
    destroy:function(db){db.close()},
    max : 5,
    idleTimeoutMillis:3000,
    log:true
});
module.exports = pool;
