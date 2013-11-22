/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-5-21
 * Time: 上午11:07
 * To change this template use File | Settings | File Templates.
 */




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

var pool = require('./db_m');
var GridStore = require('./gridStore_m');
var fs = require('fs');
var nodemailer = require('nodemailer');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.picture_name = user.picture_name;
    this.join_time = user.join_time,
    this.address = user.address;
    this.sign = user.sign;
    this.email = user.email;
    this.points = user.points; //积分
    this.active = user.active;//是否通过邮件激活账号
    this.receive_at_mail = user.receive_at_mail;//被回复邮件提醒

}

module.exports = User;

User.prototype.save = function save(callback) {
    var user = {
        name:this.name,
        password:this.password,
        email:this.email,
        points:0,
        picture_name: this.name+".png",
        join_time:this.join_time,
        receive_at_mail:this.receive_at_mail,
        sign:this.sign,
        address:this.address

    };

    pool.acquire(function (err, db) {
        if (err) {
            return callback(err);
        }
        else {
            db.collection('user').save(user,function(err,result){
                pool.release(db);
                
                callback(err,result);
            });

//            db.collection('user', function (err, collection) {
//
//                if(err){
//                   pool.release();
//                    return callback(err);
//                }
//                collection.ensureIndex('name',{unique:true});
//
//                collection.insert(user,{safe:true},function(err,user){
//                    pool.release();
//                    callback(err,user);
//
//                });
//
//
//            });

        }
    });


}

User.get = function get(username,callback){

     pool.acquire(function(err,db){
        if (err) {
            return callback(err);
        }
         db.collection('user').findOne({name:username},function(err,doc){
             pool.release(db);
             if(err){
               callback(err);
          }
             else{
                 callback(err,doc);
             }
         });
//        db.collection('user',function(err,collection){
//           if(err){
//               pool.release();
//               return callback(err);
//           }
//            collection.findOne({name:username},function(err,doc){
//
//                pool.release();
//                if(doc){
//                    var user = new User(doc);
//                    callback(err,user);
//                }
//                else{
//                    callback(err,null);
//                }
//
//            });
//        });


    });

}


User.savePicture=function(filename,callback){
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }

//        var gridStore = new GridStore(db,1234,"zhs.jpg",'w');
//        console.log("gridStore:"+gridStore);
//        gridStore.writeFile("F:\\test.jpg",function(err){
//            console.log(err);
//        })
//        GridStore.unlink(db, 'zhs.jpg', function (err) {
//            console.log('delete zhs.jpg'+err);
//        });

        GridStore.read(db,"zhs.jpg",function(er,data){
            console.log(data);
            var file_stream = fs.createWriteStream("./12.jpg", {flags:"w", encoding:"binary"});
            file_stream.write(data);
            file_stream.end();

        });
    });

}

User.prototype.update_info=function(callback){
    var user= {
        name:this.name,
        address:this.address,
        sign:this.sign,
        picture_name:this.picture_name,
        receive_at_mail:this.receive_at_mail
    }
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('user').update({name:user.name},{$set:{address:user.address,sign:user.sign,picture_name:user.picture_name,receive_at_mail:user.receive_at_mail}},
        function(err){
            pool.release(db);
            callback(err);
        });
    });
}

User.prototype.update_password=function(callback){
    var user= {
        name:this.name,
       password:this.password
    }
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('user').update({name:user.name},{$set:{password:user.password}},
            function(err){
                pool.release(db);
                callback(err);
            });
    });
}

//更新积分
User.prototype.update_points=function(callback){
    var user= {
        name:this.name,
        points:this.points
    }
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('user').update({name:user.name},{$set:{points:user.points}},
            function(err){
                pool.release(db);
                callback(err);
            });
    });
}
//判断邮箱是不是被注册
User.get_email=function(email,callback){
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('user').findOne({email:email},function(err,user){
                pool.release(db);
                callback(err,user);
            });
    });
}
////获取激活状态
//User.get_active=function(name,callback){
//    pool.acquire(function(err,db){
//        if(err){
//            return callback(err);
//        }
//        db.collection('user').findOne({name:name},function(err,user){
//            pool.release(db);
//            callback(err,user);
//        });
//    });
//}
//更新激活状态
User.update_active=function(name,callback){
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('user').update({name:name},{$set:{active:1}},function(err){
            pool.release(db);
            callback(err);
        });
    });
}
